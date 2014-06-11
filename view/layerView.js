/**
 Description: backbone view for the layer view
 @class LayerView
 **/

var LayerView = Backbone.View.extend({

  id                    : 'layerView',
  template              : '<span id="dl-zapping-digit"></span><div id="data-layer"></div>',
  isVisible             : false,
  _progressBar          : null,   // ProgressBar class instance
  _ppa                  : null,   // ProgramPictureAnimation class instance
  _video                : null,   // VideoComponent class instance
  _channel              : null,   // Current Channel instance
  _flowerNode           : null,   // Reference on flower container node
  _zappingInput         : [],     // Array of inputs type by the user to zap
  _zappingNode          : null,   // Reference on zapping numbers node
  _zappingTimer         : null,   // Reference on zapping timer
  _hideTimer            : null,   // Reference on hide timer
  


  initialize: function() {
    
    // Binds some... things...
    _.bindAll(this, 'render');
    _.bindAll(this, 'show');
    _.bindAll(this, 'onBackAction');
    _.bindAll(this, 'onUpAction');
    _.bindAll(this, 'onDownAction');
    _.bindAll(this, 'onChannelUpAction');
    _.bindAll(this, 'onChannelDownAction');
    _.bindAll(this, 'onRightAction');
    _.bindAll(this, 'onLeftAction');
    _.bindAll(this, 'onNumberAction');
    
    this._flowerNode = document.getElementById('flower_container');
  },

  render: function() {

    // Retreive view HTML
    this.$el.html((this.isVisible) ? this.template : '');

    // Build data layer
    if (this.isVisible) {
      this.prepareDataLayer();
      this.buildDataLayer(undefined, true);
    }else{
      //on exit view : switch on video textured
      if (this._video){
          this._video.setTexturedMode(true);
      }
    }

    // flower is not supposed to move while displaying INFOLAYER view. Flashlight happens otherwise.
    flowerColorEvent.trigger('noDisplacement', true);

    // Remove view name
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
    // Restablish components normal state
    window.application.userInfoBox.revealUserInfoBox();
    this._flowerNode.classList.remove('flowerInFrontOfVideo');
    this._flowerNode.classList.remove('flowerDisappear');

    // Avoid video bug
    this._video.cancelForceDetexturingRequest();

    // Go back to Hub
    window.application.changeToState(window.application.screens.HUB);
  },

  onOkAction: function() {
    // Do nothing on this view
  },

  onUpAction: function() {
    this.changeChannel(-1);
  },

  onDownAction: function() {
    this.changeChannel(1);
  },

  onChannelUpAction: function() {
    this.changeChannel(1);
  },

  onChannelDownAction: function() {
    this.changeChannel(-1);
  },
  
  onNumberAction: function(number) {
    this.userZapping(number);
  },

  onRightAction: function() {
    // Do nothing on this view
  },

  onLeftAction: function() {
    // Do nothing on this view
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

    this._flowerNode.classList.remove('flowerInFrontOfVideo');
    this._flowerNode.classList.remove('flowerDisappear');
    if (this._hideTimer != null) {
      window.clearTimeout(this._hideTimer);
      this._hideTimer = null;
    }    
  },

  prepareDataLayer: function() {
    var that = this;

    // If it's the first load, send a request to get event poster for each channel
    if ((this._progressBar == null) && (this._video == null)) {
      window.setTimeout(function () {
        var nbCh, i;

        nbCh = window.application.channelList.length;
        for (i = 0; i < nbCh; i++) {
          window.application.channelList[i].getCurrentProgram().getPicture(function (pic) { }, 462, 260);
        };
        
      }, 200);
    }

    // Initialyze plugins
    if (this._progressBar == null)
      this._progressBar = new ProgressBar(window.application.userInfoBox);
    if (this._video == null)
      this._video = window.application.videoComponent;

    this._ppa = new ProgramPictureAnimation(document.getElementById('data-layer'), undefined, undefined, undefined, 1000);

    // Retreive zapping node and bind events
    this._zappingNode = document.getElementById('dl-zapping-digit');
    this._zappingNode.addEventListener( 'webkitTransitionEnd', function () {
      // Reset node
      document.querySelector('.dl-channelNumber').style.display = 'inline-block';
      that._zappingNode.innerText = '';
      that._zappingNode.classList.remove('dl-minimize');

    }, false );

    // Put video fullscreen
    this._video.fullScreenMode(document.getElementById('layerview_container'), VideoAnimationType.NoAnimation);
    if (this._video)
      this._video.setTexturedMode(true);

    // And put flower before video panel 
    this._flowerNode.classList.add('flowerInFrontOfVideo');
  },

  userZapping: function (digit) {
    var that = this;

    // Don't get any keys after 3 digits
    if (this._zappingInput.length >= 3)
    	return;

    // First set the display
    if (this._hideTimer != null) {
      window.clearTimeout(this._hideTimer);
      this._hideTimer = null;
    }
    document.getElementById('data-layer').classList.remove('dl-reveal');
    window.application.userInfoBox.revealUserInfoBox();
    this._flowerNode.classList.remove('flowerDisappear');
    
    // Display and store the number
    this._zappingInput[this._zappingInput.length] = digit;
    this._zappingNode.innerText = this.getZappingNumber().toString();

    // else launch a timer to wait for the next input
    if (this._zappingTimer != null)
    window.clearTimeout(this._zappingTimer);

    this._zappingTimer = window.setTimeout(function () {
      that.performZapping();
    }, 1200);
    
  },

  getZappingNumber: function() {
    var channelNumber = 0,
        length,
        i;

    length = this._zappingInput.length;
    for (i = 0; i < length; i++) {
      channelNumber = channelNumber * 10 + this._zappingInput[i];
    };

    return (channelNumber);
  },

  performZapping: function () {
    var channelNumber = 0,
        isValidChannel = false,
        length,
        i;

    // First remove a potencial zapping timer
    if (this._zappingTimer != null)
      window.clearTimeout(this._hideTimer);
    this._zappingTimer = null;

    // Retreive channel number
    channelNumber = this.getZappingNumber();
    this._zappingInput = [];

    // Check if the channel exists
    length = window.application.channelList.length;
    for (i = 0; i < length; i++) {
      if (window.application.channelList[i].number == channelNumber) {
        window.application.currentChannelIndex = i;
        isValidChannel = true;
        break;
      }
    };

    // If it is a valid channel, zap on it
    if (isValidChannel == true) {
      this.buildDataLayer();
      // Hide the channel number and launch zapping-digit animation
      document.querySelector('.dl-channelNumber').style.display = 'none';
      this._zappingNode.classList.add('dl-minimize');
    }
    // Else hide flower
    else {
      this._zappingNode.innerText = '';
      
      window.application.userInfoBox.hideUserInfoBox();
      this._flowerNode.classList.add('flowerDisappear');
    }

  },

  timeoutToHideDataLayer: function () {
    var footerBarNode,
        that = this;

    this._hideTimer = window.setTimeout(function () {
        footerBarNode = document.getElementById('data-layer');

        // If we exit the view before the timer end, we can have an exception
        // so be sure the node exists before change it
        if (footerBarNode != null) {
          footerBarNode.classList.remove('dl-reveal');
          window.application.userInfoBox.hideUserInfoBox();
          that._flowerNode.classList.add('flowerDisappear');
          that._hideTimer = null;
        }
      },
      3000);
  },

  showDataLayer: function () {
    var footerBarNode = document.getElementById('data-layer');

    // If the "hide timer" is running, reset it
    if (this._hideTimer != null)
      window.clearTimeout(this._hideTimer);

    // Add a class to display the footer bar
    footerBarNode.classList.add('dl-reveal');
    window.application.userInfoBox.revealUserInfoBox();
    this._flowerNode.classList.remove('flowerDisappear');
  },

  changeChannel: function(shift) {
    var nbChannels = window.application.channelList.length;

    // Update current channel index 
    window.application.currentChannelIndex += shift;
    if (window.application.currentChannelIndex >= nbChannels)
      window.application.currentChannelIndex = 0;
    else if (window.application.currentChannelIndex < 0)
      window.application.currentChannelIndex = nbChannels - 1;
    
    // Refresh data layer
    this.buildDataLayer((shift > 0) ? ProgramAnimationType.BottomToTop : ProgramAnimationType.TopToBottom);
  },

  buildDataLayer: function(animation, noZapping) {
    var dataLayerNode = document.createElement('div'),
        channel = window.application.channelList[window.application.currentChannelIndex],
        program = channel.getCurrentProgram(),
        node,
        infoNode,
        pictosNode;

    // Set layer class
    dataLayerNode.className = 'dl-layer';

    // Insert gradient layer
    node = document.createElement('img');
    node.src = 'resources/graphicalAssets/navigation/degrade_flux_big.png';
    node.width = 462;
    node.height = 260;
    dataLayerNode.appendChild(node);

    // Insert channel number
    node = document.createElement('span');
    node.className = 'dl-channelNumber';
    node.innerText = channel.number;
    dataLayerNode.appendChild(node);

    // Insert Channel logo
    node = document.createElement('img');
    node.className = 'dl-channelLogo';
    node.src = channel.logo;
    dataLayerNode.appendChild(node);

    // Insert program picture
    program.getPicture(function (pic) {
      dataLayerNode.style.background = 'rgba(' + program.color + ', 0.6) url(' + pic + ') no-repeat top right';
      dataLayerNode.style.backgroundSize = '462px 260px';
    }, 462, 260);

    // Create footer
    node = document.createElement('footer');
    // Set full pic class for live events
    node.classList.add('dl-fullPic');

    // Add time
    infoNode = document.createElement('time');
    infoNode.innerText = program.getFormatedHour();
    node.appendChild(infoNode);

    // Add title
    infoNode = document.createElement('h1');
    infoNode.innerText = program.title;
    node.appendChild(infoNode);
    
    // Add pictos if needed
    if (program.matching || program.videoFormat || program.rating) {
      pictosNode = document.createElement('aside');
      
      if (program.rating) {
        infoNode = document.createElement('img');
        infoNode.src = 'resources/picto/parental/ico_Parental-rating-' + program.rating + '.png';
        pictosNode.appendChild(infoNode);
      }
      if (program.videoFormat) {
        infoNode = document.createElement('img');
        infoNode.src = 'resources/picto/format/ico_' + program.videoFormat + '.png';
        pictosNode.appendChild(infoNode);
      }
      if (program.matching) {
        infoNode = document.createElement('img');
        infoNode.src = 'resources/picto/yourMatch/ico_Your_match_' + program.matching + '.png';
        pictosNode.appendChild(infoNode);
      }

      node.appendChild(pictosNode);
    }

    // Add footer in data layer
    dataLayerNode.appendChild(node);
    
    // Add progress bar
    this._progressBar.displayProgressBar(dataLayerNode, program.startTime, program.endTime, 'bottom: 60px;');

    // If the channel has changed, display the info layer with an animation
    if (animation)
      this._ppa.htmlNodeAnimation(dataLayerNode, animation);
    else
      this._ppa.setCurrentHTMLNode(dataLayerNode);

    // If we have to zap, do it
    if (noZapping == undefined) {
      if ((channel.source) && (channel.source != ''))
        this._video.zapTo(channel.source);
    }

    // Show data layer
    this.showDataLayer();
    this.timeoutToHideDataLayer();
  }


});
