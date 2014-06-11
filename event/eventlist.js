// eventlist.js
//
// Events definition for this application
//

// FLOWER: Event for the change of color
var flowerColorEvent = _.extend({}, Backbone.Events);
var hubAssetEvent = _.extend({}, Backbone.Events);
var trickModeAssetEvent = _.extend({}, Backbone.Events);


// General: key events
var rightEvent  = _.extend({}, Backbone.Events);
var leftEvent   = _.extend({}, Backbone.Events);
var upEvent     = _.extend({}, Backbone.Events);
var downEvent   = _.extend({}, Backbone.Events);
var okEvent     = _.extend({}, Backbone.Events);
var backEvent   = _.extend({}, Backbone.Events);

// MODEL events
var dataLoaded  = _.extend({}, Backbone.Events);

// TIME events
var timeChanged  = _.extend({}, Backbone.Events);

// STATE events
var changeState = _.extend({}, Backbone.Events);

var readyStateEvent = _.extend({}, Backbone.Events);

var zoomEvent   = _.extend({}, Backbone.Events);


