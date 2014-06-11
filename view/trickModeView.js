/**
 Description: backbone view for the Trick Mode view
 @class TrickModeView
 **/

var TM_START_MENU_FOCUS = 2;  // Id of the focussed item on startup in picto list

var TrickModeView = Backbone.View.extend({

  id                    : 'trickModeView',
  template              : '<div id="tm-big-icon"><img src="" /></div><footer id="trickMode-container" class="tm-show-footer"><div id="tm-progress"><time class="tm-time"></time><time class="tm-time"></time></div></footer>',
  isVisible             : false,
  _asset                : null,   // The asset choosen by the user
  _progressBar          : null,   // ProgressBar class instance
  _pbTextNode           : null,   // ProgressBar top text node
  _video                : null,   // VideoComponent class instance
  _videoSpeed           : 1,      // Current video speed
  _bigIconNode          : null,   // Reference on the big action icon node
  _timerBigIcon         : null,   // Reference on the big action icon timer
  _hideBarTimer         : null,   // Reference on the 3s timer which hide the footer bar
  _currentSource        : '',     // When we change video source, remember the last source to restore it on exit
  _focusItem            : TM_START_MENU_FOCUS, // id of the focussed item in _actionList
  _actionList           : [{
                              item:       'ico_SkipBack_',
                              available:  true
                            },
                            {
                              item:       'ico_FastRewind_',
                              available:  true
                            },
                            {
                              item:       'ico_Pause_',
                              available:  true
                            },
                            {
                              item:       'ico_Stop_',
                              available:  true
                            },
                            {
                              item:       'ico_Record_',
                              available:  false
                            },
                            {
                              item:       'ico_FastForward_',
                              available:  true
                            },
                            {
                              item:       'ico_Next_',
                              available:  false
                            },
                            {
                              item:       'ico_Collapse_',
                              available:  true
                            }],
  


  initialize: function(options) {
    
    // Binds some... things...
    _.bindAll(this, 'render');
    _.bindAll(this, 'show');
    _.bindAll(this, 'retreiveAsset');
    _.bindAll(this, 'onBackAction');
    _.bindAll(this, 'onUpAction');
    _.bindAll(this, 'onDownAction');
    _.bindAll(this, 'onRightAction');
    _.bindAll(this, 'onLeftAction');
    
    // Bind the "custom application" event
    options.trickModeAssetEvent.bind('setAssetObj', this.retreiveAsset);
  },

  render: function() {

    // Retreive view HTML
    this.$el.html((this.isVisible) ? this.template : '');

    // Build data layer
    if (this.isVisible) {

      // Get reference on usefull components
      if (this._progressBar == null)
        this._progressBar = new ProgressBar(window.application.userInfoBox);
      if (this._video == null)
        this._video = window.application.videoComponent;
  
      this.buildTrickMode();
    }else{
      //on exit view
      if (this._video) {
        // Restore source and switch on video textured
        this._video.zapTo(this._currentSource);
        this._video.setTexturedMode(true);
      }
    }

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
    this.returnToVodView();
  },

  onOkAction: function() {
    var bigIcon = null,
        that = this;

    // Show the footer bar
    this.showFooterBar();
    
    switch (this._focusItem) {
      case 0: // Skip back
        // Simply put the video current time to 0
        this._video.getVideoInstance().currentTime = 0;
        bigIcon = 'ico_SkipBack_';
        break;

      case 1: // Fast rewind
        bigIcon = this.changeVideoSpeed(-1);
        break;

      case 2: // Play / pause
        bigIcon = this.playPauseAction();
        break;

      case 3: // Stop
      case 7: // Collapse
        this.returnToVodView();
        break;

      case 5: // Fast forward
        bigIcon = this.changeVideoSpeed(1);
        break;

      default:
        console.log('[ERROR][TrickModeView.onOkAction] Unknow action for item ' + this._focusItem);
        break;
    }
    
    // If we have to display a big icon
    if (bigIcon != null) {
      this._bigIconNode.src = 'resources/trickMode/' + bigIcon + 'PRESSED.png';
      this._bigIconNode.classList.add('tm-show-icon');

      // If the user press pause, don't hide the footer bar. Else, perform some hide
      if (bigIcon != 'ico_Pause_') {
        
        // Avoid the big action icon to blind from a previous key press
        if (this._timerBigIcon != null)
          window.clearTimeout(this._timerBigIcon);
        
        // Hide the big action icon after 2s
        this._timerBigIcon = window.setTimeout(function () {
          that._bigIconNode.classList.remove('tm-show-icon');
          that._timerBigIcon = null;
        }, 2000);

        // ... Then hide the footer bar itself after 3s
        this.timeoutToHideFooterBar();
      }
    }

  },

  onUpAction: function() {
    // Do nothing on this view
  },

  onDownAction: function() {
    // Do nothing on this view
  },

  onRightAction: function() {
    var newFocusAction;

    // Show the footer bar
    this.showFooterBar();

    // If we can go to the right
    if (this._focusItem + 1 < this._actionList.length) {
      // Unfocus current item by changing its picture
      document.getElementById('tm-picto-' + this._focusItem).src = 'resources/trickMode/' + this._actionList[this._focusItem].item + 'OFF.png';

      // Go to the next available action
      newFocusAction = document.getElementById('tm-picto-' + (++this._focusItem));
      while (newFocusAction.classList.contains('tm-picto-unuse'))
        newFocusAction = document.getElementById('tm-picto-' + (++this._focusItem));
      
      // Apply new focus picture
      newFocusAction.src = 'resources/trickMode/' + this._actionList[this._focusItem].item + 'ON.png';
    }

    // Hide the footer bar after 3s if nothing happens
    this.timeoutToHideFooterBar();
  },

  onLeftAction: function() {
    var newFocusAction;

    // Show the footer bar
    this.showFooterBar();

    // If we can go to the left
    if (this._focusItem - 1 >= 0) {
      // Unfocus current item by changing its picture
      document.getElementById('tm-picto-' + this._focusItem).src = 'resources/trickMode/' + this._actionList[this._focusItem].item + 'OFF.png';

      // Go to the next available action
      newFocusAction = document.getElementById('tm-picto-' + (--this._focusItem));
      while (newFocusAction.classList.contains('tm-picto-unuse'))
        newFocusAction = document.getElementById('tm-picto-' + (--this._focusItem));
      
      // Apply new focus picture
      newFocusAction.src = 'resources/trickMode/' + this._actionList[this._focusItem].item + 'ON.png';
    }

    // Hide the footer bar after 3s if nothing happens
    this.timeoutToHideFooterBar();
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
    var that;
    // zoom enter for the view 
    that = this;
    this.el.addEventListener( 'webkitTransitionEnd', function(e) {
      that.el.removeEventListener( 'webkitTransitionEnd', arguments.callee, false );
      //that.el.className = "";
    } );
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
      window.application.states[window.application.screens.VOD]._forceMenuItem = 2;
      this.el.className = 'view_zoomin';
    }
  },






  retreiveAsset: function (assetInfos) {
    this._asset = assetInfos;
  },

  returnToVodView: function () {
    // Replace the video in PIP
    this._video.displayVideoInPIP(VideoAnimationType.TopToBottom);

    // Go back VOD View
    window.application.changeToState(window.application.screens.VOD);
  },

  playPauseAction: function () {
    var actionIcon;

    if (this._video.getVideoInstance().paused == false) {
      // Put video on pause state
      this._video.getVideoInstance().pause();

      // Change picto
      this._actionList[this._focusItem].item = 'ico_Play_';
      actionIcon = 'ico_Pause_';
    }
    else {
      // reset speed and put video on play state
      this._video.getVideoInstance().playbackRate = 1;
      this._video.getVideoInstance().play();
      
      // Change picto
      this._actionList[this._focusItem].item = 'ico_Pause_';
      actionIcon = 'ico_Play_';
    }
    
    document.getElementById('tm-picto-' + this._focusItem).src = 'resources/trickMode/' + this._actionList[this._focusItem].item + 'ON.png';

    return (actionIcon);
  },

  changeVideoSpeed: function (direction) {
    var video = this._video.getVideoInstance(),
        currentSpeed = Math.abs(video.playbackRate),
        actionIcon = null;

    // If the direction change, reset the speed
    if (direction * video.playbackRate < 0)
      currentSpeed = 1;

    // Set new speed
    if ((currentSpeed == 1) || (currentSpeed == 64)) {
      video.playbackRate = 2 * direction;
      actionIcon = (video.playbackRate > 1) ? 'ico_FastForward1_' : 'ico_FastRewind1_';
    }
    else if (currentSpeed == 2) {
      video.playbackRate = 16 * direction;
      actionIcon = (video.playbackRate > 1) ? 'ico_FastForward2_' : 'ico_FastRewind2_';
    }
    else{
      video.playbackRate = 64 * direction;
      actionIcon = (video.playbackRate > 1) ? 'ico_FastForward3_' : 'ico_FastRewind3_';
    }

    return (actionIcon);
  },

  convertSecondsToReadableTime: function (time) {
    var minutes = Math.floor(time / 60),
        seconds = Math.floor(time % 60),
        str;

    str = (minutes < 10) ? ('0' + minutes.toString()) : minutes.toString();
    str += (seconds < 10) ? (':0' + seconds.toString()) : (':' + seconds.toString());

    return (str);
  },

  timeoutToHideFooterBar: function () {
    var footerBarNode = document.getElementById('trickMode-container'),
        that = this;

    // Launch a timer to hide the bar after 3s
    this._hideBarTimer = window.setTimeout(function () {
        
        // Add the footer and the UserInfoBox component
        footerBarNode.classList.remove('tm-show-footer');
        window.application.userInfoBox.hideUserInfoBox();

        // Reset timer
        that._hideBarTimer = null;
      },
      3000);
  },

  showFooterBar: function () {
    var footerBarNode = document.getElementById('trickMode-container'),
        that = this;

    // If the "hide timer" is running, reset it
    if (this._hideBarTimer != null)
      window.clearTimeout(this._hideBarTimer);

    // Add a class to display the footer bar
    footerBarNode.classList.add('tm-show-footer');
    window.application.userInfoBox.revealUserInfoBox();
  },

  buildProgressBar: function (video) {
    var timeNodes;

    // Add progress bar
    this._progressBar.displayVideoProgressBar(document.getElementById('tm-progress'),
                                              0,
                                              Math.floor(video.duration),
                                              'height: 7px;');

    // Set start and end time
    timeNodes = document.querySelectorAll('.tm-time');
    timeNodes[0].innerText = '00:00';
    timeNodes[1].innerText = this.convertSecondsToReadableTime(video.duration);

    // Override default style
    this._pbTextNode = document.querySelector('#progress-bar > time > span');
    this._pbTextNode.classList.add('tm-progress-time');

    // Update ProgressBar
    this._progressBar.updateProgressBar(Math.floor(video.currentTime));
  },

  buildTrickMode: function() {
    var size,
        i,
        that = this,
        actionNode,
        video = this._video.getVideoInstance(),
        container = document.getElementById('trickMode-container');

    // Change video source and put video fullscreen
    if (this._asset) {
      this._currentSource = this._video.getVideoSource();
      this._video.zapTo(this._asset.src);
    }
    this._video.fullScreenMode(document.getElementById('trickModeview_container'), VideoAnimationType.NoAnimation);

    // Insert actions
    size = this._actionList.length;
    for (i = 0; i < size; i++) {
      actionNode = document.createElement('img');
      actionNode.id = 'tm-picto-' + i;
      actionNode.classList.add('tm-picto');

      if (i == this._focusItem)
        actionNode.src = 'resources/trickMode/' + this._actionList[i].item + 'ON.png';
      else
        actionNode.src = 'resources/trickMode/' + this._actionList[i].item + 'OFF.png';


      // Hide item if not available
      if (this._actionList[i].available == false)
        actionNode.classList.add('tm-picto-unuse');

      // Insert the action picture
      container.appendChild(actionNode);
    };

    // Add progress bar
    this.buildProgressBar(this._video.getVideoInstance());

    
    // Register to time update events
    video.addEventListener('timeupdate', function () {
      var time = Math.floor(video.currentTime);

      // update the progress bar
      that._progressBar.updateProgressBar(time, that.convertSecondsToReadableTime(time));
      
      if ((time > 2) && (that._pbTextNode.offsetLeft > 60) && (that._pbTextNode.offsetLeft < 1070))
        that._pbTextNode.classList.add('tm-display');
      else 
        that._pbTextNode.classList.remove('tm-display');

    }, false);

    // Register to end video events
    video.addEventListener('ended', function () {
      // Just reset video playbackRate
      video.playbackRate = 1;
    }, false);

    // Change background color according to the asset one
    if (this._asset)
      container.style.backgroundColor = this._asset.color;

    // Get usefull references
    this._bigIconNode = document.querySelector('#tm-big-icon > img');

    // run the timer to close the footer bar if nothing happens
    this.timeoutToHideFooterBar();
  }


});
