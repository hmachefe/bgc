var VideoAnimationType = {
  LeftToRight: 1,
  RightToLeft: 2,
  TopToBottom: 3,
  BottomToTop: 4,
  NoAnimation: 5
};

var isVideoRequested;

/**
 *  This class manage the video node.
 *  Only one video tag can be play on RDK, so this class manages it through the views by provide some get and display functions.
 *  Actually, the video tag is encapsuled in a container we move all around the views. This container must be injected once in the dom and never be destroyed.
 *
 *  @param: {Object}  parentNode          The parent node where inject video container. Must be injected in a top level element, not a Ubik view
 *  @param: {Boolean} noVideoPlease       If set to true, don't load video in the page
*/
var VideoComponent = function (parentNode, noVideoPlease) {
  var that                = {},     // Object that expose public methods of this class
      _videoSource        = 'resources/videos/Drive_320x180.mp4',  // Video source
      _videoNode          = null,   // Ref on video node
      _videoContainerNode = null,   // Ref on Picture In Picture top right window node
      _pipFlower          = null,   // Ref on PIP flower node
      _userCallback       = null,   // User callback to call after a pip out transition
      _isVideoRequested   = false,  // Bool to know if the video is requested / injected in the page
      _isFullScreen       = false,  // Bool to know if the video is in fullscreen
      _isOnSTB            = navigator.userAgent.indexOf("Chrome") === -1, // Chrome navigator shall be used on PC <=> Check if it is on STB browser
      _DELAY_VIDEO_COLOR  = 400,    //Polling time to get video colorimetry
      _startColorimetry   = 0;      // Ref on setInterval to manage the colorimetry
      _forceTexturingTimer= null;   // Timer launch after each zapping


  /*
    PRIVATE METHODS
  */
  function onPluginInit() {
    var flower = document.createElement('img'),
        container = document.createElement('div'),
        video = null,
        source = null;

    // Check if the video is not requested in the URL
    _isVideoRequested = (window.location.href.toLowerCase().indexOf('novideo') >= 0 ) ? false : true;
    
    // Internal no video request
    if (noVideoPlease && noVideoPlease === true)
      _isVideoRequested = false;
    
    // Create video container node
    container.id = 'vc-video-container';
    
    // If the video is requested, create a video tag and its source
    if (_isVideoRequested) {
      video = document.createElement('video'),
      video.id = 'vc-video';
      video.loop = 'loop';
      video.autoplay = 'autoplay';
      
      source = document.createElement('source'),
      source.src = _videoSource;

      // Add source to the video tag
      video.appendChild(source);
    }
    // Else create a simple div with a special class
    else {
      video = document.createElement('div'),
      video.id = 'vc-video';
      video.classList.add('vc-no-video');
    }

    // Flower node
    flower.id = 'vc-pip-petale';
    flower.src = 'resources/images/visu_petale.png';

    // Insert video tag in DOM
    container.appendChild(video);
    parentNode.appendChild(flower);
    parentNode.appendChild(container);
  };
  onPluginInit();

  function getNodes() {
    _videoContainerNode = document.getElementById('vc-video-container');
    _videoNode = document.getElementById('vc-video');
    _pipFlower = document.getElementById('vc-pip-petale');

    // Ears safety :)
    if ((_videoNode) && (_videoNode.muted != undefined))
      _videoNode.muted = true;
  }

  function onPipAnimationEnd(event) {

    // If we have a user callback to raise
    if (_userCallback) {
      _userCallback();
      _userCallback = null;
    }
    
    _videoNode.removeEventListener('webkitAnimationEnd', onPipAnimationEnd, false);
  }

  function resetVideoCssProperties() {
    _videoContainerNode.removeAttribute('style');
    _videoContainerNode.removeAttribute('class');
  }

  function animVideo(isShowingVideo, animEffect, onAnimEndFunction) {
    var anim = null;

    // If wa want to execute some function once the animation ended
    if (onAnimEndFunction) {
      _userCallback = onAnimEndFunction;

      _videoNode.addEventListener('webkitAnimationEnd', onPipAnimationEnd, false);
    }

    // Aply animation
    _videoNode.style.webkitAnimationName = '';
    switch (animEffect) {
      case VideoAnimationType.LeftToRight:
        anim = (isShowingVideo == true) ? 'srcLeftToRight' : 'destLeftToRight';
        break;
      case VideoAnimationType.RightToLeft:
        anim = (isShowingVideo == true) ? 'srcRightToLeft' : 'destRightToLeft';
        break;
      case VideoAnimationType.TopToBottom:
        anim = (isShowingVideo == true) ? 'srcTopToBottom' : 'destTopToBottom';
        break;
      case VideoAnimationType.BottomToTop:
        anim = (isShowingVideo == true) ? 'srcBottomToTop' : 'destBottomToTop';
        break;
      case VideoAnimationType.NoAnimation:
        break;
      default:
        console.log('[ERROR] [VideoComponent.animVideo] Unknow animation ' + animEffect);
    }
    // Play the anim
    if (anim != null)
      _videoNode.style.webkitAnimationName = anim;
    // If we have no anim but a callback to raise
    else if (onAnimEndFunction) {
      _userCallback();
      _userCallback = null;
    }

    if (isShowingVideo == true)
      _videoNode.classList.add('vc-video-show');
    else
      _videoNode.classList.remove('vc-video-show');
  }

  /**
  *   Retreive offsetWidth, offsetHeight, width and height of the given node
  *   @param: {Object}  node   Target node to retreive informations
  */
  function getNodeProperties(node) {
    var infos = {
          x: 0,
          y: 0,
          width: 0,
          height: 0
        },
        curNode = node;

    // Get x y pos
    while (curNode != null) {
      infos.x += curNode.offsetLeft;
      infos.y += curNode.offsetTop;
      curNode = curNode.offsetParent;
    }

    // Get width height
    infos.width = node.offsetWidth;
    infos.height = node.offsetHeight;

    return (infos);
  }

  /*
    PUBLIC METHODS
  */

  /**
  *   Display the video in the PIP window.
  *   Before display it, we have to apply an out effect on the video to remove it from its previous position
  *   @param: {Int}  outEffect   Out effect to apply on the video node before display it in PIP window. One of the VideoAnimationType enum values
  */
  that.displayVideoInPIP = function(outEffect) {
    var isPlaying;

    // Retreive node if not yet done
    if (_videoNode == null)
      getNodes();

    isPlaying = _videoNode.classList.contains('vc-video-show');

    // If PIP is already playing, do nothing
    if (isPlaying && _videoContainerNode.classList.contains('vc-pip'))
      return;

    // If the video is already displayed, hide it with outEffect before display PIP
    if (isPlaying) {
      
      // Call recusively once the out animation is done to show the pip
      animVideo(false, outEffect, function () {
        resetVideoCssProperties();
        _videoContainerNode.classList.add('vc-pip');
        animVideo(true, VideoAnimationType.RightToLeft);
        _pipFlower.classList.add('vc-show-petale');
      });
    }
    else {
      _videoContainerNode.classList.add('vc-pip');
      animVideo(true, VideoAnimationType.RightToLeft);
      _pipFlower.classList.add('vc-show-petale');
    }
    
  };


  /**
  *   Display the video on the node.
  *   Note that the video container will be move ON the node provided, not inner.
  *   @param: {Object}    node                  Node where to put the video container on
  *   @param: {Int}       animType              Effect to apply on the video node. One of the VideoAnimationType enum values
  *   @param: {Function}  onAnimStartCallback   [Optional] If the video is already displayed in PIP, you can expect a delay before the video start display in node. By provide a callback, you will be updated right before the show animation starts.
  *   @param: {Int}       zindex                [Optional] z-index CSS property to apply to the video container
  */
  that.displayVideoOnNode = function (node, animType, onAnimStartCallback, zindex) {
    var parentInfos = getNodeProperties(node);
    
    // Retreive node if not yet done
    if (_videoNode == null)
      getNodes();

    // Reset old style
    resetVideoCssProperties();
    
    // If the video is already displayed (in PIP), remove it before move the video container
    if (_videoNode.classList.contains('vc-video-show')) {
      
      // Hide video from the pip
      _pipFlower.classList.remove('vc-show-petale');
      animVideo(false, VideoAnimationType.LeftToRight, function () {
        
        // Place video container in the right place
        _videoContainerNode.style.left = parentInfos.x + 'px';
        _videoContainerNode.style.top = parentInfos.y + 'px';
        _videoContainerNode.style.width = parentInfos.width + 'px';
        _videoContainerNode.style.height = parentInfos.height + 'px';
        if (zindex)
          _videoContainerNode.style.zIndex = zindex;

        // Anim video entry
        if (onAnimStartCallback)
          onAnimStartCallback();
        animVideo(true, animType);
      });
    }
    else {
      // Place video container in the right place
      _videoContainerNode.style.left = parentInfos.x + 'px';
      _videoContainerNode.style.top = parentInfos.y + 'px';
      _videoContainerNode.style.width = parentInfos.width + 'px';
      _videoContainerNode.style.height = parentInfos.height + 'px';
      if (zindex)
          _videoContainerNode.style.zIndex = zindex;

      // Anim video entry
      if (onAnimStartCallback)
        onAnimStartCallback();
      animVideo(true, animType);
    }

  };

  /**
  *   Get the video status
  *   @return: {Bool}  True if a video tag is inserted in the page, else false
  */
  that.isVideoAvailable = function () {
    return (_isVideoRequested);
  };

  /**
  *   Get the video node instance
  *   @return: {Bool}  True if a video tag is inserted in the page, else false
  */
  that.getVideoInstance = function () {
    if (_isVideoRequested == true)
      return (_videoNode);
    
    return (null);
  };

  /**
  *   Zap to a new video source
  *   @param: {String}  source          The video URL ressource
  *   @param: {Bool}    keepItTextured  [Optional] If this parameter is set to true, avoid to launch the detextured timer
  */
  that.zapTo = function (source, keepItTextured) {
    var videoSourceNode;

    // Retreive node if not yet done
    if (_videoNode == null)
      getNodes();
    
    // Change video source if the video node is valid
    if ((_videoNode) && (_videoNode.play != undefined)) {
      // Remove old video source
      _videoNode.removeChild(_videoNode.firstChild);
      
      // Create a new video source node
      videoSourceNode = document.createElement('source');
      videoSourceNode.src = source;

      // Then inject it in video node and play !
      _videoNode.appendChild(videoSourceNode);
      _videoNode.play();

      if (keepItTextured !== true) {
        // Each time a zapping is performed, force the detexturing mode.
        // This is due to a player bug which can change the texturing mode randomly 
        // If a timer is running, execute change mode and release it
        if (_forceTexturingTimer != null) {
          window.clearTimeout(_forceTexturingTimer);
          // Force detexturing
          that.setTexturedMode(false);
        }
        _forceTexturingTimer = window.setTimeout(function () {
          // Force detexturing
          that.setTexturedMode(false);
          _forceTexturingTimer = null;
        }, 1000);
      }

      console.log('[ZAPPING] Zap to [' + source + ']');
    }
  };

  /**
  *   As the player change randomly the texturing status after a zapping, a timer is raised after each zap command to force the detecturing state
  *   This method freed a timer in case we exit a view to avoid to apply deteturing in view which doesn't expect this state
  */
  that.cancelForceDetexturingRequest = function () {
    // If a timer is running, cancel it
    if (_forceTexturingTimer != null) {
      window.clearTimeout(_forceTexturingTimer);
      _forceTexturingTimer = null;
    }
  };

  /**
  *   Retreive the current video source
  *   @return: {String}  The video source URL, or an empty String if video source is unavailable
  */
  that.getVideoSource = function () {
    var src = '';

    // Try to retreive video source of available node
    if ((_videoNode) && (_videoNode.play != undefined)) {
      src = document.querySelector('video > source').src;
    }

    return (src);
  };

  that.zoom = function(translateX,translateY,scaleX,scaleY) {
    var transition = "-webkit-transition: -webkit-transform 400ms linear;";
    var transform = "-webkit-transform: translate3d(" + translateX + "px," + translateY + "px,0px) scale3d(" + scaleX + "," + scaleY + ",0);";
    _videoContainerNode.style.cssText += transition + transform;
  };
  
  that.unzoom = function() {
    _videoContainerNode.style.webkitTransform = "";
  };

  /**
   *   Set the video texturing mode. True for textured video, false for detextured
   *   NB 1: Use textured video if you want to retreive video colorimetry
   *   NB 2: Set detextured mode only for fullscreen video display
   *   @param: {Boolean} mode   True for textured video, false for detextured
   */
  that.setTexturedMode = function (mode) {
    if ((_isOnSTB) && (_videoNode) && (_videoNode.changeMode != undefined)) {
    
      // If we change the texture mode to false (== detextured video), be sure we stop getColorimetry
      if (mode == false)
        that.stopColorimetry();

      // Change mode
      _videoNode.changeMode(mode);
    }
  };


  /**
   *   Check the fullscreen status
   *   @return: {Bool}  True if a video tag is inserted in the page, else false
   */
  that.isFullScreenMode = function () {
    return (_isFullScreen);
  };

  /**
   *   Put the video in fullscreen and set its mode to detextured.
   *   Use only when parent node is 
   *   @param: {Object}    node                   Node where to put the video container on
   *   @param: {Int}       animType               Effect to apply on the video node. One of the VideoAnimationType enum values
   *   @param: {Function}  onAnimStartCallback    [Optional] If the video is already displayed in PIP, you can expect a delay before the video start display in node. By provide a callback, you will be updated right before the show animation starts.
   *   @param: {Int}       zindex                 [Optional] z-index CSS property to apply to the video container
   */
  that.fullScreenMode = function (node, animType, onAnimStartCallback, zindex) {
    // Set fullscreen mode to true
    _isFullScreen = true;
    
    // Detexture video
    that.setTexturedMode(false);
    
    // Inject the video to its DOM (hope it's a fullscreen node :p)
    that.displayVideoOnNode(node, animType, onAnimStartCallback, zindex);
  };

  /**
   *   Start getting the colorimetry
   */
  that.startColorimetry = function () {
    if ((_isOnSTB) && (window.application.states["flowerBackground"]) && (_videoNode) && (_isVideoRequested)&& (_isFullScreen !== true)) {
      _startColorimetry = setInterval(function() {
        var colorimetry = window.__cisco_AMP__.getColorimetry();
        var r = (colorimetry&0x00FF0000) >> 16,
            g = (colorimetry&0x0000FF00) >> 8,
            b = (colorimetry&0x000000FF);
        flowerColorEvent.trigger("changeColorAccordingToContent", r, g, b);

      }, _DELAY_VIDEO_COLOR);
    }
  };

  /**
   *  Return the colorimetry status. If it's started, return true
   *  @return: {Bool}  True if the colorimetry is running, else false
   */
  that.isStartColorimetry = function () {
    return (_startColorimetry !== 0);
  };

  /**
   *   Stop getting the colorimetry
   */
  that.stopColorimetry = function () {
    if (_startColorimetry > 0) {
        window.clearInterval(_startColorimetry);
        _startColorimetry = 0;
    }
  };

  return (that);
};