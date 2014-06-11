/**
 *  This class manage the program's progress bar
 *  Once it's instancied, you can apply a progress bar on a parent node, and this progress bar will be automatically updated each minute.
 *
 *  @param: {Object}  userInfoBoxInstance   Instance of userInfoBox object. Usefull to retreive current time
*/
var ProgressBar = function (userInfoBoxInstance) {
  var that = {},          // Object that expose public methods of this class
      _uib,               // userInfoBox instance
      _min,               // Min value of the progress bar (== 0%)
      _max,               // Max value of the progress bar (== 100%)
      _pbNode = null,     // Progress bar node
      _pbTextNode = null, // Progress bar text node
      _parentNode = null, // Parent node of the progress bar
      _interval = null;   // Reference on setInterval() object

  /*
    PRIVATE METHODS
  */
  function onPluginInit() {
    _uib = userInfoBoxInstance;
  };
  onPluginInit();

  function updateProgressBar() {
    var percent;

    // retreive node if it's the first time
    if (_pbNode == null)
      _pbNode = document.querySelector('#progress-bar > time');

    // Update node if exists
    if (_pbNode != null) {
      // Calc percent
      percent = Math.floor((_uib.getCurrentHourTimestamp() - _min) / (_max - _min) * 100);
      if (percent > 100)
        percent = 100;
      
      _pbNode.style.width = percent + '%';
    }
  }


  /*
    PUBLIC METHODS
  */

  /**
   *   Display a progress bar into the parent node
   *    NB: the parent container should have a css position (relative or absolute) in order to correctly display the progress bar
   *   @param: {Object}  parentNode         Parent node where inject the progress bar
   *   @param: {Int}     startTime          Timestamp representing 0% achivement
   *   @param: {Int}     endTime            Timestamp representing 100% achivement
   *   @param: {String}  extraCSSProperty   [Optionnal] Inline style string that will change default CSS properties
   */
  that.displayProgressBar = function (parentNode, startTime, endTime, extraCSSProperty) {
    var percent,
        actualTimestamp = _uib.getCurrentHourTimestamp(),
        pgbContainerNode,
        pgbNode,
        now = new Date(actualTimestamp);

    // Remove a potencial old progress bar
    that.removeProgressBar();

    // Compute percentage
    _min = startTime;
    _max = endTime;

    percent = Math.floor((actualTimestamp - _min) / (_max - _min) * 100);
    if (percent > 100)
      percent = 100;

    // Save parent
    _parentNode = parentNode;

    // Create ProgressBar container
    pgbContainerNode = document.createElement('div');
    pgbContainerNode.id = 'progress-bar';
    if (extraCSSProperty)
      pgbContainerNode.style.cssText = extraCSSProperty;

    // Adding its progress bar itself
    pgbNode = document.createElement('time');
    pgbNode.style.width = percent + '%';
    pgbContainerNode.appendChild(pgbNode);

    // Inject progressbar in parent node
    parentNode.appendChild(pgbContainerNode);

    // Refresh every 60s
    window.setTimeout(function () {
      
      updateProgressBar();
      _interval = window.setInterval(updateProgressBar, 60000);

    }, (60 - now.getSeconds()) * 1000);
  
  };

  /**
   *   Display a progress bar for a managed video.
   *   The difference here is that this progress bar will not update each second. You can control its progress bar with updateProgressBar()
   *   @param: {Object}  parentNode  Parent node where inject the progress bar
   *   @param: {Int}     startTime   Value representing 0% achivement
   *   @param: {Int}     endTime     Value representing 100% achivement
   *   @param: {String}  extraCSSProperty   [Optionnal] Inline style string that will change default CSS properties
   */
  that.displayVideoProgressBar = function (parentNode, startTime, endTime, extraCSSProperty) {
    var pgbContainerNode,
        pgbNode,
        pgbSpanNode;

    // Remove a potencial old progress bar
    that.removeProgressBar();

    // Save times
    _min = startTime;
    _max = endTime;

    // Save parent
    _parentNode = parentNode;
    

    // Create ProgressBar container
    pgbContainerNode = document.createElement('div');
    pgbContainerNode.id = 'progress-bar';
    if (extraCSSProperty)
      pgbContainerNode.style.cssText = extraCSSProperty;

    // Adding its progress bar itself
    pgbNode = document.createElement('time');
    pgbNode.style.width = '0%';
    pgbSpanNode = document.createElement('span');
    pgbNode.appendChild(pgbSpanNode);
    pgbContainerNode.appendChild(pgbNode);

    // Inject progressbar in parent node
    parentNode.appendChild(pgbContainerNode);
  };

  /**
   *   Set the progress bar position
   *   The difference here is that this progress bar will not update each second. You can control its progress bar with updateProgressBar()
   *   @param: {Int}  currentValue   Current value of the progress bar. Should be between _min and _max
   */
  that.updateProgressBar = function (currentValue, setTextOnBar) {
    var percent;

    if ((currentValue >= _min) && (currentValue <= _max)) {
      
      // retreiving progress bar node if not yet getted
      if (_pbNode == null)
        _pbNode = document.querySelector('#progress-bar > time');

      // Updating value
      percent = Math.floor((currentValue - _min) / (_max - _min) * 100);
      if (percent > 100)
        percent = 100;
      
      _pbNode.style.width = percent + '%';
      
      // if we want to display text on the progress
      if (setTextOnBar) {
        if (_pbTextNode == null)
          _pbTextNode = document.querySelector('#progress-bar > time > span');

        _pbTextNode.innerText = setTextOnBar;
      }

    }
  
  };

  /**
   *   Remove the displayed progress bar
   */
  that.removeProgressBar = function () {
    var progressBar = document.querySelector('#progress-bar');

    // Release interval timer
    if (_interval != null)
      window.clearInterval(_interval);

    // If exists, remove the progress bar from his parent
    if (progressBar)
      progressBar.parentNode.removeChild(progressBar);

    // Forget old nodes
    _parentNode = null;
    _pbNode = null;
  };


  return (that);
};
