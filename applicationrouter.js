/**
 Description: routes:   JSON object that associates urls (example: 'page/grid') to functions (example : grid() )
 every time the browser will be requested a URL compliant with this predetermined pattern, for instance 'page/grid', then a method will be called back, example : grid()
 @class ApplicationRouter
 **/
		var counterDragUp = 0;
		var counterDragDown = 0;
		var counterDragLeft = 0;
		var counterDragRight = 0;		
		
        function handleHammer(ev) {
            // disable browser scrolling
            //ev.gesture.preventDefault();

            switch(ev.type) {
			
                case 'tap':
					console.log("handleHammer :: tap")
					window.application.states[window.application.curState].onOkAction();
					//ev.gesture.stopDetect();
					break;	
                case 'doubletap':
					console.log("handleHammer :: doubletap")
					window.application.states[window.application.curState].onBackAction();
					//ev.gesture.stopDetect();
					break;		
                case 'rotate':
					console.log("handleHammer :: rotate")
					window.application.states[window.application.curState].onBackAction();
					//ev.gesture.stopDetect();
					break;							
                case 'dragright':
					console.log("handleHammer :: dragright")
					counterDragRight++;
					if (counterDragRight == 3) 
					{
						counterDragRight = 0;						
						window.application.states[window.application.curState].onRightAction();
						rightEvent.trigger("onRight");
					}
					//ev.gesture.stopDetect();
					break;				
                case 'dragleft':
					console.log("handleHammer :: dragleft")				
					counterDragLeft++;
					if (counterDragLeft == 3) 
					{
						counterDragLeft = 0;						
						window.application.states[window.application.curState].onLeftAction();
						rightEvent.trigger("onLeft");
					}
					//ev.gesture.stopDetect();					
					break;
                case 'dragup':
					console.log("handleHammer :: dragup")						
					counterDragUp++;
					if (counterDragUp == 6) 
					{
						counterDragUp = 0;					
						window.application.states[window.application.curState].onUpAction();
						upEvent.trigger("onUp");
					}
					//ev.gesture.stopDetect();					
					break;			
                case 'dragdown':
					counterDragDown++;
					if (counterDragDown == 6) 
					{
						counterDragDown = 0;			
						console.log("handleHammer :: dragdown")				
						window.application.states[window.application.curState].onDownAction();
						downEvent.trigger("onDown");
					}
					//ev.gesture.stopDetect();					
					break;							

                case 'swipeleft':
					console.log("handleHammer :: swipeleft")
                    ev.gesture.stopDetect();
                    break;

                case 'swiperight':
					console.log("handleHammer :: swiperight")
                    ev.gesture.stopDetect();
                    break;

                case 'release':
                    // more then 50% moved, navigate
					console.log("handleHammer :: release")			
					counterDragUp = 0;
					counterDragDown = 0;
					counterDragLeft = 0;
					counterDragRight = 0;
                    break;
            }
        }

/**
 @namespace window.ApplicationRouter
 **/
window.ApplicationRouter = Backbone.Router.extend({

    // Constants
    TIMECHANGEDTIMERDELAY	: 10000,		// Every 10 seconds

    // Views accessors
    backgroundView		: undefined,	// static view
    videoView			: undefined,	// static view
    titleView			: undefined,	// static view
    flowerView          : undefined,

    states              : { /* our application states */ },
							/* JSON object that will come to be populated later, during initialize */
    model				: undefined,
    ChannelModel		: undefined,
    initState			: 'splash',		// State we want at the application startup
    curState			: undefined,	// Current state of the application: i.e. the current displayed view
    prevState			: undefined,	// The previous viewed view
    changingStateFlag	: false,
    lastChangingTime	: 0,
    curPlatform			: undefined,	// Allow to identify the platform type PC, B7425, IPAD, ANDROID. Contain an element of 'PLATFORMS' enumeration

    lastKeyCode             : 0,
    lastKeyTimestamp        : 0,
    isKeyPress				: false,
    isLongKeyPressMode		: false,
    pressTimer				: undefined,
    userInfoBox             : undefined,
    videoComponent			: undefined,
    noFlower            : false,
    novideo             : undefined,   
    body                : undefined,
    noHub: false,
    channelList         : [],
    profileCounter: undefined,
    hardcodedUserData: ['SERGE', 'JEANNE'], //to be used if one of the orofile requests do fail

    /**
     * Description :    is triggered whenever a new instance of AppRouter is created: as a consequence, a set of controllers will be instantiated as a consequence
     *                  initialisation of the router, then of the application
     * @method initialize
     * @return
     */
    initialize: function () {

		Log.c("###HMA:: ApplicationRouter.initialize()");
        //console.log("[ERIC] ApplicationRouter.initialize()");
        if (App_configuration.debug_curr_time != undefined) {
            console.log("WARNING !!!");
            console.log("WARNING : debug_curr_time="+App_configuration.debug_curr_time);
            console.log("WARNING !!!");
        }

        _.bindAll(this, "onChannelDataLoaded");
        _.bindAll(this, "onChannelDataError");
        _.bindAll(this, "onKeyDown");
        _.bindAll(this, "onKeyUp");
        _.bindAll(this, "onResize");
        _.bindAll(this, "timeChangedTimer");
        _.bindAll(this, "profileSuccessCallback");
        _.bindAll(this, "profileFailureCallback");                 

        // identify the current platform
        Log.c("###HMA:: ApplicationRouter.initialize(): navigator.userAgent='"+navigator.userAgent+"'");
        //console.log("[ERIC] ApplicationRouter.initialize(): navigator.userAgent='"+navigator.userAgent+"'");
        //this.curPlatform = this.PLATFORMS.PC;

        // Delegate events actions to 'this'

        this.body = $('body')[0]; // walk-the-dom, but one only once, maintaining a persistent handle to <body> tag

        // Delegate events actions to 'this'
        document.addEventListener('keyup',   this.onKeyUp,   false);
        document.addEventListener('keydown', this.onKeyDown,   false);
		//document.addEventListener('touchstart', this.handleTouchStart, false);        
		//document.addEventListener('touchmove', this.handleTouchMove, false);
		//document.addEventListener('touchend', this.handleTouchEnd, false);		
        window.addEventListener('resize', this.onResize,  false);

        // fit-to-width shall be applyed straight at the beginning. Not only by "manual" request for resizing main WebView
        this.onResize();      
    },


    /**
     * Description
     * @method start
     * @return
     */
    start: function() {
        //first task to perform: make a request per profile to retrieve the basic data of all profiles
        this.performProfileRequests();
		var options = {
		  preventDefault: true
		};
        new Hammer($('body')[0], options).on("release dragleft dragright dragup dragdown swipeleft swiperight swipeup swipedown tap doubletap", handleHammer);     
		//Hammer.plugins.fakeMultitouch()		
        //console.log("[ERIC] ApplicationRouter.start()");
        Log.c("###HMA:: ApplicationRouter.start()");
        
        // create dynamic views
        // Create all the views and init states

        this.noHub = (window.location.href.toLowerCase().indexOf("nohub") >=0 ) ? true : false;
        this.noFlower = (window.location.href.toLowerCase().indexOf("noflower") >=0 ) ? true : false;

        if (navigator.userAgent.indexOf("QtTestBrowser") !== -1)
        { // middleware  based on Pegasus (<=> VSS-on-RDK meaning Qt5 and WebGL)
            this.noFlower = true; //by default, running EPG on STB V4 implies noflower=true (forced) by default 
        }
    
    },
    /**
     * Retrieve the basic informations for all profiles. For this a web socket must be opened then closed for
     * each profile, with the exception of the default profile for which the websocket will be let open
     */
    performProfileRequests: function () {
        var i, numberOfProfiles = window.profileData.length;
        
        this.profileCounter = numberOfProfiles - 1;
        //begin with the last profile of the list
        this.performSingleProfileRequest();                      
    },
 
     /**
     * Make a request for a profile according to its indexc
     */   
    performSingleProfileRequest: function () {
        ADSA_IMPL.openWebsocket(window.profileData[this.profileCounter].serviceLayerUrl);
        ADSA.read({
           requestId: Date.now(),
           source: 'data://cisco/adele/hub/profile',
           params: {},
           successCallback: this.profileSuccessCallback,
           failureCallback: this.profileFailureCallback            
       });         
   },
   
     /**
     * Successful callback for a profile request
     * {Integer} reqId: the request Id
     * {Object} defaultUserdata the retrieved data for default user
     * {Integer} messId: the message id
     */   
    profileSuccessCallback: function (reqId, userData, messId) {
        console.log("Profile request succeeded");  
        //store the relevant user data  
        window.profileData[this.profileCounter].name = userData.userName;
        this.profileCounter -= 1;
        if (this.profileCounter < 0) {
            //We have reached the last profile, which is also the default profile.
            //The current web socket will remain active and the main actions for application can be performed
            //initialize the flower with the color set
            this.initializeFlowerView(userData.userColor);
            //set user info box with the name provided by the request
            this.userInfoBox = new UserInfosBox(document.querySelector('body'), function () {
                window.application.userInfoBox.setUserName(userData.userName.toLowerCase());
            });
            //initialize all the views
            this.loadData();
        } else {
            //There are remaining profiles, close the current web socket, store the user data and chain another profile request
            ADSA_IMPL.stop();
            this.performSingleProfileRequest();
        }
    },

     /**
     * Failure callback for a profile request
     * If one of the initial profile request does fail, hardcoded profile names will be used instead
     * of the real ones
     */      
    profileFailureCallback: function () {
        console.log("Profile request FAILED");
        var i, defaultUserName = this.hardcodedUserData[0];
        
        //use the hardcoded user data  
        for (i = 0; i < window.profileData.length; i += 1) {
            window.profileData[i].name = this.hardcodedUserData[i];
        }
    
        //initialize the flower with no color set
        this.initializeFlowerView();
        //set user info box with the default hardcoded name
        this.userInfoBox = new UserInfosBox(document.querySelector('body'), function () {
            window.application.userInfoBox.setUserName(defaultUserName.toUpperCase());
        });
       this.loadData();       
    },  

     /**
     * initialize all for the application
     */    
    initializeViews: function () {
        if (this.noHub === false)   {
            this.states[window.application.screens.HUB]      = new HubView({ el: $("#hubview_container") });
            this.changeToState(window.application.screens.HUB);
        } else if (this.noFlower === false)  {
            this.changeToState(window.application.screens.FLOWER);
        }
        
        this.states[window.application.screens.VOD]    = new VodView({ el:$('#vodview_container'), hubAssetEvent: hubAssetEvent });
        this.states[window.application.screens.GRID]   = new GridView({ el:$('#gridview_container') });
        this.states[window.application.screens.INFOLAYER]  = new LayerView({ el:$('#layerview_container') });
        this.states[window.application.screens.VCR]    = new TrickModeView({ el:$('#trickModeview_container'), trickModeAssetEvent: trickModeAssetEvent });     
    },

    
     /**
     * Instanciate the flower view
     * {String} defaultProfileColor: the color for the default profile, used to draw the flower with this color
     */  
    initializeFlowerView: function (defaultProfileColor) {
        if (this.noFlower == false)   {
            this.flowerView = new FlowerView({el: $("#flower_container"),
                flowerColorEvent: flowerColorEvent,
                rightEvent: rightEvent,
                leftEvent:  leftEvent,
                upEvent: upEvent,
                downEvent:  downEvent,
                okEvent:  okEvent,            
                backEvent:  backEvent, 
                changeState: changeState,
                defaultProfileColor: defaultProfileColor});
            $('body').append(this.flowerView.el);
                this.states[window.application.screens.FLOWER] = this.flowerView;
        } else {
            this.body.style.backgroundImage =  "url('resources/images/bg-vod.png')";
        }         
    },  

    /**
     * Description: launch the load of data
     * @method loadChannelData
     * @return
     */
    loadChannelData: function() {

        Log.c("###AXT:: ApplicationRouter.loadChannelData(): launch the load of Data");

        this.ChannelModel = new ChannelCollection();
        this.ChannelModel.fetch({success: this.onChannelDataLoaded, error: this.onChannelDataError});

    },

    /**
     * Description : called when channels and programs data have been loaded successfully
     * @method onChannelDataLoaded
     * @return
     */
    onChannelDataLoaded: function() {

        // PostProcess event list to add some parameters to live evnets to save time
        this.ChannelModel.postProcessEventList();
        //Log.c("###OP:: ApplicationRouter.onChannelDataLoaded(): Data loaded successfully : "+this.ChannelModel.getChannels().length+" channels");

        // Launch "timeChanged" Timer
        this.timeChangedTimer();

        // Trigger
        console.log("Program data loaded ("+this.ChannelModel.getChannels().length+" channels)");
        dataLoaded.trigger("dataLoaded");

        // No HTML video tag for LG
        //if (this.curPlatform == this.PLATFORMS.PC) {
        if (this.videoView) {
            this.videoView.show();
        }

        //switch to next state
        this.changeToState(window.application.screens.VOD);
        //this.changeToState('hubmenu');

    },


    /**
     * Description : called when channels and programs data has been loaded successfully
     * @method onChannelDataError
     * @return
     */
    onChannelDataError: function() {

        console.log("ERROR in data loading !!!!");
        Log.printStackTrace();

    },

    /**
     * Description
     * @method video
     * @return
     */
    video : function () {
        // TODO
    },


    /**
     * Description  : centralized key management
     * @method onKeyUp
     * @param {} e
     * @return
     */
    onKeyUp: function (e) {

        Log.c("###AXT:: ApplicationRouter.onKeyUp(): FIRE = ("+e.type+","+e.keyCode+")");

        if( window.application.pressTimer!=undefined )
        {
            clearTimeout(window.application.pressTimer);
            window.application.pressTimer = undefined;
        }

        if( window.application.isLongKeyPressMode )
            window.application.onExitLongKeyPress(e);

        //this.lastKeyCode		= e.keyCode;
        //this.lastKeyTimestamp	= Date.now();
        this.isKeyPress		    = false;
    },


    /**
     * Description
     * @method onEnterLongKeyPress
     * @param {} key
     * @return
     */
    onEnterLongKeyPress: function (key) {
      console.log("Not implemented.");
    },


    /**
     * Description
     * @method onExitLongKeyPress
     * @param {} key
     * @return
     */
    onExitLongKeyPress: function (key) {
      console.log("Not implemented.");
    },

    /**
     * Description : centralized key management
     * @method onKeyDown
     * @param {} e
     * @return
     */
    onKeyDown: function (e) {
/*
        if( (this.lastKeyCode==e.keyCode) && (Date.now()-this.lastKeyTimestamp)<150 ) {
            return;
        }
*/
        //var test = Date.now();
        //Log.c("###HMA:: ApplicationRouter.onKeyDown(): FIRE = ("+e.type+","+e.keyCode+"): this.curState="+window.application.curState);
        //console.log("onKeyDown "+e.keyCode);
        if( window.application.pressTimer != undefined ) {
            clearTimeout(window.application.pressTimer);
            window.application.pressTimer = undefined;
        }

        // Verify long press validity
        if( window.application.isLongKeyPressMode )
        {
            if( this.lastKeyCode != e.keyCode )
                window.application.onExitLongKeyPress(e);

            this.lastKeyCode      = e.keyCode;
            this.lastKeyTimestamp = Date.now();
            this.isKeyPress		  = true;

            return;
        }

        // If not on "long key press mode", test condition for enter

        // long key press: Manage burst of key down
        if( this.isKeyPress ) {
            window.application.onEnterLongKeyPress(e);
            return;
        }
        // long key press: Normal way, enter on long key press mode is no keyup befor a certain amount of time
        else {
            window.application.pressTimer = setTimeout( function(){window.application.onEnterLongKeyPress(e)}, 700);
        }

		/****************************************************************************************************************/
		/********************* PERFORMANCES trick ***********************************************************************/
		/****************************************************************************************************************/
        window.application.states[window.application.curState].el.className = "";
		/* no more class <view_enter> shall be applied as long as navigation happens on selected current view			*/
		/* this shall have been processed elsewhere in currentView.enter() by subscribing to webkitTransitionEnd event 	*/
		/* and by removing currentView.className => however, for some, it does not work. It doesn't work well. 			*/
		/****************************************************************************************************************/
        
        switch(e.keyCode) {
            case 13:	// ok/enter key
            case 78:	// 'n' key
                window.application.states[window.application.curState].onOkAction();
                //if (    (window.application.curState != "grid")  &&  (window.application.curState != "ondemand"))
                //okEvent.trigger("onOk");
                break;
            case 27:	// back/esc key
            case 8:	    // backspace key
            case -1:	// "guide" key on remote control
            case 0:    // "exit" key on samsung remote control
            case 80:	// 'p' key
            case 174:	// return sur LG via FXI
                window.application.states[window.application.curState].onBackAction();
                //backEvent.trigger("onBack");
                e.preventDefault();
                break;
            case 37:	// left key
            case 83:	// 's' key
                window.application.states[window.application.curState].onLeftAction();
                //if (    (window.application.curState != "grid")  &&  (window.application.curState != "ondemand"))
                {
                    leftEvent.trigger("onLeft");
                }
                break;
            case 38:	// up key
            case 69:	// 'e' key
                window.application.states[window.application.curState].onUpAction();
                //if (    (window.application.curState != "grid")  &&  (window.application.curState != "ondemand"))
                {
                    upEvent.trigger("onUp");
                }
                break;
            case 39:	// right key
            case 68:	// 'd' key
                window.application.states[window.application.curState].onRightAction();
                //if (    (window.application.curState != "grid")  &&  (window.application.curState != "ondemand"))
                {
                    rightEvent.trigger("onRight");
                }
                break;
            case 40:	// down key
            case 88:	// 'x' key
                window.application.states[window.application.curState].onDownAction();
                //if (    (window.application.curState != "grid")  &&  (window.application.curState != "ondemand"))
                {
                    downEvent.trigger("onDown");
                }
                break;
            // Numbers from 0 to 9
            case 48:
            case 49:
            case 50:
            case 51:
            case 52:
            case 53:
            case 54:
            case 55:
            case 56:
            case 57:
                // If the function is available, call it with the pressed number
                if (window.application.states[window.application.curState].onNumberAction)
                    window.application.states[window.application.curState].onNumberAction(e.keyCode - 48);
                break;

            case 427:
                if (window.application.states[window.application.curState].onChannelUpAction)
                    window.application.states[window.application.curState].onChannelUpAction();
                break;
            case 428:
                case 427:
                if (window.application.states[window.application.curState].onChannelDownAction)
                    window.application.states[window.application.curState].onChannelDownAction();
                break;
            default:
                Log.c("###AXT:: ApplicationRouter.onKeyDown(): unknown key = ("+e.type+","+e.keyCode+")");
        }

        this.lastKeyCode		= e.keyCode;
        this.lastKeyTimestamp	= Date.now();
        this.isKeyPress		    = true;
        //Log.c("###AXT:: ApplicationRouter.onKeyDown(): <-- FIRE = ("+e.type+","+e.keyCode+"): this.curState="+window.application.curState+", t="+(Date.now()-test)+"ms");

    },


    /**
     * Description: centralized mouse management : single click (pressed)
     * @method onMouseDown
     * @param {} e
     * @return
     */
    onMouseDown: function (e) {
      console.log("Not implemented.");
    },


    /**
     * Description : centralized mouse management : double click
     * @method onDblClick
     * @param {} e
     * @return
     */
    onDblClick: function (e) {
      console.log("Not implemented.");
    },


    /**
     * Description: centralized mouse management : single click (release)
     * @method onMouseUp
     * @param {} e
     * @return
     */
    onMouseUp: function (e) {
      console.log("Not implemented.");
    },


    /**
     * Description
     * @method onResize
     * @return
     */
    onResize: function () {
        //return;
        Log.c("###AXT:: ApplicationRouter.onResize(): --> <--");
        console.log("onResize");
        /* propotionnal X and Y ratios to cover window content completely */
        var root = document.querySelector("#root_container")
        var xTop = (window.innerWidth) - (parseInt((getComputedStyle(root)).width)) ;
        var yTop = (window.innerHeight) - (parseInt((getComputedStyle(root)).height));
        root.style.left = xTop/2 + "px";
        root.style.top  = yTop/2 + "px";
        var xRatio = (window.innerWidth) / (parseInt((getComputedStyle(root)).width)) ;
        var yRatio = (window.innerHeight) / (parseInt((getComputedStyle(root)).height)) ;
        root.style.webkitTransform = "scale3d(" + xRatio + ", " + yRatio + ", 1)";
    },

	handleTouchStart : function(evt) {                                         
  
	evt.preventDefault();
	
			/*setTimeout(function (){
				if ((evt.touches[0].clientX === xDown) && !touchStarted && (evt.touches[0].clientY === yDown)) {
					// Here you get the Tap event
					$touchArea.text('Tap');
				}
			},200);*/
			
    xDown = evt.touches[0].clientX;                                      
    yDown = evt.touches[0].clientY; 			
},

handleTouchMove : function (evt) {

	evt.preventDefault();

    if ( ! xDown || ! yDown ) {
        return;
    }

    var xUp = evt.touches[0].clientX;                                    
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;
	

        console.log("handleTouchMove:: xUp == " + xUp);
        console.log("handleTouchMove:: yUp == " + yUp);        
	

    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        if ( xDiff > 0 ) {
			console.log("/* left swipe */ ");
			//this.onLeft();
			window.application.states[window.application.curState].onLeftAction();
            /* left swipe */ 
        } else {
            /* right swipe */
			console.log("/* right swipe */ ");
			//his.onRight();			
			window.application.states[window.application.curState].onRightAction();
        }                       
    } else {
        if ( yDiff > 0 ) {
            /* up swipe */ 
			console.log("/* up swipe */ ");
			window.application.states[window.application.curState].onUpAction();			
        } else { 
            /* down swipe */
			console.log("/* down swipe */ ");	
			window.application.states[window.application.curState].onDownAction();			
        }                                                                 
    }
    /* reset values */
    xDown = null;
    yDown = null;
		
},


    /**
     * Description: timer called on a regular basis for clock update, ...
     * @method timeChangedTimer
     * @return
     */
    timeChangedTimer: function () {

        // Do some test update before propagating the event
        TimeManager.update();

        // Event propagation for everyone who bind it
        timeChanged.trigger("onTimeChange");

        // Relaunch the timer
        setTimeout(this.timeChangedTimer, this.TIMECHANGEDTIMERDELAY);

    },

    /**
     * Description
     * @method getCurrentState
     * @return currentState
     */
    getCurrentState: function() {
        return this.curState;
    },


    /**
     * Description
     * @method changeToState
     * @param {} newState
     * @return
     */
    changeToState: function(newState) {
        // debugger
        Log.c("###AXT:: ApplicationRouter.changeToState(): '"+this.curState+"' => '"+newState+"'");
        var newView;
        var curView;
        // Verify validity
        if( newState == this.curState )
            return;
        if( this.changingStateFlag == true ) {
            if( (Date.now()-this.lastChangingTime ) < 3000 )
                return;
            else
            // There is an error, no transition can exceed 3s
                this.changingStateFlag = false;
        }

        // We must exit from longpress mode before change state
        if( this.isLongKeyPressMode )
            this.onExitLongKeyPress();

        // Change state
        this.changingStateFlag = true;
        this.lastChangingTime = Date.now();
        if( this.curState != undefined ) {
            // change from a previous state to another one
            curView = this.states[this.curState];
            var that = this;
            curView.el.addEventListener( 'webkitTransitionEnd', function(e) {
                curView.el.removeEventListener( 'webkitTransitionEnd', arguments.callee, false );
                curView.show(false);
              
				/****************************************************************************************************************/
				/********************* PERFORMANCES quest ***********************************************************************/
				/****************************************************************************************************************/
  
                if (that.curState === window.application.screens.HUB) {
                    newView.el.className = "view_zoomin0";
                } else {//grid, vod, etc
                    newView.el.className = "view_zoomout0";
                }

                newView.enter(this.prevState);


                this.changingStateFlag = false;
            }, false );
            curView.exit(newState);
            this.prevState = this.curState;
            this.curState = newState;
            newView = this.states[this.curState];
        }
        else
        {
            // At the beginning of the application, curState is undefined
            this.prevState = this.curState;
            this.curState = newState;
            this.states[this.curState].enter(this.prevState);
            this.changingStateFlag = false;
        }

        // Trigger event for listener object which need it
        changeState.trigger("onChangeState", this.prevState, this.curState);

        
        /*  Next piece code has been commented in, because it turns out to be BUGGY on KDG stb.
            Indeed: background image defined by CSS style is not changed => black screen rather.
            Next piece of code may come to be re-activated again on V4 STB (low profile) */
        /* if (this.noFlower) {
            switch (this.curState) {
                case window.application.screens.HUB :
                this.body.style.backgroundImage =  "url('resources/images/bg-hub.png')";
                break;
                case window.application.screens.GRID :
                this.body.style.backgroundImage =  "url('resources/images/bg-grid.png')";
                break;  
                case window.application.screens.VOD :
                this.body.style.backgroundImage =  "url('resources/images/bg-vod.png')";
                break;
            } 
        }*/
    },
    
  loadData: function() {
    //debugger
    var that = this,
        options = {},
        now = new Date(),
        start_time,
        end_time;

    // Set time
    now.setHours(now.getHours() - 1);
    start_time = now.getTime();
    end_time = start_time + MAX_HOURS_TO_DISPLAY * 60 * 60 * 1000; //start + 24h
    
    // Retreive Grid informations
    options.uri = 'data://cisco/adele/tv/timeline';
    options.params = {
      COUNT: 12,
      DATETIME_START: start_time,
      DATETIME_END: end_time
    };
    options.successCallback = function (requestId, asset, callId) {
      that.onDataReceived(requestId, asset, callId, that);
    };
    options.failureCallback = function(requestId, error, callId) {
      var xhrDataGrid;

      console.log("[ERROR] [loadData] Read failed : requestId = [" + requestId + "], error = [" + error + "], callId = [" + callId + ']');
      
      // Load fake datas !
      xhrDataGrid = new XMLHttpRequest();
      xhrDataGrid.onreadystatechange = function() {
        if ((xhrDataGrid.readyState == 4) && (xhrDataGrid.status == 200))
          that.onFakeDataReceived(JSON.parse(xhrDataGrid.responseText), that);
      };
      xhrDataGrid.open('GET', 'view/gridDatas.json');
      xhrDataGrid.send();
    }

    // Call to retreive data model datas
    callId = ADSA.read({
      requestId: 28,
      source: options.uri,
      params: options.params,
      successCallback: options.successCallback,
      failureCallback: options.failureCallback});
  },
    
  onDataReceived: function(requestId, grid, callId, context) {
    var listSize = grid.services.length,
        channel,
        i;

    // Parse server response
    for (i = 0; i < listSize; i++) {
      // Create new channel instance
      channel = new Channel(grid.services[i].service);

      // Add programs
      channel.populatePrograms(grid.services[i].contents);

      // Finnally add channel in channelList
      window.application.channelList.push(channel);
    };

    // Set current channel
    window.application.currentChannelIndex = 0;
    
    // Channels and events received. Initialize views
    context.initializeViews();                 
  },

  onFakeDataReceived: function(grid, context) {
    var listSize = grid.live.length,
        channel,
        i;

    // Parse server response
    for (i = 0; i < listSize; i++) {
      // Create new channel instance
      channel = new Channel(grid.live[i]);

      // Add programs
      channel.populatePrograms(grid.live[i].programs, true);

      // Finnally add channel in channelList
      window.application.channelList.push(channel);
    };

    // Set current channel
    window.application.currentChannelIndex = 0;
  
    // Channels and events received. Initialize views
    context.initializeViews();                 
  }
    

});

// initialisation of the ApplicationRouter singleton
$(document).ready(function() {
    window.application = new ApplicationRouter();
    window.application.screens = {};
    window.application.screens.HUB = "hubmenu";
    window.application.screens.VOD = "ondemand";
    window.application.screens.GRID = "grid";    
    window.application.screens.INFOLAYER = "infoLayer";   
    window.application.screens.VCR = "trickMode";    
    window.application.screens.FLOWER = "flowerBackground";    
    window.application.start();
});
 

