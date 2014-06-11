var ChannelEntityGlobalUUID   = 0;
var REQUEST_UUID              = 1337; // To maintain a uuid for each request to the data model
var DEFAULT_PICTURE_WIDTH     = 196;  // Default picture width requested to the data model
var DEFAULT_PICTURE_HEIGHT    = 110;  // Default picture height requested to the data model
var BROADCAST                 = "broadcast";
var VOD                       = "vod";

/**
 * Channel class
 */
var Channel = function (serverChannelObj) {
  // Channel number
  // this.number = serverChannelObj.channelNumber;
  this.number = serverChannelObj.channelNumber;
  
  // Channel name
  this.name = serverChannelObj.channelName;
  
  // Channel logo
  this.logo = serverChannelObj.channelLogo;

  // Channel source
  this.source = serverChannelObj.source;

  // Channel program list
  this.programs = [];

  // Initialize usefull parameters
  this.firstProgIndex = 0;
  this.lastProgIndex = 0;
  this.currentProgramFocussed = 0;
};

/**
 *  Populate the program list of the channel
 *
 *  @param: {Array} serverProgramList  An array of all programs received from the server
 */
Channel.prototype.populatePrograms = function(serverProgramList, fakeDatas) {
  var pgmListSize = serverProgramList.length,
      i,
      pgrSharedInfos = { dayOffset: 0, day: 0 };

  // Store all events into programs array
  for (i = 0; i < pgmListSize; i++) {
    this.programs.push( new Program(serverProgramList[i], i, pgrSharedInfos, fakeDatas) );
  };
  this.lastProgIndex = this.programs.length - 1;

  // If the channel has no events, create an empty program
  if (pgmListSize == 0) {
    this.programs.push( new Program({
      duration: 79200000 - window.application.userInfoBox.getCurrentTimestamp(),
      endTime: 79200000,
      genre: '',
      largeThumbnail: '',
      match: 0,
      rating: null,
      startTime: window.application.userInfoBox.getCurrentTimestamp() - 3600000,
      title: 'No events on this channel',
      videoFormat: null
    }, i, pgrSharedInfos) );
  
    // Store list size
    this.lastProgIndex = 0;
  }

};

/**
 *  Get the current program in all the program list (except for too old ones)
 *
 *  @param: {Int} currentTime  Timestamp of the POC current time
 *  @return: {Object}   Program instance which match the timestam parameter
 */
Channel.prototype.getCurrentProgram = function(currentTime) {
  var i = this.firstProgIndex,
      pgmListLength = this.programs.length,
      pgm = null;

  /*console.log('\nRecherche du programme courant sur ' + this.name);
  logTimestampToReadableDate(currentTime, 'Heure courante: ');*/
  while (i < pgmListLength) {
    /*logTimestampToReadableDate(this.programs[i].startTime, this.programs[i].title + ' commence a ');
    logTimestampToReadableDate(this.programs[i].endTime, 'Et finit a ');*/
    if ((currentTime >= this.programs[i].startTime) && (currentTime < this.programs[i].endTime)) {
      pgm = this.programs[i];
      break;
    }

    i++;
  }

  if (pgm == null) {
    console.log('[ERROR] [Channel.getCurrentProgram] Program not found\n');
    pgm = this.programs[this.firstProgIndex];
  }
  /*else {
    console.log('[INFO] [Channel.getCurrentProgram] Program found\n');
    console.log(pgm);
  }*/

  return (pgm);
};

/**
 *  Browse the displayed programs to find one matching with the time parameter
 *  If no display program match this time, the method returns the first program display
 *
 *  @param: {Int} time  Timestamp included in program we want to get
 *  @return: {Object}   Program instance which match the timestamp parameter
 */
Channel.prototype.getDisplayProgramAt = function(time) {
  var i = this.firstProgIndex,
      pgmNbDisplayed = this.programs.length,
      pgm = null;

  // If the first inserted program is later than time, simply return it
  if (this.programs[this.firstProgIndex].startTime > time) {
    pgm = this.programs[this.firstProgIndex];
  }
  else {
    // Browse the displayed list
    while (i < pgmNbDisplayed) {
      if ((time >= this.programs[i].startTime) && (time < this.programs[i].endTime)) {
        pgm = this.programs[i];
        break;
      }

      i++;
    }
  }

  // Don't go too far !
  if (i > this.lastProgIndex)
    pgm = this.programs[this.lastProgIndex];

  if (pgm != null) {
    /*var d1 = new Date(time);
    var d2 = new Date(pgm.startTime);
    var d3 = new Date(pgm.endTime);
    console.log('Heure de check: ' + d1.getHours() + ':' + d1.getMinutes());
    console.log('Le programme ' + pgm.index + ' va de ' + d2.getHours() + ':' + d2.getMinutes() + ' a ' + d3.getHours() + ':' + d3.getMinutes());

    console.log('[INFO] [Channel.getDisplayProgramAt] Program found');
    console.log(pgm);*/
  }
  else {
    console.log('[ERROR] [Channel.getDisplayProgramAt] Program not found');
    pgm = this.programs[this.firstProgIndex];
  }

  return (pgm);
};

/**
 *  Set a minimum in the program list.
 *  Usefull if we have a lot of programs and not all of them are usable / displayable
 *
 *  @param: {Int} index  Index on the first usefull program in program list
 */
Channel.prototype.setFirstProgramIndex = function(index) {  
  this.firstProgIndex = index;
};

/**
 *  Get the first available program in list. Must be intialyzed with 
 *  Usefull if we have a lot of programs and not all of them are usable / displayable
 *
 *  @return: {Int}  Index on the first usefull program in program list
 */
Channel.prototype.getFirstProgramIndex = function() {  
  return (this.firstProgIndex);
};

/**
 *  Remember the current focus program
 *
 *  @param: {Object} program  Current program focussed
 */
Channel.prototype.setCurrentProgramFocus = function(program) {
  if (program == undefined)
    console.log('[ERROR] [Channel.setCurrentProgramFocus] Undefined program')
  else
    this.currentProgramFocussed = program.index;
};

/**
 *  Get the focussed program
 *
 *  @param: {Object} program  The focussed program
 */
Channel.prototype.getFocussedProgram = function() {
  return (this.programs[this.currentProgramFocussed]);
};

/*
  Simply log in console a readable date
*/
function logTimestampToReadableDate(timestamp, text) {
  var date = new Date(timestamp),
      str = '';

  if (text)
    str = text;

  console.log(str + date.getHours() + ':' + date.getMinutes());
}













/*
* Program class
*/
var Program = function (serverProgramObj, index, pgrShareInfos, fakeDatas) {
  var splitData,
      date;
      
  // If the data server is down, parse old json datas
  if (fakeDatas) {
    loadFakeDatas(serverProgramObj, index, pgrShareInfos, this);
    return;
  }

  // UUID
  this.uuid = ChannelEntityGlobalUUID++;
  
  // Program type 
  this.assetType = serverProgramObj.assetType;
  
  // Program title and genre
  this.title = serverProgramObj.title.toUpperCase();
  this.genre = (serverProgramObj.genre == '') ? 'No genre' : serverProgramObj.genre;
  
  // Channel number and logo
  if (this.assetType === BROADCAST) {
    this.channelNumber = serverProgramObj.channelNumber;
    this.channelLogo = serverProgramObj.channelLogo;
  }
  
  // Date timestamp
  date = new Date(serverProgramObj.startTime);

  // Store relative day from this event. 0 for today, 1 for tomorow, and some on...
  this.day = pgrShareInfos.day;

  // Start time timestamp - Timestamp relative to the current day
  this.startTime = date.getHours() * 3600;
  this.startTime += date.getMinutes() * 60;
  this.startTime *= 1000;
  this.startTime += pgrShareInfos.dayOffset;
 
  // If the new program has a start hour earlier than the previous one, we jump to the next day. So increase day offset number
  if (pgrShareInfos.lastStartHour > this.startTime) {
    pgrShareInfos.dayOffset += 86400000;
    this.startTime += 86400000;
  }
  pgrShareInfos.lastStartHour = this.startTime;

  // End time timestamp - Timestamp relative to the current day
  date = new Date(serverProgramObj.endTime);
  this.endTime = date.getHours() * 3600;
  this.endTime += date.getMinutes() * 60;
  this.endTime *= 1000;
  this.endTime += pgrShareInfos.dayOffset;
  
  // If the program starts the current day but ends at 00:10, we will just add 10mn to the endtime.
  // So as we can't have a endtime < startime, adjust the endtime if the value seems too low
  if (this.startTime > this.endTime) {
    this.endTime += 86400000;
    this.day++;
    pgrShareInfos.day++;
  }

  // Duration
  this.duration = serverProgramObj.duration;

  // Poster
  this.poster = serverProgramObj.largeThumbnail;
  this.image = [];

  // Dominent color
  if (serverProgramObj.color) {
    this.color = serverProgramObj.color;
  } else {
    this.color = null;
  }

  // User matching, rating and video format
  this.matching = 10 * Math.floor(serverProgramObj.match / 10);
  this.rating = serverProgramObj.rating;
  this.videoFormat = serverProgramObj.videoFormat;
  if (this.videoFormat != null)
    this.videoFormat = this.videoFormat.toUpperCase();

  // Store program position in list
  this.index = index;

  // GRID EXTRA FIELDS
  this.gridForceTimestampPosition = null;
  this.gridStartTime = null;
  
  if (this.assetType === VOD) {
    this.price = serverProgramObj.price;
    this.moods = serverProgramObj.moods;
    this.plots = serverProgramObj.plots;
    this.actors = serverProgramObj.actors.join();
    this.directors = serverProgramObj.directors.join();
    this.summary = serverProgramObj.summary;
    this.audios = serverProgramObj.audioList.join();
    this.subtitles = serverProgramObj.subtitleList.join();
    this.source = serverProgramObj.url;
  }
};

// ================================================
// This is specific for the grid screen
// ================================================
function loadFakeDatas(serverProgramObj, index, pgrShareInfos, that) {
  var splitData;

  // UUID
  that.uuid = ChannelEntityGlobalUUID++;

  // Program title and genre
  that.title = serverProgramObj.fullName.toUpperCase();
  that.genre = serverProgramObj.genre;
  
  // Date timestamp
  splitData = serverProgramObj.date.split(' ');
  that.date = parseInt(splitData[0], 10);

  // Store relative day from this event. 0 for today, 1 for tomorow, and some on...
  that.day = pgrShareInfos.day;

  // Start time timestamp - Timestamp relative to the current day
  splitData = serverProgramObj.startTime.split(':');
  that.startTime = parseInt(splitData[0], 10) * 3600;
  that.startTime += parseInt(splitData[1], 10) * 60;
  that.startTime *= 1000;
  that.startTime += pgrShareInfos.dayOffset;

  // If the new program has a start hour earlier than the previous one, we jump to the next day. So increase day offset number
  if (pgrShareInfos.lastStartHour > that.startTime) {
    pgrShareInfos.dayOffset += 86400000;
    that.startTime += 86400000;
  }
  pgrShareInfos.lastStartHour = that.startTime;

  // End time timestamp - Timestamp relative to the current day
  splitData = serverProgramObj.endTime.split(':');
  that.endTime = parseInt(splitData[0], 10) * 3600;
  that.endTime += parseInt(splitData[1], 10) * 60;
  that.endTime *= 1000;
  that.endTime += pgrShareInfos.dayOffset;
  
  that.image = [];
  that.image['196x110'] = serverProgramObj.programImage[0].imagePath;
  that.image['462x260'] = serverProgramObj.programImage[0].imagePath;

  // Duration
  that.duration = that.endTime - that.startTime;

  // If the program starts the current day but ends at 00:10, we will just add 10mn to the endtime.
  // So as we can't have a endtime < startime, adjust the endtime if the value seems too low
  if (that.duration < 0) {
    that.endTime += 86400000;
    that.duration = that.endTime - that.startTime;
    that.day++;
    pgrShareInfos.day++;
  }

  // Poster
  that.poster = serverProgramObj.programImage[0].imagePath;

  // Dominent color
  that.color = serverProgramObj.dominentColor;

  // User matching, rating and video format
  that.matching = serverProgramObj.match;
  that.rating = serverProgramObj.rating;
  that.videoFormat = serverProgramObj.videoFormat;

  // Store program position in list
  that.index = index;

  // GRID EXTRA FIELDS
  that.gridForceTimestampPosition = null;
  that.gridStartTime = null;
}

/*
 * getProgramPositionInGrid
 */
Program.prototype.getProgramPositionInGrid = function() {
  var date = new Date(this.startTime);

  if (this.gridForceTimestampPosition != null)
    date = new Date(this.gridForceTimestampPosition);

  // 1mn == 10 px
  return (((date.getDate() - 1) * 1440 + date.getHours() * 60 + date.getMinutes()) * 10);
};

/*
 * getProgramSize
 */
Program.prototype.getProgramSize = function(fromNowTimestamp) {
  var time = new Date(this.duration),
      start,
      now;

  if (fromNowTimestamp) {
    start = new Date(fromNowTimestamp - this.startTime);

    return (((time.getHours() - 1) * 600) + (time.getMinutes() * 10) - ((start.getHours() - 1) * 600) - (start.getMinutes() * 10) - 1);
  }

  // 1mn == 10 px, -1 for the separator size
  return (((time.getHours() - 1) * 600) + (time.getMinutes() * 10) - 1);
};

/*
 * getGridStartTime
 */
Program.prototype.getGridStartTime = function() {
  if (this.gridStartTime)
    return (this.gridStartTime);
  return (this.startTime);
};

/*
 * getFormatedHour
 */
Program.prototype.getFormatedHour = function() {
  var start = new Date(this.startTime),
      end = new Date(this.endTime),
      formatedHour;

  formatedHour = start.getHours() + 'h';
  formatedHour += (start.getMinutes() > 9) ? start.getMinutes() : ('0' + start.getMinutes());
  formatedHour += ' > ' + end.getHours() + 'h';
  formatedHour += (end.getMinutes() > 9) ? end.getMinutes() : ('0' + end.getMinutes());

  return (formatedHour);
};

/**
 *  Return the number of digits for the program start hour.
 *  Usefull in grid to know which style to apply to hide the start hour information. Without this, we have to ovveride the DOM with a new node
 *  @return {Int}   Number of digits which compose the start hour
 */
Program.prototype.getFormatedStartHourNbDigits = function() {
  var start = new Date(this.startTime);

  if (start.getHours() > 9)
    return (2);

  return (1);
};

/**
 *  Return the colorimetry of the program on an asynchronous way
 *  If the colorimetry is not yet perform, do it.
 *  @param {Function}   callback  Callback raised when the data will be ready. Prototype as function (color) { ... }
 */
Program.prototype.getColorimetry = function(callback) {
  var context = this;

  // if the colorimetry is not yet retrevived, get it
  if ((this.color == null) && (this.poster != '')) {
    ADSA.read({
        requestId: REQUEST_UUID++,
        source: "data://cisco/adele/utils/image",
        params: { URL: this.poster, WIDTH: DEFAULT_PICTURE_WIDTH, HEIGHT: DEFAULT_PICTURE_HEIGHT },

        successCallback: function (requestId, picInfos, callId) {
          context.image[(DEFAULT_PICTURE_WIDTH + 'x' + DEFAULT_PICTURE_HEIGHT)] = picInfos.image;
          context.color = picInfos.color;

          // Raise callback
          callback(picInfos.color);
        },
        failureCallback: function (requestId, error, callId) {
          console.log('[ERROR][Program.getColorimetry] cannot retreive colorimetry for [' + context.title + ']');
          console.log(error);
        }
    });
  }
  else
    callback(this.color);
};

/**
 *  Return the picture of the program on an asynchronous way
 *  If the picture is not yet perform, do it.
 *  @param {Function}   callback        Callback raised when the data will be ready. Prototype as function (innerPicressource) { ... }
 *  @param {Int}        desiredWidth    [Optional] Desired pictuire width. By default 196px
 *  @param {Int}        desiredHeight   [Optional] Desired pictuire height. By default 110px
 */
Program.prototype.getPicture = function(callback, desiredWidth, desiredHeight) {
  var context = this,
      width   = DEFAULT_PICTURE_WIDTH,
      height  = DEFAULT_PICTURE_HEIGHT;

  // Overridde default size if needed
  if (desiredWidth)
    width = desiredWidth;
  if (desiredHeight)
    height = desiredHeight;

  // if the colorimetry is not yet retrevived, get it
  if ((this.image[(width + 'x' + height)] == undefined) && (this.poster != '')) {
    ADSA.read({
        requestId: REQUEST_UUID++,
        source: "data://cisco/adele/utils/image",
        params: {URL: this.poster, WIDTH: width, HEIGHT: height},

        successCallback: function (requestId, picInfos, callId) {
          context.image[(width + 'x' + height)] = picInfos.image;
          context.color = picInfos.color;

          // Raise callback
          callback(picInfos.image);
        },
        failureCallback: function (requestId, error, callId) {
          console.log('[ERROR][Program.getPicture] cannot retreive picture for [' + context.title + ']');
          console.log(error);
          callback(null,error);
        }
    });
  }
  else
    callback(this.image[(width + 'x' + height)]);
};
