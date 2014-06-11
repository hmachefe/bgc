
/**
  Create and manage the top left panel.
  This panel contains the current user name, the current view name and the date and time
*/
var UserInfosBox = function (parentNode, onInitCallback, forceTimestamp) {
  var that = {},
      _now,
      _days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      _month = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
      _hours,
      _minutes,
      _nodeDate,
      _nodeTime,
      _timestamp;

  // If we want to force to a certain date
  if (forceTimestamp) {
    _now = new Date(forceTimestamp);
    onPluginInit(_now);

    // Call shall be done after object creation in case where the callback need to update this object
    if (onInitCallback)
      window.setTimeout(function () { onInitCallback(); }, 1);
      
  }
  // Else retreive current date
  else {
    // Init plugin with current date
    _now = new Date();
    onPluginInit(_now);

    // Call shall be done after object creation in case where the callback need to update this object
    if (onInitCallback)
      window.setTimeout(function () { onInitCallback(); }, 1);

  }

  /*
    PRIVATE METHODS
  */
  function onPluginInit(now) {
    var infoBoxElement, datePart, img, h1, suffixPart, header, strong, span;
    
    //calculate date and format it
    datePart = _days[now.getDay()].substr(0, 3) + ', ' + _month[now.getMonth()] + ' ' + now.getDate();
    switch (now.getDate()) {
        case 1:
        case 21:
        case 31:
            suffixPart = 'st';
            break;
        case 2:
        case 22:
            suffixPart = 'nd';
            break;
        case 3:
        case 23:
            suffixPart = 'rd';
            break;
        default:
            suffixPart = 'th';                                                
    }        

    // First inject module if not yet displayed
    //display the date part here    
    if ((_nodeDate == null) || (_nodeTime == null)) {
        infoBoxElement = document.createElement('div');
        infoBoxElement.id = "user-infos-box";
        img = document.createElement('img');
        img.src = "resources/graphicalAssets/navigation/hour_gradient.png";
        header = document.createElement('header');
        h1 = document.createElement('h1');
        h1.innerText = "user";
        header.appendChild(h1);
        strong = document.createElement('strong');
        header.appendChild(strong);
        infoBoxElement.appendChild(img);
        infoBoxElement.appendChild(header);
        _nodeDate = document.createElement('time');
        _nodeDate.id = 'uib-date';
        _nodeDate.innerText = datePart;
        span = document.createElement('span');
        span.innerText = suffixPart;
        _nodeDate.appendChild(span);
        infoBoxElement.appendChild(_nodeDate);
        _nodeTime = document.createElement('time');
        _nodeTime.id = 'uib-time';
        infoBoxElement.appendChild(_nodeTime);
        /*infoBoxElement.innerHTML = '<img src= />' +
          '<header><h1>user</h1><strong></strong></header>' +
          '<time id="uib-date">' + datePart + '<span>' + suffixPart + '</span></time>' +
          '<time id="uib-time"></time>';*/
        parentNode.appendChild(infoBoxElement);  
      
        // Get date and time nodes
        //_nodeDate = document.getElementById('uib-date');
        //_nodeTime = document.getElementById('uib-time');
    }

    // Display time
    _hours = now.getHours();
    _minutes = now.getMinutes();
    displayHour(_nodeTime, _hours, _minutes);
    
    // Refresh every 60s
    window.setTimeout(function () {
      
      refreshTime();
      window.setInterval(refreshTime, 60000);

    }, (60 - now.getSeconds()) * 1000);

    // Save timestamp
    _timestamp = now.getTime();

    // Release Date object
    now = null;
  }

  function refreshTime() {
    // Update minute counter
    if (++_minutes >= 60) {
      _minutes = 0;
      
      // Update hour counter
      if (++_hours > 23)
        _hours = 0;
    }

    // refresh timestamp
    _timestamp += 60000;
    
    // Display time
    displayHour(_nodeTime, _hours, _minutes);
  }

  function displayHour(node, hours, minutes) {
    var h, m;

    // Format values
    h = (hours > 9) ? hours.toString() : ('0' + hours.toString());
    m = (minutes > 9) ? minutes.toString() : ('0' + minutes.toString());

    // Refresh display
    node.innerHTML = h + ':' + m;
  }



  /*
    PUBLIC METHODS
  */

  /**
  * Set a user name in the top panel
  * @param: {String}  userName  User name to display
  */
  that.setUserName = function(userName) {
    document.querySelector('#user-infos-box > header > h1').innerText = userName;
  }

  /**
  * Set a view name in the top panel
  * @param: {String}  viewName  View name to display
  */
  that.setViewName = function(viewName) {
    if (viewName == '')
      that.unsetViewName();
    else {
      document.querySelector('#user-infos-box > header > strong').innerText = '> ' + viewName;
      that.revealUserInfoBox();
    }

  }

  that.unsetViewName = function() {
    document.querySelector('#user-infos-box > header > strong').innerText = '';
    
    // Show the uib component
    that.revealUserInfoBox();
  }

  /**
  * Get the current timestamp according to the original time setted
  * @return: {Int}  Actual program timestamp
  */
  that.getCurrentTimestamp = function () {
    return (_timestamp);
  }

  /**
  * Get the current timestamp according to the original time setted
  * This timestamp represent the hour of the day. It starts from 0 (midnight) and run all day long
  * @return: {Int}  Actual program timestamp
  */
  that.getCurrentHourTimestamp = function () {
    var now = new Date(_timestamp),
        timestamp = 0;

    // console.log('Actuellement il est ' + now.getHours() + ':' + now.getMinutes());
    timestamp = now.getHours() * 3600 - 3600;
    timestamp += now.getMinutes() * 60;
    timestamp += now.getSeconds();
    timestamp *= 1000;
    
    return (timestamp);
  }
  
  /**
  * Get the current formated date
  * @return: {String}  Formated date
  */
  that.getFormatedDate = function (offsetDay) {
    var today = new Date(_timestamp),
        str;

    // If we want to change the date for 1 day or two in the future
    if (offsetDay)
      today = new Date(_timestamp + (offsetDay * 86400000));

    // Create complete date string
    str = _days[today.getDay()] + ', ' + _month[today.getMonth()] + ' ' + today.getDate() + '<span style="position: relative;top: -0.35em;font-size: 0.65em;">';
    
    // Add date extension
    switch (today.getDate()) {
        case 1:
        case 21:
        case 31:
            str += 'st</span>';
            break;
        case 2:
        case 22:
            str += 'nd</span>';
            break;
        case 3:
        case 23:
            str += 'rd</span>';
            break;
        default:
            str += 'th</span>';
    }        
      

    return (str);
  }

  /**
  * Hide the userInfoBox component. Can be usefull if a video is displayed fullscreen for example.
  */
  that.hideUserInfoBox = function() {
    document.getElementById('user-infos-box').classList.add('uib-hidden');
  }

  /**
  * Reveal the userInfoBox component.
  */
  that.revealUserInfoBox = function() {
    document.getElementById('user-infos-box').classList.remove('uib-hidden');
  }

  return (that);
};
