/**
 Description: backbone view for the GRID view
 @class GridView
 **/

/* Defines */
var MAX_HOURS_TO_DISPLAY              = 24; // To display current program + MAX_HOURS_TO_DISPLAY hours
var NB_CHANNEL_TO_DISPLAY_ON_STARTUP  = 7;  // To have a DOM as small as possible, only display the first X channels on startup
var STARTUP_FOCUS_CHANNEL_INDEX       = 2;  // Index of the startup focus channel in channel list 
var MIN_PICTO_X_POS                   = 165;// Min pixel distance for picto area 
var MIN_EVENT_BOX_NO_TIME             = 59; // Min box size for time display
var MIN_EVENT_BOX_MINI_TIME           = 135;// Min box size for half time display (== "16h00" instead of "16h00 > 16h30")
var DELAY_BEFORE_DATAMODEL_REQUEST    = 1000;// Delay to set in setTimeout() before request datas

var GridView = Backbone.View.extend({

  id                    : 'gridView',
  template              : '<time id="date"></time><div id="hours-bar-container"><div id="hours-bar"></div></div><section id="left-panel"></section><section id="grid-panel"><hr class="gp-separator-top"><ul id="gp-slide-panel" class="gp-movable-panel"></ul><ul id="gp-channel-lines" class="gp-movable-panel"></ul></section><section id="channel-panel"><div id="cp-program-pic"></div><ul id="cp-slide-panel"></ul></section>',
  isVisible             : false,
  _ppa                  : null,   // ProgramPictureAnimation class instance
  _progressBar          : null,   // ProgressBar class instance
  _video                : null,   // VideoComponent class instance
  _channelListNode      : null,   // Channel list panel node
  _gridListNode         : null,   // Grid panel node
  _gridSeparatorNode    : null,   // Panel of grid separators
  _currentChannel       : null,   // Reference on the current focussed channel node
  _channelListPos       : null,   // Current channel list container offset pos
  _expandedProgNode     : null,   // Node of the current expanded program if any
  _overlayedNodes       : null,   // List of nodes overlayed by a program
  _currentlineFocus     : null,   // Reference on the current focussed line node in grid
  _gridOffsetPosX       : null,   // Current grid container offset pos on x axis
  _gridOffsetPosY       : null,   // Current grid container offset pos on y axis
  _currentChannelIndex  : null,   // Current channel index in channel list
  _initialTime          : null,   // Initial grid time == launch time
  _channelList          : [],     // Array of Channel instances
  _loadFakeDatas        : false,  // If the data provider is down, set to true to load fake json datas
  _currentDay           : 0,      // Current day display in grid. 0 for today, 1 for the next day, and so on...
  _removeTimerList      : [],     // List of timers for remove event actions

  initialize: function() {
    var index;

    // Binds some... things...
    _.bindAll(this, 'render');
    _.bindAll(this, 'show');
    _.bindAll(this, 'onBackAction');
    _.bindAll(this, 'onUpAction');
    _.bindAll(this, 'onDownAction');
    _.bindAll(this, 'onRightAction');
    _.bindAll(this, 'onLeftAction');

    // Retreive channel list and build usefull array
    this._channelList = window.application.channelList;
    for (index in this._channelList) {
      this._removeTimerList[this._channelList[index].number.toString()] = null;
    };

  },

  render: function() {

    // Retreive view HTML
    this.$el.html((this.isVisible) ? this.template : '');

    if (this.isVisible) {
      // Set view name
      window.application.userInfoBox.setViewName('television');
      
      // Preapre grid to display
      this.prepareGrid();
    }

    return (this);
  },

  show: function(flag) {
    if (this.isVisible != flag) {
      this.el.style.visibility = flag ? 'visible' : 'hidden';
      
      // Change visibility
      this.isVisible = flag;
      
      // Call renderer
      this.render();
    }
  },

  onBackAction: function() {
    window.application.changeToState(window.application.screens.HUB);
  },

  onOkAction: function() {
    // Do nothing on grid
  },

  onUpAction: function() {
    if (this.moveUpDown(1)) {
      this.newFocusProgramAnimation(ProgramAnimationType.TopToBottom);
      flowerColorEvent.trigger('noDisplacement', false);
    }
    else
      flowerColorEvent.trigger('noDisplacement', true);
  },

  onDownAction: function() {
    if (this.moveUpDown(-1)) {
      this.newFocusProgramAnimation(ProgramAnimationType.BottomToTop);
      flowerColorEvent.trigger('noDisplacement', false);
    }
    else
      flowerColorEvent.trigger('noDisplacement', true);
  },

  onRightAction: function() {
    // Release potencial remove timeout to avoid 
    this.releaseRemoveEventTimeout();
    
    if (this.moveLeftRight(1)) {
      this.newFocusProgramAnimation(ProgramAnimationType.RightToLeft);
      flowerColorEvent.trigger('noDisplacement', false);
    }
    else
      flowerColorEvent.trigger('noDisplacement', true);
  },

  onLeftAction: function() {
    // Release potencial remove timeout
    this.releaseRemoveEventTimeout();

    if (this.moveLeftRight(-1)) {
      this.newFocusProgramAnimation(ProgramAnimationType.LeftToRight);
      flowerColorEvent.trigger('noDisplacement', false);
    }
    else
      flowerColorEvent.trigger('noDisplacement', true);
  },

  /**
   * Description
   * @method enter
   * @param {} from The previous view 
   * @return no value
   */
  enter: function(from) {
    // activate the view and populate it 
    this.show(true);
	/**************************************/
	/******** PERFORMANCES trick **********/
	/**************************************/
	/*
	var that;
    // zoom enter for the view 
    that = this;
    this.el.addEventListener( 'webkitTransitionEnd', function(e) {
      that.el.removeEventListener( 'webkitTransitionEnd', arguments.callee, false );
		  that.el.className = "";
		
    } );
	*/
    this.el.className = 'view_enter';
  },

  /**
   * Description
   * @method exit
   * @param {} to The next expected view
   * @return no value
   */
  exit: function(to) {
    var that;
    that = this;
    this.el.addEventListener( 'webkitTransitionEnd', function(e) {
      that.el.removeEventListener( 'webkitTransitionEnd', arguments.callee, false );
      that.el.className = "";
    } );    
    
    if (to == 'hubmenu') {
      this.el.className = 'view_zoomout';
    } else {
      this.el.className = 'view_zoomin';
    }
  },

  prepareGrid: function() {
    var listSize = this._channelList.length,
        channel,
        channelPanelHTML = '',
        separatorItems = '',
        i,
        focussedProg;

    // Initialyze plugins
    this._ppa = new ProgramPictureAnimation(document.getElementById('cp-program-pic'), undefined, undefined, window.application.videoComponent);
    this._progressBar = new ProgressBar(window.application.userInfoBox);

    // Get current date / time and display them
    this.setGridDateTime(window.application.userInfoBox.getCurrentTimestamp(), window.application.userInfoBox.getFormatedDate());

    // Retreive panel nodes and position
    this._gridListNode = document.getElementById('gp-slide-panel');
    this._gridOffsetPosY = this._gridListNode.offsetTop;

    // Save launch time and init some values
    this._initialTime = window.application.userInfoBox.getCurrentHourTimestamp();
    this._currentChannelIndex = STARTUP_FOCUS_CHANNEL_INDEX;
    this._currentlineFocus = null;

    // Insert each channel and its events to the grid
    for (i = 0; i < listSize; i++) {

      // Display channel in channel pannels
      channelPanelHTML += '<li class="cp-channel' + ((i == STARTUP_FOCUS_CHANNEL_INDEX) ? ' cp-focus">' : '">') + '<h3>' + this._channelList[i].number + '</h3><img src="' + this._channelList[i].logo + '" ></li>';

      // Display programs in grid if it is visible
      this.addChannelLineInGrid(this._channelList[i], i);
    };

    // Update DOM
    this._channelListNode = document.getElementById('cp-slide-panel');
    this._channelListPos = this._channelListNode.offsetTop;
    this._gridListNode = document.getElementById('gp-slide-panel');
    this._gridOffsetPosY = this._gridListNode.offsetTop;
    this._channelListNode.innerHTML = channelPanelHTML;
    this._gridSeparatorNode = document.getElementById('gp-channel-lines');

    // Get current channel ref
    this._currentChannel = document.querySelector('.cp-focus');

    // Display current program picture and apply program features (color animation, progress bar, etc...)
    focussedProg = this._channelList[this._currentChannelIndex].getCurrentProgram(window.application.userInfoBox.getCurrentHourTimestamp());
    this.newFocusProgramAnimation();

    // Set live program and display live in programe picture
    window.application.videoComponent.displayVideoOnNode(document.getElementById('cp-program-pic'), VideoAnimationType.NoAnimation);
  },



  /*===================================

        GRID INTERNAL FUNCTIONS

  ====================================*/

  expandProgram: function(progNode, context) {
    var expandedSize,
        diff,
        nextNode,
        nextLeft,
        nextWidth
        overlayedNode = null;

    // Retreive program size
    expandedSize = parseInt(progNode.getAttribute('data-expanded-size'), 10);
    diff = expandedSize - parseInt(progNode.getAttribute('data-grid-size'), 10);
    
    // Extend the focussed program
    progNode.style.width = expandedSize + 'px';
    
    // Move the next nodes
    nextNode = progNode.nextSibling;
    while ((nextNode != null) && (diff > 0)) {
      // Retreive node size
      nextLeft = parseInt(nextNode.getAttribute('data-left'), 10);
      nextWidth = parseInt(nextNode.getAttribute('data-grid-size'), 10);

      // Despite the narrowing, the next node is enough to extand the first one
      if (nextWidth > diff) {
        nextNode.style.left = (nextLeft + diff) + 'px';
        nextNode.style.width = (nextWidth - diff) + 'px';

        // Hide time if needed
        if ((nextWidth - diff) < MIN_EVENT_BOX_NO_TIME) {
          // Hide time
          nextNode.classList.add('gp-overlayed-no-time');

          // Display overlayed node
          overlayedNode = document.createElement('div');
          overlayedNode.classList.add('gp-program');
          overlayedNode.classList.add('gp-overlay');
          overlayedNode.style.left = nextLeft + 'px';
          progNode.parentNode.appendChild(overlayedNode);
          nextNode.style.left = (nextLeft + diff + 20) + 'px';
          nextNode.style.width = (nextWidth - diff - 20) + 'px';
          window.setTimeout(function() {
            overlayedNode.style.left = parseInt(progNode.getAttribute('data-left'), 10) + expandedSize + 'px';
          }, 20);
        }
        else if ((nextWidth - diff) < MIN_EVENT_BOX_MINI_TIME)
          nextNode.classList.add('gp-overlayed-mini-time');

        // Nothing more to hide, exit loop
        diff = 0;
      }
      else {
        // If it's the first node overlayed, add the overlayed box after the expanded program
        if (overlayedNode == null) {
          overlayedNode = document.createElement('div');
          overlayedNode.classList.add('gp-program');
          overlayedNode.classList.add('gp-overlay');
          overlayedNode.style.left = nextLeft + 'px';
          progNode.parentNode.appendChild(overlayedNode);
          window.setTimeout(function() {
            if (overlayedNode != null)
              overlayedNode.style.left = parseInt(progNode.getAttribute('data-left'), 10) + expandedSize + 'px';
          }, 20);
          diff += 30;
        }

        // Completely hide this node !
        nextNode.style.left = (nextLeft + nextWidth) + 'px';
        nextNode.style.width = '0';
        diff -= nextWidth;

        nextNode.classList.add('gp-program-overlayed');
      }

      // Remember this node is expanded !
      nextNode.classList.add('gp-program-moved');

      // Go check the next node
      nextNode = nextNode.nextSibling;
    }

    // Retreive all moved nodes and remember the expended node !
    context._overlayedNodes = document.querySelectorAll('.gp-program-moved');
    context._expandedProgNode = progNode;
  },

  restoreProgramSize: function(progNode) {
    var overlayedListSize,
        overlayNode,
        i;

    // Restore program position and with
    this._expandedProgNode.style.width = this._expandedProgNode.getAttribute('data-grid-size') + 'px';
    this._expandedProgNode = null;

    // If there is nodes moved, replace them to their initial position
    if (this._overlayedNodes) {

      overlayedListSize = this._overlayedNodes.length;
      for (i = 0; i < overlayedListSize; i++) {
        this._overlayedNodes[i].style.left = this._overlayedNodes[i].getAttribute('data-left') + 'px';
        this._overlayedNodes[i].style.width = this._overlayedNodes[i].getAttribute('data-grid-size') + 'px';
        
        // Remove all added classes
        this._overlayedNodes[i].classList.remove('gp-program-moved');
        this._overlayedNodes[i].classList.remove('gp-program-overlayed');
        this._overlayedNodes[i].classList.remove('gp-overlayed-no-time');
        this._overlayedNodes[i].classList.remove('gp-overlayed-mini-time');
      };

      this._overlayedNodes = null;

      // if the overlay node was injected in teh page, remove it
      overlayNode = document.querySelector('.gp-overlay');
      if (overlayNode)
        overlayNode.parentNode.removeChild(overlayNode);
    }
  },

  newFocusProgramAnimation: function(effect) {
    var focusProg = this._channelList[this._currentChannelIndex].getFocussedProgram(),
        focusProgNode = document.getElementById('gp-program-' + focusProg.uuid),
        oldProgramFocussed = document.querySelector('.gp-colored-program'),
        context = this;

    if (!focusProgNode)
      return;

    // Apply picture transition
    if (effect) {
      if ((this._currentChannelIndex == STARTUP_FOCUS_CHANNEL_INDEX) &&
        (this._channelList[this._currentChannelIndex].getCurrentProgram(window.application.userInfoBox.getCurrentHourTimestamp()).uuid == focusProg.uuid)) {
        focusProg.getPicture(function (pic) {
          context._ppa.videoAnimation(pic, effect);

          //Start the video colorimetry polling : video is focused
          if(window.application.videoComponent.isVideoAvailable()){
            window.application.videoComponent.startColorimetry();
          }
        });
      }
      else {
          //Stop the video colorimetry polling : video is not focused
        if(window.application.videoComponent.isStartColorimetry()){
          window.application.videoComponent.stopColorimetry();
        }
        window.application.videoComponent.displayVideoInPIP(effect);
        focusProg.getPicture(function (pic) {
          if (pic == undefined)
            pic = 'resources/images/gradient_196x110.png';
          context._ppa.pictureAnimation(pic, effect);
        });
      }
    }

    // Change focus program opacity
    // Remove old one
    if (oldProgramFocussed) {
      oldProgramFocussed.style.backgroundColor = '';
      oldProgramFocussed.classList.remove('gp-colored-program');
    }

    // Apply new one
    focusProg.getColorimetry(function (color) {
      if (color != null)
        focusProgNode.style.backgroundColor = 'rgba(' + color + ', 0.6)';

        //Use the picture colorimetry
        var rgb = parseColor('rgb(' + color + ')');
        flowerColorEvent.trigger("changeColorAccordingToContent", rgb.r, rgb.g, rgb.b);
    });
    focusProgNode.classList.add('gp-colored-program');

    // If there is a program expanded, close it
    if (this._expandedProgNode != null)
      this.restoreProgramSize();

    // If the focus program is expandable, expand it !
    // Add a delay to let checkShortProgram() the time to compute
    window.setTimeout(function() {
      if (focusProgNode.classList.contains('gp-prog-expandable') == true)
        context.expandProgram(focusProgNode, context);
    }, 60);

    // Remove potencial progress bar
    this._progressBar.removeProgressBar();

    // If the current program is a live program, display its progress bar
    if (this._channelList[this._currentChannelIndex].getCurrentProgram(window.application.userInfoBox.getCurrentHourTimestamp()).uuid == focusProg.uuid)
      this._progressBar.displayProgressBar(focusProgNode, focusProg.startTime, focusProg.endTime);

    // Change date if needed
    if (focusProg.day != this._currentDay) {
      document.getElementById('date').innerHTML = window.application.userInfoBox.getFormatedDate(focusProg.day);
      this._currentDay = focusProg.day;
    }
  },

  moveChannelList: function(shift) {
    var newFocusElement,
        oldFocusChannel,
        newFocussedProg,
        newLine;

    // Check if we can move or not
    if (((shift > 0) && (this._currentChannel.previousSibling == null)) || ((shift < 0) && (this._currentChannel.nextSibling == null)))
      return (false);

    // Update current channel
    oldFocusChannel = this._currentChannelIndex;
    this._currentChannelIndex += -1 * shift;
    newFocussedProg = this._channelList[this._currentChannelIndex].getDisplayProgramAt(this._channelList[oldFocusChannel].getFocussedProgram().startTime);
    
    // Update channel list slider pos
    this._channelListPos += 71 * shift;
    this._channelListNode.style.marginTop = this._channelListPos + 'px';

    // Change focus element and populate the new requested line
    if (shift > 0) { // UP
      newFocusElement = this._currentChannel.previousSibling;

      // Populate the top line of the grid
      newLine = this._currentChannelIndex - 2; // The first visible line is 2 index far from the focuss line
      if (newLine >= 0)
        this.populateChannelLine(this._channelList[newLine], newFocussedProg.getGridStartTime(), document.getElementById('gp-line-' + this._channelList[newLine].number));

      // Remove the last visible
      newLine = this._currentChannelIndex + 5;
      if (newLine < this._channelList.length)
        this.removeLine(this._channelList[newLine]);
    }
    else { // Down
      newFocusElement = this._currentChannel.nextSibling;
      
      // Populate the top line of the grid
      newLine = this._currentChannelIndex + 4; // The last visible line is 4 index far from the focuss line
      if (newLine < this._channelList.length)
        this.populateChannelLine(this._channelList[newLine], newFocussedProg.getGridStartTime(), document.getElementById('gp-line-' + this._channelList[newLine].number));
      
      newLine = this._currentChannelIndex - 3;
      if (newLine >= 0)
        this.removeLine(this._channelList[newLine]);
    }

    // In case we jump on a program which starts earlier, try to fill the grid with previous programs
    this.fillGridOnMove(-1, newFocussedProg);

    this._currentChannel.classList.remove('cp-focus');
    newFocusElement.classList.add('cp-focus');

    // Remember new focus element
    this._currentChannel = newFocusElement;

    return (true);
  },

  moveGridVertically: function(shift) {
    var newFocusElement,
        separatorLineFocus = document.querySelector('.gp-separator-focus'),
        newSeparatorFocusElement;

    // Get the currentLine focus if unset yet
    if (this._currentlineFocus == null)
      this._currentlineFocus = document.querySelector('.gp-focus');

    // Update grid list slider pos
    this._gridOffsetPosY += 71 * shift;
    this._gridListNode.style.top = this._gridOffsetPosY + 'px';
    this._gridSeparatorNode.style.top = this._gridOffsetPosY + 'px';    

    // Get focus element in both list
    if (shift > 0) {
      newFocusElement = this._currentlineFocus.previousSibling;
      newSeparatorFocusElement = separatorLineFocus.previousSibling;
    }
    else {
      newFocusElement = this._currentlineFocus.nextSibling;
      newSeparatorFocusElement = separatorLineFocus.nextSibling;
    }

    // Change the focus element
    this._currentlineFocus.classList.remove('gp-focus');
    newFocusElement.classList.add('gp-focus');
    separatorLineFocus.classList.remove('gp-separator-focus');
    newSeparatorFocusElement.classList.add('gp-separator-focus');

    // Remember new focus element
    this._currentlineFocus = newFocusElement;
  },

  moveGridHorizontally: function(focusProgram) {

    this._gridListNode.style.left = (-1 * focusProgram.getProgramPositionInGrid()) + 'px';
    this._gridOffsetPosX = -1 * focusProgram.getProgramPositionInGrid();

    // Update hours bar
    this.moveHourBar(focusProgram.getProgramPositionInGrid());
  },

  moveUpDown: function(shift) {
    var oldChannelIndex = this._currentChannelIndex,
        time,
        newFocussedProg;

    // Move channel panel if possible
    if (this.moveChannelList(shift) == true) {

      // Move the grid vertically
      this.moveGridVertically(shift);

      // Get the start time of the previous focussed program
      time = this._channelList[oldChannelIndex].getFocussedProgram().startTime;
      newFocussedProg = this._channelList[this._currentChannelIndex].getDisplayProgramAt(time);

      // ... And horizontally
      this.moveGridHorizontally(newFocussedProg);

      // Save the new focussed program
      this._channelList[this._currentChannelIndex].setCurrentProgramFocus(newFocussedProg);

      return (true);
    }

    return (false);
  },

  moveLeftRight: function(shift) {
    var channel = this._channelList[this._currentChannelIndex],
        newIndex = channel.getFocussedProgram().index + shift,
        newFocussedProg;

    // If we can move horizontally
    if ((newIndex >= channel.firstProgIndex) && (newIndex <= channel.lastProgIndex)) {
      // Set new focus program
      newFocussedProg = channel.programs[newIndex];
      channel.setCurrentProgramFocus(newFocussedProg);

      // Fill the grid
      this.fillGridOnMove(shift, newFocussedProg);

      // Finally move !
      this.moveGridHorizontally(newFocussedProg);

      return (true);
    }

    return (false);
  },

  fillGridOnMove: function(shift, newFocussedProg) {
    var i,
        max;

    // Add program for all displayed channels
    i = ((this._currentChannelIndex - 2) >= 0) ? (this._currentChannelIndex - 2) : 0;
    max = ((this._currentChannelIndex + 4) >= this._channelList.length) ? (this._channelList.length - 1) : (this._currentChannelIndex + 4);
    while (i <= max) {
      this.fillChannelLine(this._channelList[i], newFocussedProg.getGridStartTime(), shift);
      i++;
    }
  },

  moveHourBar: function(currentProgramPos) {
    var hoursNode = document.getElementById('hours-bar');

    hoursNode.style.marginLeft = (-1 * currentProgramPos) + 'px';
  },

  checkShortProgram: function(progNode) {
    var minRequired,
        eventWidth,
        pictoBoxWidth;

    // If the program is removed from the DOM before the callback, just exit
    if (progNode == null)
      return;

    // Retreive different sizes
    eventWidth = progNode.offsetWidth;
    pictoBoxWidth = progNode.childNodes[3].offsetWidth;

    // Always remember the cell width. Usefull when the previous program is expanded
    progNode.setAttribute('data-grid-size', eventWidth);

    // Calc min size of the box. It's actualy the minimum size needed by the text to propoerly display 
    minRequired = progNode.childNodes[1].offsetWidth + 40;
    if (minRequired < 250)
      minRequired = 250;

    // If the title size is bigger than its box size
    if (eventWidth < minRequired) {
      
      // Save the expanded size in data-attribute
      progNode.setAttribute('data-expanded-size', minRequired);
      eventWidth = minRequired;

      // Add expandable class on this node
      progNode.classList.add('gp-prog-expandable');
    }

    // Check if the box size is large enough to display hours + pictos
    if ((pictoBoxWidth + MIN_PICTO_X_POS) > eventWidth) {
      // Save the expanded size in data-attribute
      progNode.setAttribute('data-expanded-size', pictoBoxWidth + MIN_PICTO_X_POS);
      eventWidth = pictoBoxWidth + MIN_PICTO_X_POS;
       
      // Add expandable class on this node
      progNode.classList.add('gp-prog-expandable');
    }

    // Place picto box
    progNode.childNodes[3].style.left = ((eventWidth > 910) ? (910 - pictoBoxWidth) : (eventWidth - pictoBoxWidth)) - 6 + 'px';
  },

  addChannelLineInGrid: function(channel, currentIndex) {
    var currentProg = null
        isFocus = ((currentIndex == STARTUP_FOCUS_CHANNEL_INDEX) ? true : false),
        gridSeparatorsNode = document.getElementById('gp-channel-lines'),
        separatorItems = document.createElement('li'),
        gridLineNode = document.createElement('li');

    // Set grid line attributes
    gridLineNode.id = 'gp-line-' + channel.number;
    gridLineNode.classList.add('gp-line');
    separatorItems.classList.add('gp-line');

    if (isFocus) {
      gridLineNode.classList.add('gp-focus');
      separatorItems.classList.add('gp-separator-focus');
    }

    // Add line in lines panel
    gridSeparatorsNode.appendChild(separatorItems);

    // Populate the program line only if it is visible
    if (currentIndex < NB_CHANNEL_TO_DISPLAY_ON_STARTUP)
      this.populateChannelLine(channel, this._initialTime, gridLineNode);

    // Add programs in line
    this._gridListNode.appendChild(gridLineNode);

    // If it's the focus line in grid, move the grid next to this program
    if (isFocus) {
      currentProg = channel.getCurrentProgram(window.application.userInfoBox.getCurrentHourTimestamp());
      channel.setCurrentProgramFocus(currentProg);
      this._gridListNode.style.left = (-1 * currentProg.getProgramPositionInGrid()) + 'px';
      this._gridOffsetPosX = -1 * currentProg.getProgramPositionInGrid();
      this.moveHourBar(currentProg.getProgramPositionInGrid());
    }
  },

  populateChannelLine: function(channel, startTime, forceGridLineNode) {
    var channelNode,
        endTime = startTime + 5700000,  // Grid display 90mn of programs
        i;

    if (channel.programs.length <= 0)
      return;

    // Get channel node
    channelNode = (forceGridLineNode) ? forceGridLineNode : document.getElementById('gp-line-' + channel.number);

    // get the index of the first program to display
    i = channel.getCurrentProgram(startTime).index;
    
    // Add programs while their startTime is between start and end time
    while ((channel.programs[i]) && (channel.programs[i].startTime < endTime)) {
      
      // Remember the first displayed program in list
      if ((channel.getFirstProgramIndex() == 0) || (channel.getFirstProgramIndex() == channel.programs[i].index)) {
        
        if (channel.getFirstProgramIndex() == 0) {
          channel.setFirstProgramIndex(channel.getCurrentProgram(this._initialTime).index);
          // Save fake start time for this program.
          channel.programs[channel.getFirstProgramIndex()].gridStartTime = this._initialTime;
        }
        
        if (channel.getFirstProgramIndex() == channel.programs[i].index)
          this.addProgramOnGrid(channelNode, channel.programs[i], true);
        else
          this.addProgramOnGrid(channelNode, channel.programs[i]);
      }
      else
        this.addProgramOnGrid(channelNode, channel.programs[i]);

      i++;
    }
  },

  releaseRemoveEventTimeout: function () {
    var channel;

    // Iterate on array to remove timer
    for (channel in this._removeTimerList) {
      if (this._removeTimerList[channel] != null) {
        window.clearTimeout(this._removeTimerList[channel]);
        this._removeTimerList[channel] = null;
      }
    };
  },

  fillChannelLine: function(channel, startTime, direction) {
    var channelNode = document.getElementById('gp-line-' + channel.number),
        stop,
        i;

    // If we have to fill next program
    if (direction > 0) {
      if (!channelNode.childNodes[channelNode.childNodes.length - 1])
        return;

      // Retreive ID of the last program inserted
      i = parseInt(channelNode.childNodes[channelNode.childNodes.length - 1].getAttribute('data-index'));

      // Grid display 90mn of programs
      stop = startTime + 5700000;

      // Add programs until the display limit
      while ((channel.programs[++i]) && (channel.programs[i].startTime < stop)) {
        // Insert program in grid and update last program index
        this.addProgramOnGrid(channelNode, channel.programs[i]);
      }

      // Remove hidden programs
      this._removeTimerList[channel.number.toString()] = window.setTimeout(function() {
        if (channelNode.childNodes[0]) {
          i = parseInt(channelNode.childNodes[0].getAttribute('data-index'));
          while (channel.programs[i]) {
            
            if (channel.programs[i].endTime <= startTime) {
              channelNode.removeChild(channelNode.childNodes[0]);
              i++;
            }
            else
              break;
          }
        }
      }, 600);
    }
    // Else if we have to fill previous programs
    else {
      if (!channelNode.childNodes[0])
        return;

      // Retreive ID of the first displayed program
      i = parseInt(channelNode.childNodes[0].getAttribute('data-index'));
      stop = channel.getFirstProgramIndex();

      // Add programs while their startTime is between start and end time
      while ((--i >= stop) && (channel.programs[i].endTime > startTime)) {
        
        // Insert program in grid
        if (i == stop)
          this.addProgramOnGrid(channelNode, channel.programs[i], true, true);
        else
          this.addProgramOnGrid(channelNode, channel.programs[i], false, true);
      }

      // Remove hidden programs
      this._removeTimerList[channel.number.toString()] = window.setTimeout(function() {
        if (channelNode.childNodes[channelNode.childNodes.length - 1]) {
          i = parseInt(channelNode.childNodes[channelNode.childNodes.length - 1].getAttribute('data-index'));
          stop = startTime + 5700000;
          while (channel.programs[i]) {
            
            if (channel.programs[i].startTime >= stop) {
              channelNode.removeChild(channelNode.childNodes[channelNode.childNodes.length - 1]);
              i--;
            }
            else
              break;
          }
        }
      }, 600);
    }

  },

  removeLine: function(channel) {
    var channelNode = document.getElementById('gp-line-' + channel.number),
        node = channelNode.childNodes[0];
    
    // Remove all nodes in line
    while (node) {
      channelNode.removeChild(node);
      node = channelNode.childNodes[0];
    }
  },

  addProgramOnGrid: function(channelNode, program, isFirstFocusProgram, insertFirstPosition) {
    var shortPrgChecker = this.checkShortProgram,
        pgrNode = document.createElement('article'),
        timeNode = document.createElement('time'),
        titleNode = document.createElement('h2'),
        genreNode = document.createElement('i'),
        pictoNode = document.createElement('aside'),
        picImgNode,
        initWidth,
        width,
        left;

    // Compute program width / left pos according its properties
    left = program.getProgramPositionInGrid();
    width = program.getProgramSize();

    if (isFirstFocusProgram === true) {
      initWidth = program.getProgramSize(this._initialTime);

      // Snowflake UI wants the current program match from the current time to its end time.
      // So reduce the start program time if needed
      if (program.gridForceTimestampPosition == null) {
        left += width - initWidth;
        program.gridForceTimestampPosition = this._initialTime;
      }
      width = initWidth;
    }

    // Create program node
    pgrNode.id = 'gp-program-' + program.uuid;
    pgrNode.classList.add('gp-program');
    pgrNode.style.left = left + 'px';
    pgrNode.style.width = width + 'px';
    pgrNode.setAttribute('data-left', left);
    pgrNode.setAttribute('data-index', program.index);

    // Create inner nodes...
    timeNode.innerText = program.getFormatedHour();
    titleNode.innerText = program.title;
    genreNode.innerText = program.genre;

    // Pictos
    if (program.rating) {
      picImgNode = document.createElement('img');
      picImgNode.src = 'resources/picto/parental/ico_Parental-rating-' + program.rating + '.png';
      pictoNode.appendChild(picImgNode);
    }
    if (program.videoFormat) {
      picImgNode = document.createElement('img');
      picImgNode.src = 'resources/picto/format/ico_' + program.videoFormat + '.png';
      pictoNode.appendChild(picImgNode);
    }
    if (program.matching) {
      picImgNode = document.createElement('img');
      picImgNode.src = 'resources/picto/yourMatch/ico_Your_match_' + program.matching + '.png';
      pictoNode.appendChild(picImgNode);
    }


    // Manage little frames
    if (width < MIN_EVENT_BOX_NO_TIME) {
      timeNode.classList.add('gp-no-time');
    }
    else if (width < MIN_EVENT_BOX_MINI_TIME) {
      if (program.getFormatedStartHourNbDigits() == 1)
        timeNode.classList.add('gp-mini-time-small');
      else
        timeNode.classList.add('gp-mini-time');
    }

    // Populate program node
    pgrNode.appendChild(timeNode);
    pgrNode.appendChild(titleNode);
    pgrNode.appendChild(genreNode);
    pgrNode.appendChild(pictoNode);

    // Insert program node into grid
    if (insertFirstPosition)
      channelNode.insertBefore(pgrNode, channelNode.firstChild);
    else
      channelNode.appendChild(pgrNode);

    // Find shorts programs
    window.setTimeout(function() {
      shortPrgChecker(document.getElementById('gp-program-' + program.uuid));
    }, 50);
  },

  setGridDateTime: function(currentTimestamp, formatedDate) {
    var now = new Date(currentTimestamp),
        size = MAX_HOURS_TO_DISPLAY + 24,
        timeNode,
        hour = 0,
        hoursNode = document.getElementById('hours-bar'),
        containerSize = 1;
        i = 0;

    // Set date
    document.getElementById('date').innerHTML = formatedDate;

    // Fill the hours bar
    while (i++ < size) {
      // Insert hours
      timeNode = document.createElement('time');
      timeNode.innerText = hour + ':00';
      hoursNode.appendChild(timeNode);
      timeNode = document.createElement('time');
      timeNode.innerText = (hour++) + ':30';
      hoursNode.appendChild(timeNode);

      // Update bar size
      containerSize += 600;
      hoursNode.style.width = containerSize + 'px';

      if (hour >= 24)
        hour = 0;
    }
  }

});
