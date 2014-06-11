/* Defines */
var MAX_HOURS_TO_DISPLAY = 24;  // To display current program + MAX_HOURS_TO_DISPLAY hours
var NB_CHANNEL_TO_DISPLAY_ON_STARTUP  = 7;  // To have a DOM as small as possible, only display the first X channels on startup
var STARTUP_FOCUS_CHANNEL_INDEX       = 2;  // Index of the startup focus channel in channel list 
var MIN_PICTO_X_POS                   = 165;// Min pixel distance for picto area 
var MIN_EVENT_BOX_NO_TIME             = 59; // Min box size for time display
var MIN_EVENT_BOX_MINI_TIME           = 135;// Min box size for half time display (== "16h00" instead of "16h00 > 16h30")

var KEYCODES = {
      ARROW_LEFT   : 37,
      ARROW_UP     : 38,
      ARROW_RIGHT  : 39,
      ARROW_DOWN   : 40,
      BACK         : 27
};



/* Properties */
var _userInfoBox,             // User top panel
    _ppa,                     // ProgramPictureAnimation class instance
    _progressBar,             // ProgressBar class instance
    _video,                   // VideoComponent class instance
    _channelListNode,         // Channel list panel node
    _gridListNode,            // Grid panel node
    _gridSeparatorNode,       // Panel of grid separators
    _currentChannel,          // Reference on the current focussed channel node
    _channelListPos,          // Current channel list container offset pos
    _expandedProgNode = null, // Node of the current expanded program if any
    _overlayedNodes = null,   // List of nodes overlayed by a program
    _currentlineFocus = null, // Reference on the current focussed line node in grid
    _gridOffsetPosX,          // Current grid container offset pos on x axis
    _gridOffsetPosY,          // Current grid container offset pos on y axis
    _currentChannelIndex = 2, // Current channel index in channel list
    _initialTime = null,      // Initial grid time == launch time
    _channelList = [];        // User top panel
  	id                    = 'gridView';
  	template              = '<time id="date"></time><div id="hours-bar-container"><div id="hours-bar"></div></div><section id="left-panel"></section><section id="grid-panel"><hr class="gp-separator-top"><ul id="gp-slide-panel" class="gp-movable-panel"></ul><ul id="gp-channel-lines" class="gp-movable-panel"></ul></section><section id="channel-panel"><div id="cp-program-pic"></div><ul id="cp-slide-panel"></ul></section>';
  	isVisible             = false;
  	_ppa                  = null;   // ProgramPictureAnimation class instance




function onKeyPress(event) {
  
  switch (event.keyCode) {
    case KEYCODES.ARROW_UP:
      if (moveUpDown(1))
        newFocusProgramAnimation(ProgramAnimationType.TopToBottom);
      break;
    
    case KEYCODES.ARROW_DOWN:
      if (moveUpDown(-1))
        newFocusProgramAnimation(ProgramAnimationType.BottomToTop);
      break;
    
    case KEYCODES.ARROW_RIGHT:
      if (moveLeftRight(1))
        newFocusProgramAnimation(ProgramAnimationType.RightToLeft);
      break;
    
    case KEYCODES.ARROW_LEFT:
      if (moveLeftRight(-1))
        newFocusProgramAnimation(ProgramAnimationType.LeftToRight);
      break;

    case KEYCODES.BACK:
      window.location.href = 'index.html';
      break;
    
    default:
      console.log('Unknow keycode [' + event.keyCode + ']');
      break;
  }

}

  function expandProgram (progNode, context) {
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
    // debugger
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
  }

  function restoreProgramSize(progNode) {
    var overlayedListSize,
        overlayNode,
        i;

    // Restore program position and with
    _expandedProgNode.style.width = _expandedProgNode.getAttribute('data-grid-size') + 'px';
    _expandedProgNode = null;

    // If there is nodes moved, replace them to their initial position
    if (_overlayedNodes) {

      overlayedListSize = _overlayedNodes.length;
      for (i = 0; i < overlayedListSize; i++) {
        _overlayedNodes[i].style.left = _overlayedNodes[i].getAttribute('data-left') + 'px';
        _overlayedNodes[i].style.width = _overlayedNodes[i].getAttribute('data-grid-size') + 'px';
        
        // Remove all added classes
        _overlayedNodes[i].classList.remove('gp-program-moved');
        _overlayedNodes[i].classList.remove('gp-program-overlayed');
        _overlayedNodes[i].classList.remove('gp-overlayed-no-time');
        _overlayedNodes[i].classList.remove('gp-overlayed-mini-time');
      };

      _overlayedNodes = null;

      // if the overlay node was injected in teh page, remove it
      overlayNode = document.querySelector('.gp-overlay');
      if (overlayNode)
        overlayNode.parentNode.removeChild(overlayNode);
    }
  }

function newFocusProgramAnimation(effect) {
  var focusProg = _channelList[_currentChannelIndex].getFocussedProgram(),
      focusProgNode = document.getElementById('gp-program-' + focusProg.uuid),
      oldProgramFocussed = document.querySelector('.gp-colored-program'),
      overlayedListSize,
	  context = this;
      i;

  if (!focusProgNode)
    return;

  // Apply picture transition
  if (effect) {
      if ((_currentChannelIndex == STARTUP_FOCUS_CHANNEL_INDEX) &&
        (_channelList[_currentChannelIndex].getCurrentProgram(_userInfoBox.getCurrentHourTimestamp()).uuid == focusProg.uuid)) {
        _ppa.videoAnimation(focusProg.image, effect);
    }
    else {
      _video.displayVideoInPIP(effect);
        _ppa.pictureAnimation(focusProg.image, effect);
    }
  }

  // Change focus program opacity
  // Remove old one
  if (oldProgramFocussed) {
    oldProgramFocussed.style.backgroundColor = '';
    oldProgramFocussed.classList.remove('gp-colored-program');
  }

  // Apply new one
  focusProgNode.style.backgroundColor = focusProg.color;
  focusProgNode.classList.add('gp-colored-program');

    // If there is a program expanded, close it
    if (_expandedProgNode != null)
      restoreProgramSize();

  // If the focus program is expandable, expand it !
    // Add a delay to let checkShortProgram() the time to compute
    window.setTimeout(function() {
      if (focusProgNode.classList.contains('gp-prog-expandable') == true)
        expandProgram(focusProgNode, context);
    }, 60);

  // Remove potencial progress bar
    this._progressBar.removeProgressBar();

  // If the current program is a live program, display its progress bar
  if (_channelList[_currentChannelIndex].getCurrentProgram(_userInfoBox.getCurrentHourTimestamp()).uuid == focusProg.uuid)
      _progressBar.displayProgressBar(focusProgNode, focusProg.startTime, focusProg.endTime);
  }

function moveChannelList(shift) {
  var newFocusElement,
      oldFocusChannel,
      newFocussedProg,
      newLine;

  // Check if we can move or not
  if (((shift > 0) && (_currentChannel.previousSibling == null)) || ((shift < 0) && (_currentChannel.nextSibling == null)))
    return (false);

  // Update current channel
  oldFocusChannel = _currentChannelIndex;
  _currentChannelIndex += -1 * shift;
  newFocussedProg = _channelList[_currentChannelIndex].getDisplayProgramAt(_channelList[oldFocusChannel].getFocussedProgram().startTime);
  
  // Update channel list slider pos
  _channelListPos += 71 * shift;
  _channelListNode.style.marginTop = _channelListPos + 'px';

  // Change focus element and populate the new requested line
  if (shift > 0) { // UP
    newFocusElement = _currentChannel.previousSibling;

    // Populate the top line of the grid
    newLine = _currentChannelIndex - 2; // The first visible line is 2 index far from the focuss line
    if (newLine >= 0)
      populateChannelLine(_channelList[newLine], newFocussedProg.getGridStartTime(), document.getElementById('gp-line-' + _channelList[newLine].number));

    // Remove the last visible
    newLine = _currentChannelIndex + 5;
    if (newLine < _channelList.length)
      removeLine(_channelList[newLine]);
  }
  else { // Down
    newFocusElement = _currentChannel.nextSibling;
    
    // Populate the top line of the grid
    newLine = _currentChannelIndex + 4; // The last visible line is 4 index far from the focuss line
    if (newLine < _channelList.length)
      populateChannelLine(_channelList[newLine], newFocussedProg.getGridStartTime(), document.getElementById('gp-line-' + _channelList[newLine].number));
    
    newLine = _currentChannelIndex - 3;
    if (newLine >= 0)
      removeLine(_channelList[newLine]);
  }

  // In case we jump on a program which starts earlier, try to fill the grid with previous programs
  fillGridOnMove(-1, newFocussedProg);

  _currentChannel.classList.remove('cp-focus');
  newFocusElement.classList.add('cp-focus');

  // Remember new focus element
  _currentChannel = newFocusElement;

  return (true);
}

function moveGridVertically(shift) {
  var newFocusElement,
      separatorLineFocus = document.querySelector('.gp-separator-focus'),
      newSeparatorFocusElement;

  // Get the currentLine focus if unset yet
  if (_currentlineFocus == null)
    _currentlineFocus = document.querySelector('.gp-focus');

  // Update grid list slider pos
  _gridOffsetPosY += 71 * shift;
  _gridListNode.style.top = _gridOffsetPosY + 'px';
  _gridSeparatorNode.style.top = _gridOffsetPosY + 'px';
  // _gridListNode.style.webkitTransform = 'translate3d(' + _gridOffsetPosX + 'px, ' + _gridOffsetPosY + 'px, 0)';
  

  // Get focus element in both list
  if (shift > 0) {
    newFocusElement = _currentlineFocus.previousSibling;
    newSeparatorFocusElement = separatorLineFocus.previousSibling;
  }
  else {
    newFocusElement = _currentlineFocus.nextSibling;
    newSeparatorFocusElement = separatorLineFocus.nextSibling;
  }

  // Change the focus element
  _currentlineFocus.classList.remove('gp-focus');
  newFocusElement.classList.add('gp-focus');
  separatorLineFocus.classList.remove('gp-separator-focus');
  newSeparatorFocusElement.classList.add('gp-separator-focus');

  // Remember new focus element
  _currentlineFocus = newFocusElement;
}

function moveGridHorizontally(focusProgram) {

  _gridListNode.style.left = (-1 * focusProgram.getProgramPositionInGrid()) + 'px';
  _gridOffsetPosX = -1 * focusProgram.getProgramPositionInGrid();
  // _gridListNode.style.webkitTransform = 'translate3d(' + _gridOffsetPosX + 'px, ' + _gridOffsetPosY + 'px, 0)';

  // Update hours bar
  moveHourBar(focusProgram.getProgramPositionInGrid());
}

function moveUpDown(shift) {
  var oldChannelIndex = _currentChannelIndex,
      time,
      newFocussedProg;

  // Move channel panel if possible
  if (moveChannelList(shift) == true) {

    // Move the grid vertically
    moveGridVertically(shift);

    // Get the start time of the previous focussed program
    time = _channelList[oldChannelIndex].getFocussedProgram().startTime;
    newFocussedProg = _channelList[_currentChannelIndex].getDisplayProgramAt(time);

    // ... And horizontally
    moveGridHorizontally(newFocussedProg);

    // Save the new focussed program
    _channelList[_currentChannelIndex].setCurrentProgramFocus(newFocussedProg);

    return (true);
  }

  return (false);
}

function moveLeftRight(shift) {
  var channel = _channelList[_currentChannelIndex],
      newIndex = channel.getFocussedProgram().index + shift,
      newFocussedProg;

  // If we can move horizontally
  if ((newIndex >= channel.firstProgIndex) && (newIndex <= channel.lastProgIndex)) {
    // Set new focus program
    newFocussedProg = channel.programs[newIndex];
    channel.setCurrentProgramFocus(newFocussedProg);

    // Fill the grid
    fillGridOnMove(shift, newFocussedProg);

    // Finally move !
    moveGridHorizontally(newFocussedProg);

    return (true);
  }

  return (false);
}

function fillGridOnMove(shift, newFocussedProg) {
  var i,
      max;

  // Add program for all displayed channels
  i = ((_currentChannelIndex - 2) >= 0) ? (_currentChannelIndex - 2) : 0;
  max = ((_currentChannelIndex + 4) >= _channelList.length) ? (_channelList.length - 1) : (_currentChannelIndex + 4);
  while (i <= max) {
    fillChannelLine(_channelList[i], newFocussedProg.getGridStartTime(), shift);
    i++;
  }
}

function moveHourBar(currentProgramPos) {
  var hoursNode = document.getElementById('hours-bar');

  hoursNode.style.marginLeft = (-1 * currentProgramPos) + 'px';
}

function checkShortProgram(progNode) {
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
  }

function addChannelLineInGrid(channel, currentIndex) {
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
      populateChannelLine(channel, _initialTime, gridLineNode);

  // Add programs in line
  _gridListNode.appendChild(gridLineNode);

  // If it's the focus line in grid, move the grid next to this program
  if (isFocus) {
    currentProg = channel.getCurrentProgram(_userInfoBox.getCurrentHourTimestamp());
    channel.setCurrentProgramFocus(currentProg);
      _gridListNode.style.left = (-1 * currentProg.getProgramPositionInGrid()) + 'px';
      _gridOffsetPosX = -1 * currentProg.getProgramPositionInGrid();
      moveHourBar(currentProg.getProgramPositionInGrid());
    }
  }

function populateChannelLine(channel, startTime, forceGridLineNode) {
  var channelNode,
      endTime = startTime + 5700000,  // Grid display 90mn of programs
      i;

  // Get channel node
  channelNode = (forceGridLineNode) ? forceGridLineNode : document.getElementById('gp-line-' + channel.number);

  // get the index of the first program to display
  i = channel.getCurrentProgram(startTime).index;
  
  // Add programs while their startTime is between start and end time
  while ((channel.programs[i]) && (channel.programs[i].startTime < endTime)) {
    
    // Remember the first displayed program in list
    if ((channel.getFirstProgramIndex() == 0) || (channel.getFirstProgramIndex() == channel.programs[i].index)) {
      
      if (channel.getFirstProgramIndex() == 0) {
        channel.setFirstProgramIndex(channel.getCurrentProgram(_initialTime).index);
        // Save fake start time for this program.
        channel.programs[channel.getFirstProgramIndex()].gridStartTime = _initialTime;
      }
      
      if (channel.getFirstProgramIndex() == channel.programs[i].index)
        addProgramOnGrid(channelNode, channel.programs[i], true);
      else
        addProgramOnGrid(channelNode, channel.programs[i]);
    }
    else
      addProgramOnGrid(channelNode, channel.programs[i]);

    // Update the last program index in grid and go to the next program
    i++;
  }
}

function fillChannelLine(channel, startTime, direction) {
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
      addProgramOnGrid(channelNode, channel.programs[i]);
    }

    // Remove hidden programs
    window.setTimeout(function() {
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
        addProgramOnGrid(channelNode, channel.programs[i], true, true);
      else
        addProgramOnGrid(channelNode, channel.programs[i], false, true);
    }

    // Remove hidden programs
    window.setTimeout(function() {
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

}

function removeLine(channel) {
  var channelNode = document.getElementById('gp-line-' + channel.number),
      node = channelNode.childNodes[0];
  
  // remove all nodes in line
  while (node) {
    channelNode.removeChild(node);
    node = channelNode.childNodes[0];
  }
}

function addProgramOnGrid(channelNode, program, isFirstFocusProgram, insertFirstPosition) {
     var shortPrgChecker = checkShortProgram,
        pgrNode = document.createElement('article'),
        timeNode = document.createElement('time'),
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
    initWidth = program.getProgramSize(_userInfoBox.getCurrentHourTimestamp());

    // Snowflake UI wants the current program match from the current time to its end time.
    // So reduce the start program time if needed
    if (program.gridForceTimestampPosition == null) {
      left += width - initWidth;
        program.gridForceTimestampPosition = _initialTime;
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
  window.setTimeout(function () {
      shortPrgChecker(document.getElementById('gp-program-' + program.uuid));
    }, 50);
  }

function onDataReceived(grid) {
  var listSize = grid.live.length,
      channel,
      channelPanelHTML = '',
      separatorItems = '',
      i,
      focussedProg;

  // Retreive panel nodes and position
  _gridListNode = document.getElementById('gp-slide-panel');
  _gridOffsetPosY = _gridListNode.offsetTop;
  
  // TEST PERF =====================================================
  /*console.log('[TEST] - Started');
  var startTime = new Date().getTime();*/
  // TEST PERF =====================================================

  // Parse server response
  for (i = 0; i < listSize; i++) {
    // Create new channel instance
    channel = new Channel(grid.live[i]);

    // Add programs
    channel.populatePrograms(grid.live[i].programs);

    // Display channel in channel pannels
    channelPanelHTML += '<li class="cp-channel' + ((i == 2) ? ' cp-focus">' : '">') + '<h3>' + channel.number + '</h3><img src="' + channel.logo + '" ></li>';

    // Display programs in grid
    //addChannelLineInGrid(channel, ((i == 2) ? true : false));
	addChannelLineInGrid(channel, i);

    // Finnally add channel in channelList
    _channelList.push(channel);
  };

  // TEST PERF =====================================================
  /*var endTime = new Date().getTime();
  console.log('[TEST] - Ended');
  console.log('[TEST] - Execution time: [' + (endTime - startTime) + 'ms]');
  document.querySelector('body').innerHTML += '<h1 style="position: absolute;right: 40px;color: darkorange;font-size: 50px;">[' + (endTime - startTime) + 'ms]</h1>';*/
  // TEST PERF =====================================================

  // Update DOM
  _channelListNode = document.getElementById('cp-slide-panel');
  _channelListPos = _channelListNode.offsetTop;
  _gridListNode = document.getElementById('gp-slide-panel');
  _gridOffsetPosY = _gridListNode.offsetTop;
  _channelListNode.innerHTML = channelPanelHTML;
  _gridSeparatorNode = document.getElementById('gp-channel-lines');

  // Get current channel ref
  _currentChannel = document.querySelector('.cp-focus');

  // Display current program picture and apply program features (color animation, progress bar, etc...)
  focussedProg = _channelList[_currentChannelIndex].getCurrentProgram(_userInfoBox.getCurrentHourTimestamp());
  newFocusProgramAnimation();

  // Set live program and display live in programe picture
  document.querySelector('.gp-colored-program').classList.add('gp-live');
  _video.displayVideoOnNode(document.getElementById('cp-program-pic'), VideoAnimationType.NoAnimation);
}

function setGridDateTime(currentTimestamp, formatedDate) {
  var now = new Date(currentTimestamp),
      hour = 0,
      hoursNode = document.getElementById('hours-bar'),
      containerSize = 1;
      i = 0;

  // Set date
  document.getElementById('date').innerHTML = formatedDate;

  // Fill the hours bar
  while (i++ < MAX_HOURS_TO_DISPLAY) {
    // Insert hours
    hoursNode.innerHTML += '<time>' + hour + ':00</time>';
    hoursNode.innerHTML += '<time>' + hour++ + ':30</time>';

    // Update bar size
    containerSize += 600;
    hoursNode.style.width = containerSize + 'px';

    if (hour >= 24)
      hour = 0;
  }
}

function init() {

  // Display user info box
  _userInfoBox = new UserInfosBox(document.querySelector('body'), function() {
    _userInfoBox.setUserName('Scarlett');
    _userInfoBox.setViewName('television');

    // initialyze plugins
    _video = new VideoComponent(document.querySelector('body'), true);
    _ppa = new ProgramPictureAnimation(document.getElementById('cp-program-pic'), undefined, undefined, _video);

    // Instanciate progressBar component
    _progressBar = new ProgressBar(_userInfoBox);
    
    // Get current date / time and display them
    setGridDateTime(_userInfoBox.getCurrentTimestamp(), _userInfoBox.getFormatedDate());

    // Retreive Grid informations
    xhrDataGrid = new XMLHttpRequest();
    xhrDataGrid.onreadystatechange = function() {
      if ((xhrDataGrid.readyState == 4) && (xhrDataGrid.status == 200))
        onDataReceived(JSON.parse(xhrDataGrid.responseText));
    };
    xhrDataGrid.open('GET', 'view/gridDatas.json');
    xhrDataGrid.send();

  });
  // }, 1396944219000);

  // Bind Key events
  window.addEventListener('keydown', onKeyPress);


}

window.onload = init;