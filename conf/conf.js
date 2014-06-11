/**
 Description: Configuration parameters for this application
 @class App_configuration
 **/

var App_configuration = {
    /**
     Description:  flag used for LOGGER purpose
     @property debug
     @type boolean
     @default true
     **/
    debug			: true,
    /**
     Description:  flag used for MOUSE management, which is not implemented yet
     @property mouse_support
     @type boolean
     @default false
     **/
    mouse_support   : false,
    /**
     Description:  string used as a path prefix to give access to JSON data model
     @property base_server
     @type String
     @default  location.pathname
     **/
    base_server		: location.pathname ,		// "webapp_upc",
    /**
     Description:  set the current time for debug purpose if not undefined //new Date(2013, 12, 18, 9, 28, 0)
     @property debug_curr_time
     @type String
     @default  undefined
     **/
    debug_curr_time	: undefined

};

