
var ProgramAnimationType = {
  LeftToRight: 1,
  RightToLeft: 2,
  TopToBottom: 3,
  BottomToTop: 4
};

/**
 *  This class manage the Snowflake animation between 2 program.
 *  You can apply one of the ProgramAnimationType animation to animate picture taransitions.
 *
 *  @param: {Object}  parentNode              The parent node where the component will be inject.
 *  @param: {Int}     desiredMediaWidth       [Optional] If we want the picture to match a specific width, set the desired size in pixel. This param is optional, by default the picture will fill 100% of the parent container.
 *  @param: {Int}     desiredMediaHeight      [Optional] If we want the picture to match a specific height, set the desired size in pixel. This param is optional, by default the picture will fill 100% of the parent container.
 *  @param: {Object}  videoComponentInstance  [Optional] If exists, attach VideoComponent instance to ProgramPictureAnimation. This will allowed video transition.
 *  @param: {Int}     transitionsDuration     [Optional] Transition duration expected in ms
*/
var ProgramPictureAnimation = function (parentNode, desiredMediaWidth, desiredMediaHeight, videoComponentInstance, transitionsDuration) {
  var that = {},              // Object that expose public methods of this class
      _srcNode = null,        // Ref on the source node (aka the current image displayed)
      _destNode = null,       // Ref on destination node (aka the new image to display)
      _forceWidth = null,     // If we want our media source match a specific width in pixels
      _forceHeight = null,    // If we want our media source match a specific height in pixels
      _parentNode = null,     // Parent node where we inject our module
      _videoInstance = null,  // Instance on VideoComponent class
      _onAnim = false;        // Boolean to remember the current anim state

  

  /*
    PRIVATE METHODS
  */
  function onPluginInit() {

    // Inject module in parent node 
    if (transitionsDuration === undefined)
      parentNode.innerHTML = '<div id="ppa-src-panel" class="ppa-panel"></div><div id="ppa-dest-panel" class="ppa-panel"></div>';
    else
      parentNode.innerHTML = '<div id="ppa-src-panel" class="ppa-panel" style="-webkit-animation-duration: ' + transitionsDuration + 'ms;"></div><div id="ppa-dest-panel" class="ppa-panel" style="-webkit-animation-duration: ' + transitionsDuration + 'ms;"></div>';

    _parentNode = parentNode;

    // Set a specific width/height if needed
    if (desiredMediaWidth && desiredMediaHeight) {
      _forceWidth = desiredMediaWidth;
      _forceHeight = desiredMediaHeight;
    }

    if (videoComponentInstance)
      _videoInstance = videoComponentInstance;

  };

  function getNodesAndRegisterEvents() {
    // Get ref on usefull animation nodes
    _srcNode = document.getElementById('ppa-src-panel');
    _destNode = document.getElementById('ppa-dest-panel');

    // Register to end Animation events
    _srcNode.addEventListener('webkitAnimationEnd', onProgramPictureAnimationEnd, false);
  };

  onPluginInit();

  
  function onProgramPictureAnimationEnd() {

    // Reset animation
    _srcNode.style.webkitAnimationName = '';
    _destNode.style.webkitAnimationName = '';

    // Reset animation state
    _onAnim = false;
  }



  /*
    PUBLIC METHODS
  */

  /**
  * Simply display a picture in the parent container without any animation. Usefull on loading.
  * @param: {String}  picPath  Path to the image to display
  */
  that.setCurrentPicture = function(picPath) {
    var picture = document.createElement('img');

    // Set path
    picture.src = picPath;

    // Get node reference if not yet set
    if (_srcNode == null)
      getNodesAndRegisterEvents();

    // Apply specific size if needed
    if (_forceWidth) {
      picture.width = _forceWidth;
      picture.height = _forceHeight;
    }

    // If there is already a picture displayed, remove it
    if (_srcNode.firstChild != null) {
      _srcNode.removeChild(_srcNode.firstChild);
    }

    _srcNode.appendChild(picture);
  };

  /**
  * Put a node in DOM without transition
  * @param: {Object}  node  The node to display
  */
  that.setCurrentHTMLNode = function(node) {
    // Get node reference if not yet set
    if (_srcNode == null)
      getNodesAndRegisterEvents();

    // If there is already a node displayed, remove it
    if (_srcNode.firstChild != null) {
      _srcNode.removeChild(_srcNode.firstChild);
    }

    // Inject node in parent
    _srcNode.appendChild(node);
  };

  

  /**
  * Display a smooth transition from the current picture to the one in parameter
  * @param: {String}  picPath   Path to the image to display
  * @param: {Int}     animType  Type of animation we want to see. Must be a ProgramAnimationType value
  */
  that.pictureAnimation = function (picPath, animType) {
    var picHtml = '<img src="' + picPath + '" ';

    // Get node reference if not yet set
    if (_srcNode == null)
      getNodesAndRegisterEvents();

    // Apply specific size if needed
    if (_forceWidth)
      picHtml += 'width="' + _forceWidth + '" height="' + _forceHeight + '"';

    // Set the right pictures in our 2 animation's panel
    _destNode.innerHTML = _srcNode.innerHTML;
    _srcNode.innerHTML = picHtml + '>';

    // If animation, cancel it
    if (_onAnim) {
      // Stop possible previous animation
      _srcNode.style.webkitAnimationPlayState = 'paused';
      _destNode.style.webkitAnimationPlayState = 'paused';
      
      _srcNode.style.webkitAnimationName = '';
      _destNode.style.webkitAnimationName = '';

      _srcNode.style.webkitAnimationPlayState = 'running';
      _destNode.style.webkitAnimationPlayState = 'running';
    }

    // Set the right animation according the one we want
    switch (animType) {
      case ProgramAnimationType.LeftToRight:
        _srcNode.style.webkitAnimationName = 'srcLeftToRight';
        _destNode.style.webkitAnimationName = 'destLeftToRight';
        _onAnim = true;
        break;

      case ProgramAnimationType.RightToLeft:
        _srcNode.style.webkitAnimationName = 'srcRightToLeft';
        _destNode.style.webkitAnimationName = 'destRightToLeft';
        _onAnim = true;
        break;
      
      case ProgramAnimationType.TopToBottom:
        _srcNode.style.webkitAnimationName = 'srcTopToBottom';
        _destNode.style.webkitAnimationName = 'destTopToBottom';
        _onAnim = true;
        break;
      
      case ProgramAnimationType.BottomToTop:
        _srcNode.style.webkitAnimationName = 'srcBottomToTop';
        _destNode.style.webkitAnimationName = 'destBottomToTop';
        _onAnim = true;
        break;

      default:
        console.log('[ERROR] [ProgramPictureAnimation.pictureAnimation] Unknow animation ' + animType);
    }

  };

  /**
  * Display a smooth transition from the current picture to the one in parameter
  * @param: {String}  picPath   Path to the image to display
  * @param: {Int}     animType  Type of animation we want to see. Must be a ProgramAnimationType value
  */
  that.videoAnimation = function (picPath, animType) {

    if (_videoInstance == null) {
      console.log('[ERROR] [ProgramPictureAnimation.videoAnimation] No VideoComponent instance attached, abort');
      return;
    }

    // Apply specific size if needed
    if (_forceWidth)
      picHtml += 'width="' + _forceWidth + '" height="' + _forceHeight + '"';

    // Get node reference if not yet set
    if (_srcNode == null)
      getNodesAndRegisterEvents();

    // If animation, cancel it
    if (_onAnim) {
      // Stop possible previous animation
      _srcNode.style.webkitAnimationPlayState = 'paused';
      _destNode.style.webkitAnimationPlayState = 'paused';
      
      _srcNode.style.webkitAnimationName = '';
      _destNode.style.webkitAnimationName = '';

      _srcNode.style.webkitAnimationPlayState = 'running';
      _destNode.style.webkitAnimationPlayState = 'running';
    }

    // Move the picture program once the PIP is hided
    _videoInstance.displayVideoOnNode(_parentNode, animType, function () {
      // Set the right pictures in our 2 animation's panel
    _destNode.innerHTML = _srcNode.innerHTML;
    _srcNode.innerHTML = '';

      // Set the right animation according the one we want
      switch (animType) {
        case ProgramAnimationType.LeftToRight:
          _srcNode.style.webkitAnimationName = 'srcLeftToRight';
          _destNode.style.webkitAnimationName = 'destLeftToRight';
          _onAnim = true;
          break;

        case ProgramAnimationType.RightToLeft:
          _srcNode.style.webkitAnimationName = 'srcRightToLeft';
          _destNode.style.webkitAnimationName = 'destRightToLeft';
          _onAnim = true;
          break;
        
        case ProgramAnimationType.TopToBottom:
          _srcNode.style.webkitAnimationName = 'srcTopToBottom';
          _destNode.style.webkitAnimationName = 'destTopToBottom';
          _onAnim = true;
          break;
        
        case ProgramAnimationType.BottomToTop:
          _srcNode.style.webkitAnimationName = 'srcBottomToTop';
          _destNode.style.webkitAnimationName = 'destBottomToTop';
          _onAnim = true;
          break;

        default:
          console.log('[ERROR] [ProgramPictureAnimation.pictureAnimation] Unknow animation ' + animType);
      }
    });

  };

  /**
  * Display a smooth transition from the current html content to the new one in parameter
  * @param: {Object}  node      HTML node to display
  * @param: {Int}     animType  Type of animation we want to see. Must be a ProgramAnimationType value
  */
  that.htmlNodeAnimation = function (node, animType) {
    // Get node reference if not yet set
    if (_srcNode == null)
      getNodesAndRegisterEvents();

    // Set the right pictures in our 2 animation's panel
    if (_destNode.firstChild != null) {
      _destNode.removeChild(_destNode.firstChild);
    }
    _destNode.appendChild(_srcNode.removeChild(_srcNode.firstChild));
    _srcNode.appendChild(node);

    // If animation, cancel it
    if (_onAnim) {
      // Stop possible previous animation
      _srcNode.style.webkitAnimationPlayState = 'paused';
      _destNode.style.webkitAnimationPlayState = 'paused';
      
      _srcNode.style.webkitAnimationName = '';
      _destNode.style.webkitAnimationName = '';

      _srcNode.style.webkitAnimationPlayState = 'running';
      _destNode.style.webkitAnimationPlayState = 'running';
    }

    // Set the right animation according the one we want
    switch (animType) {
      case ProgramAnimationType.LeftToRight:
        _srcNode.style.webkitAnimationName = 'srcLeftToRight';
        _destNode.style.webkitAnimationName = 'destLeftToRight';
        _onAnim = true;
        break;

      case ProgramAnimationType.RightToLeft:
        _srcNode.style.webkitAnimationName = 'srcRightToLeft';
        _destNode.style.webkitAnimationName = 'destRightToLeft';
        _onAnim = true;
        break;
      
      case ProgramAnimationType.TopToBottom:
        _srcNode.style.webkitAnimationName = 'srcTopToBottom';
        _destNode.style.webkitAnimationName = 'destTopToBottom';
        _onAnim = true;
        break;
      
      case ProgramAnimationType.BottomToTop:
        _srcNode.style.webkitAnimationName = 'srcBottomToTop';
        _destNode.style.webkitAnimationName = 'destBottomToTop';
        _onAnim = true;
        break;

      default:
        console.log('[ERROR] [ProgramPictureAnimation.htmlNodeAnimation] Unknow animation ' + animType);
    }

  };


  return (that);
};
