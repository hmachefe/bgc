/**
 Description: backbone view for the HUB view
 @class HubView
 **/


/////////////////////////////////////////////////////////////////////////////
//
// HubView implementation
//
/////////////////////////////////////////////////////////////////////////////
var HubView = Backbone.View.extend({

  // backbone parameters
  id              : "hubView",
  template        : null,
  FAKE_MODE : false,
  LIVE : 2,
  RIGHT : 1,
  LEFT : -1,
  UP : -1,
  DOWN : 1,
  SHOWCASE_LINE : 1,
  SHOWCASE_TEXT : 2,
  MENU_PROFILE : 0,
  MENU_SHOWCASE_LINE : 1,
  MENU_SHOWCASE_TEXT : 2,
  MENU_FIRST_ITEM : 3,
  MENU_GUIDE_ITEM : 3,
  MENU_LAST_ITEM : 6,
  STARTING_FOCUS_INDEX : 12, // LIVE asset index : (2 * (5+1))+1.
  LIVE_INDEX : 12,
  DELTA_INTER_SHOWCASE : 20,
  DELTA_INTER_ASSET : 30,
  CENTER_PIVOT_WIDTH : 320,
  DIV_MORE_UNSELECTED_WIDTH : 196,
  DIV_VIDEO_WIDTH : 196,
  MAX_ASSETS_BY_SHOWCASE : 5,//5+1 MORE at the end
  CENTER_FOCUS_LEFT_LABEL_MARGIN : 10,
  IMAGES_PATH : "resources/images/",
  LOGO_PATH :  "resources/logos/",
  GRAPHICAL_ASSETS_PATH : "resources/graphicalAssets/hub/",
  IMG_DEFAULT_HUB : "img_default_hub_1.png",
  IMG_DEFAULT_SMALL : "img_default_small_1.png",
  LOGOCHANNEL_WIDTH : 108,
  LOGOCHANNEL_HEIGHT : 70,
  DELTA_BEFORE_FOCUSED_LABEL : 20,
  DELTA_INTER_LABELS : 30,
  BROADCAST : "broadcast",
  VOD : "vod",
  MORE : "more",  
  BROADCAST_WIDTH : 196,
  VOD_WIDTH : 82,
  SHOWCASE_IMG_HEIGHT : 110,
  BROADCAST_CENTER_WIDTH : 320,
  BROADCAST_CENTER_HEIGHT : 180,
  VOD_CENTER_WIDTH : 152,
  VOD_CENTER_HEIGHT : 202,

  ID_ASSET: "asset",
  ID_LOGO : "logo",
  ID_CENTER: "centerAsset",
  ID_CENTER_BKG: "centerAssetBkg",
  ID_CENTER_DATA: "centerAssetData",
  ID_CENTER_BANNER: "centerAssetBanner",
  ID_CENTER_IMG: "centerAssetImg",  
  FOCUSED_ASSET_CLASS : "hubFocusedAsset",
  
  DELAY_HOUR : 100,
  DELAY_INIT_FLOWER : 6000,
  
  ID_PROGRAM : 0,
  ID_SERVICE : 1,
  
  DEFAULT_COLOR : "255,0,0",
  DEFAULT_ALPHA : "0.5",

  count : 0,
  showCaseCenterFocusPivot : undefined,
  videoContainer : undefined,
  showCaseFocusSlide : undefined,
  showcaseLine : undefined,
  showcaseContainer : undefined,
  showcaseList : undefined,
  menuContainer : undefined,
  hubSeparatorMenu : undefined,

  stepShowcaseCenterSlidingArray : [],
  stepShowcaseSlidingArray : [],
  
  profileContainer: undefined,
  
  numberOfShowcases : 7,
  liveLogoChannel : "logo_70x108_13emeRue.png",
  groupingIconBroadcastTop :  "140px",
  liveLogoChannelUrl : "",
  currentProfileIndex: 0,
  activeProfileIndex: 0,   
  focusedProfileElement: undefined,
  profileWidths: [
    96,
    115
  ],
  profileLabels: [],
  profileInitialLeftValue: 370,
  profileGap: 30,
  focusedLabelIndex : 2,
  marginLabels : 0,
  modeNav : "",
  nbItemsMenu : 6,
  focusedMenuItem : 1,
  
  statesHub : {"PROFILE":0,"SHOWCASE_LINE":1,"SHOWCASE_TEXT":2,"MENU":3},
  
  menuLabels : [
        'TV GUIDE',
        'SEARCH',
        'SETTINGS',
        'HELP'
  ],
  menuTranslateY : {
    "SHOWCASE_TEXT" : 0 //38 // showcase text line from 470 to 432
    ,"TV GUIDE": 72 //72 // TV GUIDE from 504 to 432
    ,"SEARCH":36 // SEARCH from 540 to 432 , - 72
    ,"SETTINGS":36 // SETTINGS from 576 to 432, - 108
    ,"HELP":36 // HELP from 612 to 432, - 144
  },
  currentMenuTranslateY : 0,
  currentShowcase : 2,
  currentAsset : 0,
  lastNav : undefined,
  firstTime : true,
  fragment : null,
  imagesArray: [],
  firstLoading : true,
  areImagesLoaded : false,
  isRenderingRequested : false,
  
  showCaseLabel : [
        "SOCIAL HUB"
        ,"LIBRARY"
        ,"TELEVISION"
        ,"FOR ME"
        ,"STORE"
        ,"FOOTBALL"
        ,"MUSIC"
  ],
  // TODO - See if it is possible to use offsetWith. 
  showCaseLabelWidth : [
        178,
        118,
        171,
        110,
        98,
        160,
        95
  ],
  hubShowcasesDataUrls : [
		"data://cisco/adele/hub/social"    // SOCIAL HUB
		,"data://cisco/adele/hub/library"  // LIBRARY
		,"data://cisco/adele/hub/tv"       // TELEVISION
		,"data://cisco/adele/hub/reco"     // FOR ME
		,"data://cisco/adele/hub/onDemand" // STORE
		,"data://cisco/adele/hub/football" // FOOTBALL
    ,"data://cisco/adele/hub/music"    // MUSIC
  ],
  dataReceivedCb : [],
  SOCIAL_HUB_ID : 0,
  LIBRARY_ID : 1,
  TELEVISION_ID : 2,
  RECO_ID : 3,
  STORE_ID : 4,
  FOOTBALL_ID : 5,
  MUSIC_ID : 6,
  showcases: [],
  nbDataReceived : 0,
  currentDataIndex : 0,
  nbImagesToLoad : 0,
  fakeDataMode : false,
  vodList : [],
  progressBar : null,
  smallLiveAsset : null,
  smallLiveLogo : null,
  focusLiveAssetTitle : null,
  focusLiveAssetTime : null,
  
  /*
   * ===================================================================
   * PUBLIC FUNCTIONS (view interface implementation)
   * ===================================================================
   */

  /**
   * Description: initialisation of the view
   * @method initialize
   * @param {} options
   * @return
   */
  initialize: function(options) {
    Log.c("###ELE:: HubView.initialize()");
    this.liveLogoChannelUrl = this.LOGO_PATH + this.liveLogoChannel;
    _.bindAll(this, "render");
    _.bindAll(this, "show");
    _.bindAll(this, "onRightAction");
    _.bindAll(this, "onLeftAction");
    _.bindAll(this, "onUpAction");
    _.bindAll(this, "onDownAction");
    _.bindAll(this, "doShowcaseAnimation");      
    _.bindAll(this, "doShowcaseTextAnimation");
    _.bindAll(this, "changeProfileSuccessCallback");     
    this.lastNav = this.LEFT;
    //use the stored profile data to create the profile labels
    this.fillProfileLabels();
    
    // Request fake data or data from the snowflake data aggregator
    this.loadData(this.FAKE_MODE);
  },

  /**
   * Description : show/hide the view. This function call the render() function.
   * @method show
   * @param {booolean} flag True if the view shall be displayed
   * @return
   */
  show: function( flag ) {
    Log.c("###ELE:: HubView.show("+flag+")");
    if (this.isVisible !== flag) {
      this.el.style.visibility = flag ? "visible" : "hidden";
      this.isVisible = flag;
      this.render();
    }
  },

  /**
   * Description : Enter into the view
   * @method enter
   * @param {} from The previous view 
   * @return no value
   */
  enter: function(from) {
    // activate the view and populate it
    this.show(true);
    // Display the view with a zoom enter if we come back from an other view
    Log.c("###ELE:: HubView.enter() Zoom enter "+(from?"from : "+from:""));
    this.el.className = "view_enter";
  },
  
  /**
   * Description : Exit from this view with a zoom in
   * @method exit
   * @param {} to The next expected view
   * @return no value
   */
  exit: function(to) {
    Log.c("###ELE:: HubView.exit() -> Zoom in to : "+to);
    this.el.className = "view_zoomin";
  },
  
  
  /**
   * Description : render of the view (when something change) This method is in charge also to remove the view.
   * @method render
   * @return The current instance
   */
  render: function() {
    Log.c("###ELE:: HubView.render()");
    if (this.isVisible) {
      Log.c("###ELE:: HubView is visible => Populate the DOM with the hub content");
      window.application.userInfoBox.setViewName('');
      this.startPopulatingView();
    } else {
      if (this.progressBar !== null) {
        this.progressBar.removeProgressBar();
      }
      this.$el.html("");      
    }
    return this;
  },
  
  /**
   * Use stored profile data to build the list of profile labels
   */  
  fillProfileLabels: function () {
      var i;
      
      for (i = 0; i < window.profileData.length; i += 1) {         
          this.profileLabels.push(window.profileData[i].name.toUpperCase());
      }
  },
  
  /**
   * Description Manage the OK arrow key
   * @method onOkAction
   * @return
   */
  onOkAction: function () {
    //Log.c("###HMA:: HubView - OK");
    if (this.modeNav === this.statesHub.SHOWCASE_LINE) {
      var currentFocus = this.STARTING_FOCUS_INDEX + this.count;
      // If the user press OK on the live showcase, switch to data layer view
      if (currentFocus === this.LIVE_INDEX) {
        window.application.changeToState(window.application.screens.INFOLAYER);
        flowerColorEvent.trigger('displacement', 'OK');
      }
      
      // Launch the VOD action menu screen on a VOD asset
      if (this.getAssetType(this.currentShowcase, this.currentAsset) === this.VOD) {
          // The first asset on a left showcase is a "more" asset.
          var currentAsset = this.currentAsset;          
          if (this.currentShowcase < this.LIVE) {
            currentAsset -= 1;
          }
          this.sendAssetSelection(this.showcases[this.currentShowcase][currentAsset].index);
          flowerColorEvent.trigger("displacement", false);
          window.application.changeToState(window.application.screens.VOD);
      } else {
        flowerColorEvent.trigger("displacement", true);
      }
    } 
    else if (this.modeNav === this.statesHub.MENU) {
      // If the user has clicked on TV GUIDE, chqnge screen to GRID
      if (this.focusedMenuItem === this.MENU_GUIDE_ITEM) {
        window.application.videoComponent.unzoom();
        window.application.changeToState(window.application.screens.GRID);
        flowerColorEvent.trigger("displacement", "OK");
      }
    } else if (this.modeNav === this.statesHub.PROFILE) {
        this.changeProfile();
    }
  },
  
  /**
   * Description Manage the UP arrow key
   * @method onUpAction
   * @return
   */
  onUpAction: function () {
    // Go up in the hub menu list
    //console.log("###HMA:: HubView - UP");
    switch (this.focusedMenuItem) {
        case this.MENU_SHOWCASE_LINE:
          this.modeNav = this.statesHub.PROFILE;
          this.removeShowcaseTextFocus();
          this.focusProfileList();                
          break;
        case this.MENU_SHOWCASE_TEXT:
          this.modeNav = this.statesHub.SHOWCASE_LINE;
          flowerColorEvent.trigger('noHorizontalDisplacement', false);
          this.doShowcaseAnimation(this.UP);
          break;          
        case this.MENU_FIRST_ITEM:
          this.modeNav = this.statesHub.SHOWCASE_TEXT;
          this.removeMenuFocus();
          this.doShowcaseTextFocus(this.UP);                  
          break;   
        case this.MENU_PROFILE:
          flowerColorEvent.trigger('noDisplacement', true);
          return;   
        default:
          this.modeNav = this.statesHub.MENU;
          this.doMenuNagivation(this.UP);
          flowerColorEvent.trigger('noDisplacement', false);
    }
    this.focusedMenuItem--;
  },  
  
 /**
   * Description Manage the DOWN arrow key
   * @method onDownAction
   * @return
   */
  onDownAction: function () {
    // Go down in the hub menu list
    //console.log("###HMA:: HubView - DOWN");
    switch (this.focusedMenuItem) {
        case this.MENU_SHOWCASE_LINE:
          this.modeNav = this.statesHub.SHOWCASE_TEXT;
          this.doShowcaseAnimation(this.DOWN);
          flowerColorEvent.trigger('noHorizontalDisplacement', true);
          flowerColorEvent.trigger('noDisplacement', false);
          break;
        case this.MENU_SHOWCASE_TEXT:
          this.modeNav = this.statesHub.MENU;
          this.removeShowcaseTextFocus();
          this.doMenuNagivation(this.DOWN);               
          break;          
        case this.MENU_PROFILE:
          this.modeNav = this.statesHub.SHOWCASE_LINE;
          this.unfocusProfileList();
          this.doShowcaseTextFocus(this.DOWN);                 
          break;
        case this.MENU_LAST_ITEM:
            flowerColorEvent.trigger('noDisplacement', true);
            return;      
        default:
         this.doMenuNagivation(this.DOWN);                 
    }    
    this.focusedMenuItem++;
  },
  
  /**
   * Description Manage the RIGHT arrow key
   * @method onRightActionightAction
   * @return
   */
  onRightAction: function () {
    switch (this.modeNav) {
        case this.statesHub.SHOWCASE_TEXT:
            /* SHOWCASE_TEXT : navigation not yet implemented. */
            break;
        case this.statesHub.PROFILE:
            this.moveProfileList(this.RIGHT);      
            break;                       
        case this.statesHub.SHOWCASE_LINE:
            var doMove = this.moveShowcaseLine(this.RIGHT);
            flowerColorEvent.trigger('noDisplacement', !doMove);             
            break;                 
    }
  },
  
  /**
   * Description
   * @method onLeftAction
   * @return
   */
  onLeftAction: function () {
    switch (this.modeNav) {
        case this.statesHub.SHOWCASE_TEXT:
            /* SHOWCASE_TEXT : navigation not yet implemented. */
            flowerColorEvent.trigger('noHorizontalDisplacement', true);
            break;
        case this.statesHub.PROFILE:
            this.moveProfileList(this.LEFT);      
            break;                       
        case this.statesHub.SHOWCASE_LINE:
            flowerColorEvent.trigger('noHorizontalDisplacement', false);
            var doMove = this.moveShowcaseLine(this.LEFT);
            flowerColorEvent.trigger('noDisplacement', !doMove);  
            break;                 
    }      
  },

  /*
   * ===================================================================
   * PRIVATE FUNCTIONS - Hub view implementation
   * ===================================================================
   */
  
  /*
   * ===================================================================
   * DATA LOADING
   * ===================================================================
   */
  
  /* Description Request the data for each showcase from the Service Layer component throught the crudAPI. 
   * @method loadData
   */
  loadData: function(fakeDataMode) {
    console.log("loadData");
    var callId, options = {};
    // Define the showcase callback 
    this.dataReceivedCb = [
      dataReceivedSocialCb,
      dataReceivedLibraryCb,
      dataReceivedTvCb,
      dataReceivedRecoCb,
      dataReceivedStoreCb,
      dataReceivedFootballCb,
      dataReceivedMusicCb
    ];

    var context = this;

    if (fakeDataMode) {
      // ===== FAKE DATA
      this.loadFakeData();
    } else {
      // ===== REQUEST DATA FROM SNOWFLAKE DATA AGGREGATOR
      // Request a data loading for each showcase
      for (var i = 0; i < this.hubShowcasesDataUrls.length; i++) {
        if (i === this.LIVE) {
          // Do not perform anymore live URI : it shall be the current event of the current channel.
          continue;
        }
        options.params = {COUNT: 5};
        options.uri = this.hubShowcasesDataUrls[i];
        options.failureCallback = function(requestId, error, callId) {
            console.log("read failed : requestId = "+requestId+", error = "+error+", callId = "+callId);
            // We switch into fake data mode
            if (!context.fakeDataMode) {
              console.log("Switch to fake data mode");
              context.loadFakeData();
            }
        }
        options.successCallback = this.dataReceivedCb[i];
        console.log("Data requested for : "+options.uri);
        callId = ADSA.read({
            requestId: Date.now(),
            source: options.uri,
            params: options.params,
            successCallback: options.successCallback,
            failureCallback: options.failureCallback
        });
      }
    }
   // Callback definitions. 
    function dataReceivedSocialCb(requestId, content, callId) {
      context.dataReceived(context.SOCIAL_HUB_ID,content);
    };
    
    function dataReceivedLibraryCb(requestId, content, callId) {
      context.dataReceived(context.LIBRARY_ID,content);
    };
    
    function dataReceivedTvCb(requestId, content, callId) {
      context.dataReceived(context.TELEVISION_ID,content);
    };
    
    function dataReceivedRecoCb(requestId, content, callId) {
      context.dataReceived(context.RECO_ID,content);
    };
    
    function dataReceivedStoreCb(requestId, content, callId) {
      context.dataReceived(context.STORE_ID,content);
    };
    
    function dataReceivedFootballCb(requestId, content, callId) {
      context.dataReceived(context.FOOTBALL_ID,content);
    };
    
    function dataReceivedMusicCb(requestId, content, callId) {
      context.dataReceived(context.MUSIC_ID,content);
    };
  },
  
  /*
   * Description Allow to load an embedded data model
   * @method loadFakeData
   */
  loadFakeData: function() {
      this.nbDataReceived = 0;
      this.fakeDataMode = true;
      xhrDataHub = new XMLHttpRequest();
      var context = this;
      xhrDataHub.onreadystatechange = function() {
        if ((xhrDataHub.readyState == 4) && (xhrDataHub.status == 200))
          context.onFakeDataReceived(JSON.parse(xhrDataHub.responseText), context);
      };
      xhrDataHub.open('GET', 'view/hubData.json');
      xhrDataHub.send();
  },

  /*
   * Description Callback to proceed the fake JSON data
   * @method onFakeDataReceived
   */
  onFakeDataReceived: function(fakeData, context) {
    console.log("isRenderingRequested "+context.isRenderingRequested);
    console.log("==== Fake data received");
    for (var i = 0; i < fakeData.length; i++) {
      var data = fakeData[i];
      context.dataReceivedCb[i](null,data,null);
    }
  },

  /*
   * Description Callback to proceed the data received from the Service Layer
   * @method dataReceived
   */
  dataReceived: function(showcaseNumber,asset) {
    // Create for each asset the corresponding program
    // There shall be 5 assets definition.
    var pgrSharedInfos = { initialDay: -1, dayOffset: 0 };
    this.showcases[showcaseNumber] = [];
    if (showcaseNumber != this.LIVE) {
      var nbAssets = asset.contents.length;
      if (nbAssets !== this.MAX_ASSETS_BY_SHOWCASE) {
        console.log("[HUB] WARNING showcase "+this.showCaseLabel[showcaseNumber]+": expected "+this.MAX_ASSETS_BY_SHOWCASE+" assets, received "+nbAssets);
      }
      content = asset.contents;
      var program, width, height;
      var currentShowcase = this.showcases[showcaseNumber];
      for (var i = 0; (i < this.MAX_ASSETS_BY_SHOWCASE) && (i < nbAssets) ; i++) {
        program = new Program(content[i],this.currentDataIndex++,pgrSharedInfos);
        if (program.assetType === this.VOD){
          this.vodList.push(program);
        }
        
        currentShowcase[i] = program;
        // get the picture and its colorimetry
        if (program.assetType === this.VOD) {
          width = this.VOD_CENTER_WIDTH;
          height = this.VOD_CENTER_HEIGHT;
        } else {
          width = this.BROADCAST_CENTER_WIDTH;
          height = this.BROADCAST_CENTER_HEIGHT;
        }
        if (!this.fakeDataMode) {
          this.nbImagesToLoad++;
          currentShowcase[i].getPicture(pictureCallback,width,height);
        }
      }
      // Create default assets if not available
      if (i < this.MAX_ASSETS_BY_SHOWCASE) {
        // TODO
      }
    } else {
      // LIVE showcase : there is a content and a service
      if (this.fakeDataMode) {
        var uib = window.application.userInfoBox;
        var startTime = uib.getCurrentHourTimestamp() - (2 * 3600 * 1000);
        var endTime = startTime + ((2 * 3600 + 1800)* 1000);
        asset.services[0].contents[0].startTime = startTime;
        asset.services[0].contents[0].endTime = endTime;
      }      
      var program = new Program(asset.services[0].contents[0],this.currentDataIndex++,pgrSharedInfos);
      var service = new Channel(asset.services[0].service);
      this.showcases[showcaseNumber][0] = [program,service];
      
      if (!this.fakeDataMode) {
        program.getPicture(pictureCallback,this.BROADCAST_WIDTH,this.SHOWCASE_IMG_HEIGHT);
        this.nbImagesToLoad++;
      }
    }
    this.nbDataReceived++;
    if (this.fakeDataMode === true) {      
      if (this.nbDataReceived === this.numberOfShowcases) {
        this.areImagesLoaded = true;
        window.application.vodProgramList = this.vodList;
        console.log("[HUB] Fake mode : built the view");
        this.continuePopulatingView();
      }
    }
    
    var ctx = this;
    function pictureCallback (picture,error) {
      if (picture === null) {
        //  this case, check Program.image = '' and display a default image for the corresponding asset
        console.log("[Error] Image not loaded : "+error);
      }
      ctx.nbImagesToLoad--;
      // If all asset contents received, check if all pictures are now loaded.
      if ((ctx.nbImagesToLoad === 0) && (ctx.nbDataReceived === (ctx.numberOfShowcases-1))) {
        console.log("[HUB] All pictures loaded");
        ctx.areImagesLoaded = true;
        window.application.vodProgramList = ctx.vodList;
        if (ctx.isRenderingRequested === true) {
          console.log("[HUB] Rendering requested : built the view");
          setTimeout(function(){ctx.continuePopulatingView();},3000);
          
        }
      }
    };
  },
  
  
   /**
   * Description Function in charge to populate the view with all the content.
   * If the prefetching of the images is not yet finished, it is delegated to the image loaded callback.
   * @method startPopulatingView
   */
  startPopulatingView: function() {
    if (this.fakeDataMode && this.firstLoading) {
      return;
    }
    console.log("[HUB] startPopulatingView");
    if (this.areImagesLoaded === true)
    {
      console.log("[HUB] Images already loaded : built the view");
      this.continuePopulatingView();
    } else {
      this.isRenderingRequested = true;
    }
  },

  /* Description Build the view once all the data and the images / color loaded
   * @method continuePopulatingView 
   */
  continuePopulatingView : function() {
    
    if (this.fakeDataMode) {
      this.doNextStep(this);
      return;
    }
    
    console.log("[HUB] Get the current program");
    var context = this;
    var currentService = window.application.channelList[window.application.currentChannelIndex];
    
    var currentProgram = currentService.getCurrentProgram();
    this.showcases[this.LIVE] = [];
    this.showcases[this.LIVE][0] = [currentProgram,currentService];
    currentProgram.getPicture(
      function(pic) {
        if (pic !== null) {
          context.doNextStep(context);
        } else {
          console.log("[HUB] Error to load the current event picture!");
        }
      },context.BROADCAST_WIDTH, context.SHOWCASE_IMG_HEIGHT);
  },
  
  updateLiveAssets: function() {
    // Update the live content
    var currentProgram = this.showcases[this.LIVE][0][this.ID_PROGRAM];
    var currentService = this.showcases[this.LIVE][0][this.ID_SERVICE];
    this.smallLiveAsset.style.backgroundImage = "url("+currentProgram.image[this.BROADCAST_WIDTH+'x'+this.SHOWCASE_IMG_HEIGHT]+")";
    this.smallLiveLogo = currentService.logo;
    this.focusLiveAssetTitle.innerText = currentProgram.title;
    this.focusLiveAssetTime.innerText = currentProgram.getFormatedHour();
  },
  
  doNextStep: function(context) {
    context.fragment = document.createDocumentFragment();
    
    if (context.firstLoading === true) {
      context.init();
      context.buildShowcases();
      context.buildShowCaseCenterDomContent();
    } 
    if (!this.fakeDataMode) {
      context.updateLiveAssets();
    }
    context.fragment.appendChild(context.profileContainer);
    context.fragment.appendChild(context.showcaseContainer);
    context.fragment.appendChild(context.showCaseCenterFocusPivot);
    context.fragment.appendChild(context.hubVerticalMenuViewport);
    context.el.appendChild(context.fragment);
    
    context.checkVideoComponent();
    
    if (context.firstLoading === true) {
      context.initializeDefaultShowcasePositions();    
      context.firstLoading = false;
    }
  },

  /*
   * =======================================================================
   *  INITIALIZATIONS 
   * =======================================================================
   */
  
  /**
   * Description Initialize the members
   * @method init
   */
  init : function() {
  
    // By default the focused item is the showcase line
    this.modeNav = this.statesHub.SHOWCASE_LINE;

    // Initialize profile bar
    this.initializeProfileBar(); 
    
    // Initialise showcase line.
    this.initShowcaseLine();
    
    // The centered component with its inner list.
    this.initCenterElement();

    // Build the showcase labels line
    this.buildShowcaseLabelsList();

    // Build the vertical menu   
    this.buildMenu();
    
    // Compute the sliding steps for the small list
    this.setupStepShowcaseSlidingArray();
  },

  /**
   * Description
   * @method lizeDefaultShowcasePositions 
   * @return no value
   */
  initializeDefaultShowcasePositions : function () {
    
    // No animations shall be applied here.
    
    // Current focused asset (the default one or the last one)
    var currentFocus = this.STARTING_FOCUS_INDEX + this.count;
    
    // Move the centered list on the current focused asset
    this.stepFocus = - this.stepShowcaseCenterSlidingArray[currentFocus];
    this.showCaseFocusSlide.style.marginLeft = this.stepFocus + "px";
    // Define the transition effect for the centered component
    this.showCaseFocusSlide.classList.add('hubTransform');
    // Update the size of the element behind the centered focus element    
    var behindAsset = document.querySelector("#" + this.ID_ASSET +currentFocus);
    behindAsset.style.width = "0px";
    behindAsset.style.marginLeft = this.CENTER_PIVOT_WIDTH + "px";
    // We move the list to the focus element position and setup the margin left with the position for the focused element
    this.showcaseLine.style.left = "370px";
    var stepLeft = - this.stepShowcaseSlidingArray[currentFocus];
    this.showcaseLine.style.marginLeft = stepLeft + "px";
    // Define the transition effect for the showcase line 
    this.showcaseLine.classList.add('hubTransform');
  },

  /*
   * Description Compute the required translation value for each asset in the asset list
   * @method setupStepShowcaseSlidingArray
   * @return none
   */
  setupStepShowcaseSlidingArray : function() {
    this.stepShowcaseSlidingArray = [];
    var k = 0;
    for (var i = 0; i < this.LIVE; i++) {
      for (var j = 0; j < (this.MAX_ASSETS_BY_SHOWCASE+1); j++) {
        if (j === this.MAX_ASSETS_BY_SHOWCASE) {
          //var value = this.stepShowcaseSlidingArray[k - 1] + showCaseImagesW[i][4] + this.DELTA_INTER_SHOWCASE;
          var value = this.stepShowcaseSlidingArray[k - 1] + this.getImgWidth(i,this.MAX_ASSETS_BY_SHOWCASE-1) + this.DELTA_INTER_SHOWCASE;
          this.stepShowcaseSlidingArray.push(value);
        } else {
          if (k > 0) {
            this.stepShowcaseSlidingArray.push(this.stepShowcaseSlidingArray[k - 1] + this.DELTA_INTER_ASSET);
          } else {
            this.stepShowcaseSlidingArray.push(this.DELTA_INTER_ASSET);
          }
        }
        k++;
      }
    }
    this.stepShowcaseSlidingArray.push(this.stepShowcaseSlidingArray[k - 1] + this.DIV_VIDEO_WIDTH + this.DELTA_INTER_SHOWCASE);
    k++;
    for (var i = this.LIVE+1; i < this.numberOfShowcases; i++) {
      for (var j = 0; j < (this.MAX_ASSETS_BY_SHOWCASE+1); j++) {
        if (j === this.MAX_ASSETS_BY_SHOWCASE) {
          var value = this.stepShowcaseSlidingArray[k - 1] + this.DIV_MORE_UNSELECTED_WIDTH + this.DELTA_INTER_SHOWCASE;
          this.stepShowcaseSlidingArray.push(value);
        } else {
          this.stepShowcaseSlidingArray.push(this.stepShowcaseSlidingArray[k - 1] + this.DELTA_INTER_ASSET);
        }
        k++;
      }
    }
    this.stepShowcaseSlidingArray.unshift(0);
  },
  
  /*
   * Description : Ininitialize the video component (focus part and PIP mode)
   * @method checkVideoComponent
   * @return no value
   */
  checkVideoComponent : function() {
    var videoComponent = window.application.videoComponent;

    // Check if the videoComponent is initialyzed
    if (videoComponent === undefined) {
      // Instanciate videoComponent
      videoComponent = window.application.videoComponent = new VideoComponent(document.querySelector('body'));

      // Zap to the current channel
      videoComponent.setTexturedMode(true);
      videoComponent.zapTo(window.application.channelList[window.application.currentChannelIndex].source, true);

      // Add video on focus slideshow
      videoComponent.displayVideoOnNode(this.videoContainer, VideoAnimationType.NoAnimation, undefined, 5);
      var nodeVideo = document.querySelector("#vc-video-container");
      nodeVideo.style.left = "370px";
      this.videoContainer.style.left = "370px";
      var asset = this.showcases[this.LIVE][0][this.ID_PROGRAM];
      this.progressBar = new ProgressBar(window.application.userInfoBox);
      this.progressBar.displayProgressBar(nodeVideo, asset.startTime, asset.endTime,"height:3px");
        
      //Use the video colorimetry : the video is focused <=> init
      videoComponent.startColorimetry();
    } else {      
      var currentFocus = this.count + this.STARTING_FOCUS_INDEX;
      if (currentFocus === this.LIVE_INDEX) {
        var nodeVideo = document.querySelector("#vc-video-container");
        var asset = this.showcases[this.LIVE][0][this.ID_PROGRAM];
        this.progressBar = new ProgressBar(window.application.userInfoBox);
        this.progressBar.displayProgressBar(nodeVideo, asset.startTime, asset.endTime,"height:3px");
        progressBar = document.getElementById("progress-bar");
        if (this.modeNav === this.statesHub.MENU) {
          videoComponent.displayVideoInPIP(VideoAnimationType.RightToLeft);
          progressBar.style.visibility = "hidden";
        } else {
        //No fullscreen mode <=> deactivate video texturing
        videoComponent.setTexturedMode(true);
        videoComponent.displayVideoOnNode(this.videoContainer,
          VideoAnimationType.NoAnimation,
          function() {nodeVideo.style.left = "370px";},
          5);
        //Use the video colorimetry
        videoComponent.startColorimetry();
        
        }
      } else {
        videoComponent.displayVideoInPIP(VideoAnimationType.RightToLeft);
        //Check if the video component is using the colorimetry : stop it in this case.
        if (videoComponent.isStartColorimetry()) {
          videoComponent.stopColorimetry();
        }

      }
    }
  },
  
  /*
   * =======================================================================
   *  BUILD THE SMALL ASSETS LIST 
   * =======================================================================
   */

  /*
   * Description Create the view port and the container for the small list of assets
   * @method initShowcaseLine
   */
  initShowcaseLine : function() {
    this.showcaseContainer = document.createElement("div");
    this.showcaseContainer.id = "hubShowcaseContainer";
    this.showcaseLine = document.createElement("ul");
    this.showcaseLine.style.marginLeft = "0px";
    this.showcaseLine.className = "hubShowcaseList";
    this.showcaseContainer.appendChild(this.showcaseLine);
  },

  /*
   * Descrition Build the showcases displayed on the showcase line
   * @method buildShowcases
   */
  buildShowcases: function() {
    var fromId = 0, showcase, imgs, color, list = this.showcaseLine;
    
    // Showcases on the left of LIVE
    var lastId = this.buildShowcasesInitialStateOnLeft(fromId);
    fromId = lastId;

    // LIVE showcase
    var image;
    if (this.fakeDataMode) {
      image = this.IMAGES_PATH + this.showcases[this.LIVE][0][this.ID_PROGRAM].poster; 
    } else {
      image = this.showcases[this.LIVE][0][this.ID_PROGRAM].image[this.BROADCAST_WIDTH + 'x' + this.SHOWCASE_IMG_HEIGHT]; 
    }
    showcase = this.buildLiveShowcase(2,fromId,image);
    list.appendChild(showcase);
    fromId++;
    
    // Showcases on the right of LIVE
    this.buildShowcasesInitialStateOnRight(fromId);
    
  },
  
  /*
   * Description Create the showcases on the left side of the live asset in their initial state
   * @method buildShowcasesInitialStateOnLeft
   */
  buildShowcasesInitialStateOnLeft: function(fromId) {
    var showcase, imgs, color, list = this.showcaseLine, id = fromId;
    for (var i = 0; i < this.LIVE; i++) {
      showcase = this.buildShowcaseLeft(i,id);
      id += this.MAX_ASSETS_BY_SHOWCASE + 1;
      list.appendChild(showcase);      
    }
    return id;
  },
  
  /*
   * Description Build the showcase with the live asset
   * @method buildLiveShowcase
   */
  buildLiveShowcase: function(number,id,image) {
    var showcase = document.createElement("li");
    var showcaseList = document.createElement("ul");
    showcase.id = "showcase" + number;
    showcase.className = "hubShowcase";
    showcaseList.className = "hubShowcaseAssets";
    var asset = document.createElement("li");
    asset.id = this.ID_ASSET + id;
    asset.style.backgroundImage = "url("+ image + ")";
    asset.style.backgroundSize = this.DIV_VIDEO_WIDTH + "px " + this.SHOWCASE_IMG_HEIGHT + "px";
    asset.style.width = this.DIV_VIDEO_WIDTH + "px";
    asset.className = "hubAsset";
    this.smallLiveLogo = this.buildLiveChannelLogo(id);
    asset.appendChild(this.smallLiveLogo);
    this.smallLiveAsset = asset;
    showcaseList.appendChild(asset);
    showcase.appendChild(showcaseList);
    return showcase;
  },

  /*
   * Description Create the showcases on the left side of the live asset in their initial state
   * @method buildShowcasesInitialStateOnLeft
   */
  buildShowcasesInitialStateOnRight: function(fromId) {
    var showcase, imgs, moreColor, list = this.showcaseLine, id = fromId;
    for (var i = this.LIVE+1; i < this.numberOfShowcases; i++) {
      showcase = this.buildShowcaseRight(i,id);
      id += this.MAX_ASSETS_BY_SHOWCASE + 1;
      list.appendChild(showcase);      
    }    
  },
  
  /*
   * Description Create a left showcase in its initial state
   * In this case, the showcase is open on the right
   * @method buildShowcaseLeft
   */
  buildShowcaseLeft: function(number,fromId) {
    var useDefaultColor = false;
    // container of the assets
    var showcase = document.createElement("li");
    showcase.id = "showcase" + number;
    showcase.className = "hubShowcase";
    // Assets list
    var showcaseList = document.createElement("ul");
    showcaseList.className = "hubShowcaseAssets";

    
    var currentId = fromId, id = this.ID_ASSET + currentId, asset,width,widthImg, currentAsset, image;
    // The more asset is the bottom element and it's transparent
    var moreBgColor;
    if (!this.fakeDataMode) {
      moreBgColor = this.showcases[number][0].color;
      if (moreBgColor === null) {
        moreBgColor = "rgba("+this.DEFAULT_COLOR+","+this.DEFAULT_ALPHA+")";
      }
    } else {
      moreBgColor = this.getColor(number,0);
    }
    var moreAsset = this.buildMoreAsset(id,this.DELTA_INTER_ASSET,moreBgColor);
    var title = document.createElement("div");
    title.id = "hubMoreTitle"+currentId;
    title.className = "hubAssetMoreTitleLeft";
    title.innerText = "MORE";
    moreAsset.appendChild(title);
    var degrade = document.createElement("div");
    degrade.id = "degrade" + currentId;
    degrade.className = "hubAssetLeftGradient";
    moreAsset.appendChild(degrade);
    showcaseList.appendChild(moreAsset);    
    currentId++;
    
    // Add the other assets : the last one shall be completely visible on the right.
    for (var i = 0; i < this.MAX_ASSETS_BY_SHOWCASE; i++) {
      currentAsset = this.showcases[number][i];
      id = this.ID_ASSET + currentId;
      if (i === this.MAX_ASSETS_BY_SHOWCASE - 1) {
        width = this.getImgWidth(number,i);
      } else {
        width = this.DELTA_INTER_ASSET;
      }
      var withRequested, heightRequested;
      if (currentAsset.assetType === this.BROADCAST) {
        widthImg = this.BROADCAST_WIDTH;
        withRequested = this.BROADCAST_CENTER_WIDTH;
        heightRequested = this.BROADCAST_CENTER_HEIGHT;        
      } else {
        widthImg = this.VOD_WIDTH;
        withRequested = this.VOD_CENTER_WIDTH;
        heightRequested = this.VOD_CENTER_HEIGHT;        
      }
      if (this.fakeDataMode) {
        image = this.IMAGES_PATH + currentAsset.poster;
      } else {
        image = currentAsset.image[withRequested + 'x' + heightRequested];
      }
      // Case where the images is missing
      if (image === undefined) {
        image = this.GRAPHICAL_ASSETS_PATH + this.IMG_DEFAULT_SMALL;
        useDefaultColor = true;
      }
      asset = this.buildGenericAsset(id,width,image,widthImg + "px " + this.SHOWCASE_IMG_HEIGHT + "px","left");
      if (useDefaultColor) {
        // Set an asset color for the flower
        currentAsset.color = this.DEFAULT_COLOR;
        asset.style.backgroundColor = "rgba("+this.DEFAULT_COLOR+","+this.DEFAULT_ALPHA+")";
        useDefaultColor = false;
      }
      
      if (currentAsset.assetType === this.BROADCAST) {
        var logo = this.buildBroadcastChannelLogo(number,i,currentId);
        asset.appendChild(logo);
        if (width === this.DELTA_INTER_ASSET) {
          logo.style.visibility = "hidden";
        }
      }
      
      var div = document.createElement("div");
      div.id = "degrade" + currentId;
      div.className = "hubAssetLeftGradient";
      if (i === this.MAX_ASSETS_BY_SHOWCASE - 1) {
        div.style.width = "0px";
      }
      asset.appendChild(div);
      showcaseList.appendChild(asset);
      currentId++;
    }
    
    showcase.appendChild(showcaseList);
    return showcase;
  },
  
  /*
   * Description Create a right showcase in its initial state
   * In this case, the showcase is open on the left
   * @method buildShowcaseRight
   */
  buildShowcaseRight: function(number,fromId) {
    var useDefaultColor = false;
    // container of the assets
    var showcase = document.createElement("li");
    showcase.id = "showcase" + number;
    showcase.className = "hubShowcase";
    // Assets list
    var showcaseList = document.createElement("ul");
    showcaseList.className = "hubShowcaseAssets";

    var currentId = fromId, id, asset, width, widthImg, currentAsset, image;
    // Add the other assets : the first one shall be completely visible on the left.
    for(var i = 0; i < this.MAX_ASSETS_BY_SHOWCASE; i++) {
      currentAsset = this.showcases[number][i];
      id = this.ID_ASSET + currentId;
      if (i === 0) {
        width = this.getImgWidth(number,0);
      } else {
        width = this.DELTA_INTER_ASSET;
      }
      var withRequested, heightRequested;
      if (currentAsset.assetType === this.BROADCAST) {
        widthImg = this.BROADCAST_WIDTH;
        withRequested = this.BROADCAST_CENTER_WIDTH;
        heightRequested = this.BROADCAST_CENTER_HEIGHT;        
      } else {
        widthImg = this.VOD_WIDTH;
        withRequested = this.VOD_CENTER_WIDTH;
        heightRequested = this.VOD_CENTER_HEIGHT;        
      }
      if (this.fakeDataMode) {
        image = this.IMAGES_PATH + currentAsset.poster;
      } else {
        image = currentAsset.image[withRequested + 'x' + heightRequested];
      }
      // Case where the images is missing
      if (image === undefined) {
        image = this.GRAPHICAL_ASSETS_PATH + this.IMG_DEFAULT_SMALL;
        useDefaultColor = true;
      }
      asset = this.buildGenericAsset(id,width,image,widthImg + "px " + this.SHOWCASE_IMG_HEIGHT + "px","right");
      if (useDefaultColor) {
        currentAsset.color = this.DEFAULT_COLOR;
        asset.style.backgroundColor = "rgba("+this.DEFAULT_COLOR+","+this.DEFAULT_ALPHA+")";
        useDefaultColor = false;
      }
      if (currentAsset.assetType === this.BROADCAST) {
        var logo = this.buildBroadcastChannelLogo(number,i,currentId);
        asset.appendChild(logo);
        if (width === this.DELTA_INTER_ASSET) {
          logo.style.visibility = "hidden";
        }
      }
      
      var div = document.createElement("div");
      div.id = "degrade" + currentId;
      div.className = "hubAssetRightGradient";
      if (i === 0) {
        div.style.width = "0px";
      }
      asset.appendChild(div);
      showcaseList.appendChild(asset);
      currentId++;
    }
    // The more asset is the bottom element on the right and it's transparent
    id = "asset"+currentId;
    var moreBgColor;
    if (!this.fakeDataMode) {
      moreBgColor = this.showcases[number][this.MAX_ASSETS_BY_SHOWCASE - 1];
      if (moreBgColor === null) {
        moreBgColor = "rgba("+this.DEFAULT_COLOR+","+this.DEFAULT_ALPHA+")";
      }
    } else {
      moreBgColor = this.getColor(number,this.MAX_ASSETS_BY_SHOWCASE - 1);      
    }
    var moreAsset = this.buildMoreAsset(id,this.DELTA_INTER_ASSET,moreBgColor);
    var deg = document.createElement("div");
    deg.id = "degrade" + currentId;
    deg.className = "hubAssetRightGradient";
    moreAsset.appendChild(deg);
    var title = document.createElement("div");
    title.id = "hubMoreTitle" + currentId;
    title.className = "hubAssetMoreTitleRight";
    title.innerText = "MORE";
    moreAsset.appendChild(title);   
    showcaseList.appendChild(moreAsset);
    showcase.appendChild(showcaseList);
    return showcase;
  },
  
  /*
   * Description : Get the image width for a given asset. This is used during the list building. 
   * @method getImgWidth
   * @param {number} showcase The showcase number
   * @param {number} asset The asset number 
   * @return The requested width in pixels
   */
  getImgWidth: function(showcase,asset) {
    var type = this.showcases[showcase][asset].assetType;
    if (type === this.BROADCAST) {
      return this.BROADCAST_WIDTH;
    } else {
      return this.VOD_WIDTH;
    }
  },
  
  /*
   * Description Allow to add the live asset logo
   * @method buildLiveChannelLogo
   */
  buildLiveChannelLogo: function(id) {
    var divChannelLogo, logoUrl;
    divChannelLogo = document.createElement("div");
    divChannelLogo.id = this.ID_LOGO + id;
    divChannelLogo.className = "hubLiveChannelLogo";
    if (this.fakeDataMode) {
      logoUrl = this.LOGO_PATH + this.showcases[this.LIVE][0][this.ID_SERVICE].logo;
    } else {
      logoUrl = this.showcases[this.LIVE][0][this.ID_SERVICE].logo;
    }
    console.log("logoUrl : " + logoUrl);
    divChannelLogo.style.backgroundImage = "url(" + logoUrl + ")";
    return divChannelLogo;
  },
  
  /*
   * Description : Dynamically build the "more" asset of an unfocused showcase.
   * @method buildMoreAsset
   * @param {number} id The tag identifier
   * @param {number} width The asset expected width (may be 30px or 196px)
   * @param {string} bgcolor The background color (colorimetry)
   */
  buildMoreAsset: function(id,width,bgcolor) {
    var asset = document.createElement("li");
    asset.id = id;
    asset.className = "hubAsset";
    var img = "url(" + this.GRAPHICAL_ASSETS_PATH + this.IMG_DEFAULT_SMALL + ")";
    
    var color = bgcolor;
    asset.style.cssText = ";width:"+width+"px;background-image:" + img + ";background-color:" + color + ";";
    var title = document.createElement("div");
    return asset;
  },
  
  /*
   * Description Allow to initialize a generic asset
   * @method buildGenericAsset
   */
  buildGenericAsset: function(id,width,image, size, position) {
    var asset = document.createElement("li");
    asset.id = id;
    asset.className = "hubAsset";
    asset.style.width = width + "px";
    asset.style.backgroundImage = "url("+image+")";
    asset.style.backgroundSize = size;
    asset.style.backgroundPosition = position;
    return asset;    
  },
  
  /*
   * Description Allow to add the broadcast asset logo
   * @method buildBroadcastChannelLogo
   */
  buildBroadcastChannelLogo: function(showcase,asset,id) {
    var divChannelLogo, logoUrl;
    divChannelLogo = document.createElement("div");
    divChannelLogo.id = this.ID_LOGO + id;
    divChannelLogo.className = "hubBroadcastChannelLogo";
    if (this.fakeDataMode) {
      logoUrl = this.LOGO_PATH + this.showcases[showcase][asset].channelLogo;
    } else {
      logoUrl = this.showcases[showcase][asset].channelLogo;
    }
    divChannelLogo.style.backgroundImage = "url(" + logoUrl + ")";
    return divChannelLogo;
  },
      
  /*
   * Description Get the next indexes for a given couple (showcase, asset)
   * @method getNextIndices
   * @return The corresponding couple of values for showcase and asset
   */
  getNextIndices: function(showcase,asset) {
    if ((showcase === this.LIVE) || (asset === this.MAX_ASSETS_BY_SHOWCASE)) {
      showcase++;
      asset = 0;
    } else {
      asset++;  
    }
    return [showcase,asset];
  },
  
  /*
   * Description Get the previous indexes for a given couple (showcase, asset)
   * @method getPrevIndices
   * @return The corresponding couple of values for showcase and asset
   */
  getPrevIndices: function(showcase,asset) {
    if ((showcase === this.LIVE) || (asset === 0)) {
      showcase--;
      if (showcase === this.LIVE) {
        asset = 0;
      } else {
        asset = this.MAX_ASSETS_BY_SHOWCASE;
      }
    } else {
      asset--;      
    }
    return [showcase,asset];
  },

  /*
   * =======================================================================
   *  SHOWCASE LINE NAVIGATION
   * =======================================================================
   */
  
    /*
   * Description Allow to move into the showcase assets line
   * @method moveShowcaseLine
   */
  moveShowcaseLine: function (step) {
    if (step === this.RIGHT) {
      // Stop to move on the last item
      if (this.stepShowcaseCenterSlidingArray.length === (this.count + this.STARTING_FOCUS_INDEX + 1)) {
        return false;
      }
      this.count++;
      indices = this.getNextIndices(this.currentShowcase,this.currentAsset);
    } else if (step === this.LEFT) {
      // Stop to move on the first item
      if (this.count === -this.STARTING_FOCUS_INDEX) {
        return false;
      }
      this.count--;
      indices = this.getPrevIndices(this.currentShowcase,this.currentAsset);
    }
    this.currentShowcase = indices[0];
    this.currentAsset = indices[1];
    var currentFocus = this.STARTING_FOCUS_INDEX + this.count;
    var color = this.getColor(this.currentShowcase,this.currentAsset);
    var colorimetry;
    if (this.fakeDataMode) {
      colorimetry = color;
    } else {
      colorimetry = "rgba("+color+",0.5)";
    }
    this.sendJacketColorimetry(currentFocus,colorimetry);
    this.slideShowcases(this.count, step);
    
    if (this.isNewShowcase(currentFocus,step)) {
      this.slideShowcaseTextLine(step);
    }
    this.lastNav = step;
    
    return true;
  },

  /**
   * Description Performs the transition from one asset to another one, depending on the direction
   * @param aCount The number of steps from the starting index
   * @param direction rigth or left
   * @method slideShowcases
   */
  slideShowcases : function(aCount, direction) {
    
    var currentFocus,margin,stepFocusSlide,behindasset,newBehindasset,
    behindDeg,newBehindDeg,behindWidth,position,isTop,behindLogo,newBehindLogo;

    currentFocus = this.STARTING_FOCUS_INDEX + aCount;
    
    // Slide the center list of focused assets
    margin = parseInt(this.showCaseFocusSlide.style.marginLeft);
    stepFocusSlide = - this.stepShowcaseCenterSlidingArray[currentFocus] - margin;
    this.showCaseFocusSlide.style.webkitTransform = "translate3d(" + stepFocusSlide + "px, 0px, 0px)";

      /*
       * The size of the asset depends on its type and its position inside the showcase stack.
       * 196 : a broadcast asset on the top 
       * 82 : a vod asset on the top
       * 30 : an asset inside the stack
       * The visible part of the image depends on the stack direction.
       */

    if (direction === this.RIGHT) {
      behindasset = document.querySelector("#asset" + (currentFocus - 1));
      newBehindasset = document.querySelector("#asset"+currentFocus);
      behindDeg = document.querySelector("#degrade" + (currentFocus - 1));
      newBehindDeg = document.querySelector("#degrade"+currentFocus);
      behindasset.style.visibility = "visible";
      behindLogo = document.querySelector("#logo"+(currentFocus - 1));      
      newBehindLogo = document.querySelector("#logo"+currentFocus);      
      
      //Before to move, the asset behind the focused asset shall start just below the left edge of
      //the center element. 
      behindasset.style.width = "0px";      
      behindasset.style.marginLeft = "0px";
      behindasset.style.marginRight = "320px";
      
      isTop = false;
      // The new element visible on the left will be the LIVE asset
      if (currentFocus === this.STARTING_FOCUS_INDEX + 1) {
        behindWidth = this.DIV_VIDEO_WIDTH;
        behindasset.addEventListener('webkitTransitionEnd',
          function(){
            behindasset.removeEventListener( 'webkitTransitionEnd', arguments.callee, false );              
            behindLogo.style.visibility = "";
            behindLogo.classList.remove("hubFadeOut");
            behindLogo.classList.add("hubFadeIn");
          }
        ,false);
      } else if (this.isNewShowcase(currentFocus,this.RIGHT)) {
        // The new element visible on the left is the last one of the current showcase and
        // it shall be completely visible.
        isTop = true;
        // Left showcase : The new focused element is equal or before to the LIVE 
        if (currentFocus <= this.STARTING_FOCUS_INDEX) {
          // The bottom asset of the right showcase becomes a top asset on the left
          indices = this.getPrevIndices(this.currentShowcase,this.currentAsset);
          behindWidth = this.getAssetWidth(indices[0],indices[1]);
        } else {
          // Right showcase : the "more" asset of a right showcase becomes a top asset on the left
          behindWidth = this.DIV_MORE_UNSELECTED_WIDTH;
        }        
      } else {
        // Showcase browsing in prgress
        behindWidth = this.DELTA_INTER_ASSET;
      }
      behindasset.style.width = behindWidth + "px";      
      behindasset.style.backgroundPosition = "left";
      behindasset.style.marginRight = "0px";
      if (behindDeg) {
        var title = document.querySelector("#hubMoreTitle" + (currentFocus - 1));
        behindDeg.className = "hubAssetLeftGradient";
        var width = "20px";
        if (isTop === true) {
          width = "0px";
          // In case of a "more" asset on top, restore the title
          if (title) {
            title.className = "hubAssetMoreTitleTop";
            title.style.width = "";
          }
          // Case of a broadcast asset
          if (behindLogo) {
            behindasset.addEventListener('webkitTransitionEnd',
              function(){
                behindasset.removeEventListener( 'webkitTransitionEnd', arguments.callee, false );              
                behindLogo.style.visibility = "";
                behindLogo.classList.remove("hubFadeOut");
                behindLogo.classList.add("hubFadeIn");
              }
            ,false);
          }
        } else {
          // In case of a "more" asset, it shall be visible on the left
          if (title) {
            title.className = "hubAssetMoreTitleLeft";
            title.style.width = "";
          }
        }
        behindDeg.style.width = width;
      }
      
      // Reduce the size of the new behind asset to 0px. 
      newBehindasset.classList.add("hubAssetWidth");
      newBehindasset.style.width = "0px";
      newBehindasset.style.marginLeft   = "320px";
      
      // Remove the title in case of a "more" behind asset
      var title = document.querySelector("#hubMoreTitle"+currentFocus);
      if (title) {
          title.classList.add("hubAssetWidth");
          title.style.width = "0px";
      }
      
      // Remove the gradient for the new behind asset
      if (newBehindDeg) {
        newBehindDeg.classList.add("hubAssetWidth");
        newBehindDeg.style.width = "0px";
      }

      // Remove the logo for the new behind asset
      if (newBehindLogo) {
          newBehindLogo.style.visibility = "hidden";
          newBehindLogo.classList.remove("hubFadeIn");
          newBehindLogo.classList.add("hubFadeOut");
      }
      
      // Slide the small asset list
      var margin = parseInt(this.showcaseLine.style.marginLeft);
      var stepLeft = - this.stepShowcaseSlidingArray[currentFocus] - margin;
      this.showcaseLine.style.webkitTransform = "translate3d(" + stepLeft + "px, 0px, 0px)";     
    }
    
//====================== LEFT ==========================    
//====================== LEFT ==========================    
//====================== LEFT ==========================    
    else {
      behindasset = document.querySelector("#asset" + (currentFocus + 1));
      newBehindasset = document.querySelector("#asset"+currentFocus);
      behindDeg = document.querySelector("#degrade" + (currentFocus + 1));
      newBehindDeg = document.querySelector("#degrade"+currentFocus);
      behindLogo = document.querySelector("#logo"+(currentFocus + 1));      
      newBehindLogo = document.querySelector("#logo"+currentFocus);      
      
      // Dispose the current focused asset on the rigth edge of the center element
      behindasset.style.visibility = "visible";
      behindasset.style.width = "0px";      
      behindasset.style.marginLeft = "320px";
      behindasset.style.marginRight = "0px";
      
      isTop = false;
      // The new element visible on the right will be the LIVE asset
      if (currentFocus === this.STARTING_FOCUS_INDEX - 1) {
        behindWidth = this.DIV_VIDEO_WIDTH;
        behindasset.addEventListener('webkitTransitionEnd',
          function(){
            behindasset.removeEventListener( 'webkitTransitionEnd', arguments.callee, false );              
            behindLogo.style.visibility = "";
            behindLogo.classList.remove("hubFadeOut");
            behindLogo.classList.add("hubFadeIn");
          }
        ,false);
      } else if (this.isNewShowcase(currentFocus,this.LEFT)) {
        isTop = true;
        if (currentFocus < this.STARTING_FOCUS_INDEX) {
          //More becomes top asset
          behindWidth = this.DIV_MORE_UNSELECTED_WIDTH;          
        } else {
          //After or equal LIVE index
          indices = this.getNextIndices(this.currentShowcase,this.currentAsset);
          behindWidth = this.getAssetWidth(indices[0],indices[1]);
        }        
      } else {
        //inter asset
        behindWidth = this.DELTA_INTER_ASSET;
      }
      behindasset.style.width = behindWidth + "px";
      behindasset.style.backgroundPosition = "right";
      behindasset.style.marginLeft = "0px";
      if (behindDeg) {
        behindDeg.className = "hubAssetRightGradient";
        var width = "20px";
        // For a top asset : no gradient shall be displayed and
        // in case of a "more" asset the title shall be displayed. 
        if (isTop === true) {
          width = "0px";
          var title = document.querySelector("#hubMoreTitle"+(currentFocus+1));
          if (title) {
            title.className = "hubAssetMoreTitleTop";
            title.style.width = "";
          }
          if (behindLogo) {
            behindasset.addEventListener('webkitTransitionEnd',
              function(){
                behindasset.removeEventListener( 'webkitTransitionEnd', arguments.callee, false );              
                behindLogo.style.visibility = "";
                behindLogo.classList.remove("hubFadeOut");
                behindLogo.classList.add("hubFadeIn");
              }
            ,false);
          }
        }
        behindDeg.style.width = width;
      }
      
      // New asset behind the center element : put its size to 0px.
      newBehindasset.classList.add("hubAssetWidth");
      newBehindasset.style.width = "0px";
      newBehindasset.style.marginRight   = "320px";
      if (newBehindDeg) {
        newBehindDeg.classList.add("hubAssetWidth");
        newBehindDeg.style.width = "0px";
        var title = document.querySelector("#hubMoreTitle"+currentFocus);
        if (title) {
          title.classList.add("hubAssetWidth");
          title.style.width = "0px";
        }        
      }

      // Remove the logo for the new behind asset
      if (newBehindLogo) {
        newBehindLogo.style.visibility = "hidden";
        newBehindLogo.classList.remove("hubFadeIn");
        newBehindLogo.classList.add("hubFadeOut");
      }
      
      // Slide the small asset list
      var margin = parseInt(this.showcaseLine.style.marginLeft);
      var stepLeft = - this.stepShowcaseSlidingArray[currentFocus] - margin;
      this.showcaseLine.style.webkitTransform = "translate3d(" + stepLeft + "px, 0px, 0px)";     
    }

    if (currentFocus === this.LIVE_INDEX) {
      // Create the progress bar if not yet available (case where we come back on hub not on live asset)
      var progressBar = document.getElementById("progress-bar");
      if (progressBar === null) {
          var asset = this.showcases[this.LIVE][0][this.ID_PROGRAM];
          var nodeVideo = document.querySelector("#vc-video-container");
          this.progressBar = new ProgressBar(window.application.userInfoBox);
          this.progressBar.displayProgressBar(nodeVideo, asset.startTime, asset.endTime);
          progressBar = document.getElementById("progress-bar");
      }
      window.application.videoComponent.setTexturedMode(true);
      window.application.videoComponent.displayVideoOnNode(this.videoContainer,
                                                            ((direction === this.RIGHT) ? VideoAnimationType.RightToLeft : VideoAnimationType.LeftToRight),
                                                            function() {
                                                              document.querySelector("#vc-video-container").style.left = "370px";
                                                              var progressBar = document.getElementById("progress-bar");
                                                              progressBar.style.visibility = "visible";
                                                              },
                                                            5);
    }
    // Else display PIP
    else {
      var progressBar = document.getElementById("progress-bar");
      // If there is no progress bar we are already in PIP mode.
      if (progressBar !== null) {
        progressBar.style.visibility = "hidden";
        window.application.videoComponent.displayVideoInPIP((direction === this.RIGHT) ? VideoAnimationType.RightToLeft : VideoAnimationType.LeftToRight);
      }
    }
  },
    
  /*
   * Description : Get rhe image width for a given asset
   * @method getAssetWidth
   * @param {number} showcase The showcase number
   * @param {number} asset The asset number 
   * @return The requested width in pixels
   */
  getAssetWidth: function(showcase,asset) {
    var type = this.getAssetType(showcase,asset);
    var width = 0;
    switch (type) {
      case this.MORE :
      case this.BROADCAST :
        width = this.BROADCAST_WIDTH;
        break;
      case this.VOD :
        width = this.VOD_WIDTH;
        break;
      default :
        width = 0;
    }
    return width;
  },
  
  /*
   * Description Return the asset type (MORE, BROADCAST or VOD)
   * @param currentShowcase the showcase index
   * @param currentAsset the asset index inside this showcase
   */
  getAssetType: function(currentShowcase, currentAsset) {
    var type;
    if (currentShowcase < this.LIVE) {
      if (currentAsset !== 0) {
        type = this.showcases[currentShowcase][currentAsset - 1].assetType;
      } else {
        type = this.MORE;
      }
    } else {
      if (currentShowcase === this.LIVE) {
        type = this.showcases[this.LIVE][0][this.ID_PROGRAM].assetType;
      } else {
        if (currentAsset !== this.MAX_ASSETS_BY_SHOWCASE) {
          type = this.showcases[currentShowcase][currentAsset].assetType;
        } else {
          type = this.MORE;
        }
      }
    }
    return type;
  },
  
  /**
   * Description Perform the animation between the showcase line and the item text line
   * @method doShowcaseAnimation
   * @param direction : up or down
   * @return no value
   */
  doShowcaseAnimation: function(direction) {
    var translate,currentFocus,assetFocus,type,bkgLayer,dataLayer,imgLayer,bannerLayer,transformBkg,transformData,transformImg;
    
    currentFocus = this.STARTING_FOCUS_INDEX + this.count;
    assetFocus = document.querySelector("#"+ this.ID_ASSET + currentFocus);
    centerFocus = document.querySelector("#"+this.ID_CENTER+currentFocus);
    type = this.getAssetType(this.currentShowcase,this.currentAsset);
    bkgLayer = document.querySelector("#"+this.ID_CENTER_BKG+currentFocus);
    dataLayer = document.querySelector("#"+this.ID_CENTER_DATA+currentFocus);
    imgLayer = document.querySelector("#"+this.ID_CENTER_IMG+currentFocus);
    if (type === this.BROADCAST) {
      bannerLayer = document.querySelector("#"+this.ID_CENTER_BANNER+currentFocus);
    }

    //----------------------------------------------------------------
    //  Navigation from the showcase line to the item text line.      
    //----------------------------------------------------------------
    if (direction === this.DOWN) {
      // Hide the no focused assets in the centered list.
      this.hideCenterAssetNodes(currentFocus);
            
      // Display the image of the small list once the animation ended
      var that = this;
      if (bkgLayer !== null) {
        bkgLayer.addEventListener('webkitTransitionEnd',
            function(){
              console.log("Zoom ended on asset image");
              bkgLayer.removeEventListener( 'webkitTransitionEnd', arguments.callee, false );
              var width;
              if ((type === that.MORE) || (type === that.BROADCAST)) {
                width = that.BROADCAST_WIDTH;                
              } else {
                width = that.VOD_WIDTH;
              }
              assetFocus.style.visibility = "visible";
              assetFocus.style.width = width + "px";
              if (type === that.MORE) {
                // The title shall be visible also
                var moreTitle = document.querySelector("#hubMoreTitle"+currentFocus);
                moreTitle.style.width = "176px"; 
              } else if (type === that.BROADCAST) {
                var logo = document.querySelector("#"+that.ID_LOGO+currentFocus);
                logo.style.visibility = "";
                logo.classList.remove("hubFadeOut");
                logo.classList.add("hubFadeIn");
              }
              assetFocus.classList.remove("hubAssetWidth");
              assetFocus.classList.remove("hubMarginRight");
              assetFocus.classList.remove("hubMarginLeft");
              assetFocus.style.marginLeft = "0px";
              assetFocus.style.marginRight = "0px";
              that.showCaseCenterFocusPivot.style.visibility = "hidden";
              if (currentFocus === that.LIVE_INDEX) {
                var progressBar = document.getElementById("progress-bar");
                progressBar.style.visibility = "hidden";
                window.application.videoComponent.displayVideoInPIP(VideoAnimationType.NoAnimation);
              }
              // Update the menu viewport
            }
        ,false);
      }
      
      this.modeNav = this.SHOWCASE_TEXT;
      
      // The small showcase line shall move only on the y axis. 
      translate = "translate3d(0px, -80px, 0px)";
      this.showcaseContainer.style.webkitTransform = translate;

      // LIVE asset is the current selected asset : zoom the video
      if (this.currentShowcase === this.LIVE) {
        // First time workaround
        if (this.firstTime === true) {
          this.firstTime = false;
          assetFocus.style.marginRight = "0px";
          assetFocus.style.marginLeft = "0px";
        }
        // Video size : 320x180 -> 196x110
        window.application.videoComponent.zoom(-62,5,0.6125,0.6112);
        var progressBar = document.getElementById("progress-bar");
        progressBar.style.visibility = "hidden";
      }
    
      // A "more" asset is focused
      if (type === this.MORE) {
        // Unzoom the asset layers
        transformBkg = "translate3d(-62px,-25px,0px) scale3d(0.6125,0.4584,0)"; // (320,240) -> (196,110)
        transformData = "translate3d(-62px,-25px,0px) scale3d(0.6125,0.4584,0)";// (320,240) -> (196,110)
        transformImg = "translate3d(-62px,-25px,0px) scale3d(0.6125,0.4584,0)";// (320,240) -> (196,110)
        bkgLayer.style.webkitTransform = transformBkg;
        dataLayer.style.webkitTransform = transformData;
        dataLayer.classList.remove("hubFadeIn");
        dataLayer.classList.add("hubFadeOut");
        imgLayer.style.webkitTransform = transformImg;

        // Reduce the space behind the center unzoom asset.
        var space = "196px";
        assetFocus.classList.remove("hubAssetWidth");
        if (this.lastNav === this.RIGHT) {
          assetFocus.classList.add("hubMarginLeft");
          assetFocus.classList.remove("hubMarginRight");
          assetFocus.style.marginLeft = space;
        } else {
          assetFocus.classList.add("hubMarginRight");
          assetFocus.classList.remove("hubMarginLeft");
          assetFocus.style.marginRight = space;
        }

      } else if (type === this.BROADCAST) {
        // === A broacast asset is focused === 
        // Unzoom the asset layers
        transformBkg = "translate3d(-62px,-25px,0px) scale3d(0.6125,0.4584,0)"; // (320,240) -> (196,110)
        transformData = "translate3d(-62px,-25px,0px) scale3d(0.6125,0.4584,0)";// (320,240) -> (196,110)
        transformImg = "translate3d(-62px,5px,0px) scale3d(0.6125,0.6111,0)";// (320,180) -> (196,110)
        bkgLayer.style.webkitTransform = transformBkg;
        if (dataLayer !== null) {
          dataLayer.style.webkitTransform = transformData;
          dataLayer.classList.remove("hubFadeIn");
          dataLayer.classList.add("hubFadeOut");
        }
        //TODO : a banner shall be also available on live asset
        if (bannerLayer !== null) {
          bannerLayer.style.webkitTransform = transformData;
        }
        if (imgLayer !== null) {
          imgLayer.style.webkitTransform = transformImg;
        }
      
        // Reduce the space behind the center unzoom asset.
        var space = "196px";
        assetFocus.classList.remove("hubAssetWidth");
        if (this.lastNav === this.RIGHT) {
          assetFocus.classList.add("hubMarginLeft");
          assetFocus.classList.remove("hubMarginRight");
          assetFocus.style.marginLeft = space;
        } else {
          assetFocus.classList.add("hubMarginRight");
          assetFocus.classList.remove("hubMarginLeft");
          assetFocus.style.marginRight = space;
        }
      } else if (type === this.VOD) {
        // === A VOD asset is focused  ===
        transformBkg = "translate3d(-119px,-25px,0px) scale3d(0.256,0.4584,0)"; // (320,240) -> (82,110)
        transformData = "translate3d(-119px,-25px,0px) scale3d(0.256,0.4584,0)";// (320,240) -> (82,110)
        transformImg = "translate3d(-203px,-6px,0px) scale3d(0.539,0.544,0)";// (152,202) -> (82,110)
        if (bkgLayer !== null) {
          bkgLayer.style.webkitTransform = transformBkg;
        }
        if (dataLayer !== null) {
          dataLayer.style.webkitTransform = transformData;
        }
        if (imgLayer !== null) {
          imgLayer.style.webkitTransform = transformImg;
        }
        var space = "82px";
        assetFocus.classList.remove("hubAssetWidth");
        if (this.lastNav === this.RIGHT) {
          assetFocus.classList.add("hubMarginLeft");
          assetFocus.classList.remove("hubMarginRight");
          assetFocus.style.marginLeft = space;
        } else {
          assetFocus.classList.add("hubMarginRight");
          assetFocus.classList.remove("hubMarginLeft");
          assetFocus.style.marginRight = space;
        }
      }      

      this.moveMenu(this.DOWN);
      this.doShowcaseTextAnimation(this.DOWN);

    //----------------------------------------------------------------
    //  Navigation from the item text line to the showcase line
    //----------------------------------------------------------------
    } else if (direction === this.UP) {

      this.modeNav = this.SHOWCASE_LINE;
      this.showCaseCenterFocusPivot.style.visibility = "visible";

      if (this.currentShowcase === this.LIVE) {
        window.application.videoComponent.setTexturedMode(true);
        window.application.videoComponent.displayVideoOnNode(this.videoContainer,
                                                             VideoAnimationType.NoAnimation,
                                                             function(){document.getElementById("vc-video-container").style.left = "370px";},
                                                             5);
        window.application.videoComponent.unzoom();
        var progressBar = document.getElementById("progress-bar");
        progressBar.style.visibility = "visible";
      }
      if (bkgLayer !== null) {
        bkgLayer.style.webkitTransform = "";
      }
      if (dataLayer !== null) {
        dataLayer.style.webkitTransform = "";
        dataLayer.classList.remove("hubFadeOut");
        dataLayer.classList.add("hubFadeIn");
      }
      if (type === this.BROADCAST) {
        if (bannerLayer !== null) {
          bannerLayer.style.webkitTransform = "";
        }
      }
      if (imgLayer !== null) {
        imgLayer.style.webkitTransform = "";
      }
      this.showcaseContainer.style.webkitTransform = "";

      this.moveMenu(this.UP);
      this.doShowcaseTextAnimation(this.UP);
      
      // The small centered asset shall be replaced with an empty space
      assetFocus.style.visibility = "hidden";
      //assetFocus.classList.remove("hubAssetWidth");
      //assetFocus.style.width = "0px";
      var delta = parseInt(assetFocus.style.width);
      if (type === this.MORE) {
        var moreTitle = document.querySelector("#hubMoreTitle"+currentFocus);
        moreTitle.style.width = ""; 
      }
      var space = (this.CENTER_PIVOT_WIDTH - delta) + "px";
      if (this.lastNav === this.RIGHT) {
        assetFocus.classList.remove("hubMarginRight");
        assetFocus.classList.add("hubMarginLeft");
        assetFocus.style.marginLeft = space;
      } else {
        assetFocus.classList.remove("hubMarginLeft");
        assetFocus.classList.add("hubMarginRight");
        assetFocus.style.marginRight = space;
      }
      var that = this;

      // Restore all the assets in the center list once the animation ended
      if (bkgLayer !== null) {
        bkgLayer.addEventListener('webkitTransitionEnd',
            function(){
              console.log("Item -> Showcase line :zoom ended on the centered asset");
              bkgLayer.removeEventListener( 'webkitTransitionEnd', arguments.callee, false );
              that.displayCenterAssetNodes(currentFocus);
              var newspace = that.CENTER_PIVOT_WIDTH + "px";
              assetFocus.style.width = "0px";
              if (that.lastNav === that.RIGHT) {
                assetFocus.classList.remove("hubMarginLeft");
                assetFocus.style.marginLeft = newspace;
              } else {
                assetFocus.classList.remove("hubMarginRight");
                assetFocus.style.marginRight = newspace;
              }
            }
        ,false);
      }
    }
  },

  /*
   * Description Remove from the rendering tree the not visibles centered nodes
   * @method hideCenterAssetNodes 
   * @param currentFocus The current index
   * @return no value
   */
  hideCenterAssetNodes: function(currentFocus) {
    // keep only the current focused node
    var asset;
    for (i = 0; i < this.stepShowcaseCenterSlidingArray.length; i++) {
      if (i != currentFocus) {
        asset = document.querySelector("#"+this.ID_CENTER+i);
        asset.style.display = "none";
      }
    }
    this.showCaseFocusSlide.style.webkitTransform = "";
    this.showCaseFocusSlide.classList.remove("hubTransform");
    this.showCaseFocusSlide.style.marginLeft = "0px";
  },

  /*
   * Description Restore the no more displayed centered nodes
   * @method displayCenterAssetNodes 
   * @param currentFocus The current index
   * @return no value
   */
  displayCenterAssetNodes: function(currentFocus) {
    // restore the other nodes
    var asset;
    for (i = 0; i < this.stepShowcaseCenterSlidingArray.length; i++) {
      if (i != currentFocus) {
        asset = document.querySelector("#"+this.ID_CENTER+i);
        asset.style.display = "";
      }
    }
    this.showCaseFocusSlide.classList.add("hubTransform");
    this.showCaseFocusSlide.style.webkitTransform = "";
    this.stepFocus = - this.stepShowcaseCenterSlidingArray[currentFocus];
    this.showCaseFocusSlide.style.marginLeft = this.stepFocus + "px";
  },
  
  /*
   * =============================================================================
   *  ITEM TEXT LINE
   * =============================================================================
   */

  /**
   * Description Compute the HTML code for the showcase labels displayed below the showcase line and add it to the DOM
   * @method buildShowcaseLabelsList 
   * @return the HTML list of element to be injected into the DOM
   */
  buildShowcaseLabelsList : function() {
    var labels = this.showCaseLabel;
    this.showcaseList = document.createElement("ul");
    this.showcaseList.id = "hubshowcaseLabels";
    
    var focusedIndex = this.focusedLabelIndex, width, delta, classes;
    // Build the list of showcase labels with li tags.
    for (var i = 0; i < labels.length; i++){
      if (i == focusedIndex - 1) {
        delta = this.DELTA_BEFORE_FOCUSED_LABEL;
      } else {
        delta = this.DELTA_INTER_LABELS;
      }
      classes = "hubshowcaseLabels hubanimableWidthTextLabels";
      if (i == focusedIndex) {
        width = this.CENTER_PIVOT_WIDTH+ this.DELTA_INTER_SHOWCASE;
        classes += " hubfocusedLabel";
      } else {
        width = this.showCaseLabelWidth[i] + delta;
      }
      var li = document.createElement("li");
      li.id = "label"+i;
      li.className = classes;
      li.innerText = labels[i];
      li.style.width = width + "px";
      this.showcaseList.appendChild(li);
    }
    this.showcaseList.classList.remove("hubanimableMarginTextLabels");
    this.showcaseList.style.webkitTransform = "translate3d(" + this.marginLabels + "px, 0px, 0px)";
    this.showcaseList.classList.add("hubanimableMarginTextLabels");
  },

  
  
  /**
   * Description Move to the next showcase text label 
   * @method slideShowcaseTextLine
   * @param step  : the direction (this.LEFT or this.RIGHT)
   * @return no value
   */
  slideShowcaseTextLine : function(step) {
    var delta;
    var beforeLabelFocused;
    if (step === this.RIGHT) {
      delta = this.DELTA_BEFORE_FOCUSED_LABEL;
      if (this.focusedLabelIndex > 0) {
        beforeLabelFocused = document.querySelector("#label"+(this.focusedLabelIndex - 1));        
      }
    } else {
      delta = this.DELTA_INTER_LABELS;
      if (this.focusedLabelIndex > 1) {
        beforeLabelFocused = document.querySelector("#label"+(this.focusedLabelIndex - 2));
      }
    }
    var prevLabelFocused = document.querySelector("#label"+this.focusedLabelIndex);
    prevLabelFocused.classList.remove("hubfocusedLabel");
    var prevLabelFocusedNewWidth = this.showCaseLabelWidth[this.focusedLabelIndex] + delta;
    this.focusedLabelIndex += step;
    var labelFocused = document.querySelector("#label"+this.focusedLabelIndex);    
    if (step === this.RIGHT) {
      this.marginLabels += -step * (prevLabelFocusedNewWidth);
      if (this.focusedLabelIndex > 1) {
        this.marginLabels -= 10;
      }
    } else {
      this.marginLabels += -step * (parseInt(labelFocused.style.width));
      if (this.focusedLabelIndex > 0) {
        this.marginLabels += 10;
      }
    }
    this.showcaseList.style.webkitTransform = "translate3d(" + this.marginLabels + "px, 0px, 0px)";

    // TODO - Shall be modified to follow the requirement.
    labelFocused.style.width = this.CENTER_PIVOT_WIDTH + this.DELTA_INTER_SHOWCASE + "px";
    prevLabelFocused.style.width = prevLabelFocusedNewWidth + "px";
    if (step === this.RIGHT) {
      if (this.focusedLabelIndex > 1) {
        beforeLabelFocused.style.width = parseInt(beforeLabelFocused.style.width) + 10 + "px";
      }
    } else {
      if (this.focusedLabelIndex > 0) {
        beforeLabelFocused.style.width = parseInt(beforeLabelFocused.style.width) - 10 + "px";
      }
    }
    labelFocused.classList.add("hubfocusedLabel");
  },

  /**
   * Description Move from one showcase to another one
   * @method slideFocusedShowcaseTextLine
   * 
   */
  slideFocusedShowcaseTextLine : function(step) {
    if (step === this.RIGHT) {
      var label = document.querySelector("#label"+this.focusedLabelIndex);
      label.classList.remove("hubfocusedItemLabel");
      var focusLabelWidth = this.showCaseLabelWidth[this.focusedLabelIndex] + this.DELTA_INTER_LABELS;
      this.marginLabels += -step * focusLabelWidth;
      this.showcaseList.style.webkitTransform = "translate3d(" + this.marginLabels + "px, 0px, 0px)";
      this.focusedLabelIndex++;
      label = document.querySelector("#label"+this.focusedLabelIndex);
      label.classList.add("hubfocusedItemLabel");      
    } else {
      var label = document.querySelector("#label"+this.focusedLabelIndex);
      label.classList.remove("hubfocusedItemLabel");
      var previousLabelWidth = this.showCaseLabelWidth[this.focusedLabelIndex - 1] + this.DELTA_INTER_LABELS;
      this.marginLabels += -step * previousLabelWidth;
      this.showcaseList.style.webkitTransform = "translate3d(" + this.marginLabels + "px, 0px, 0px)";
      this.focusedLabelIndex--;
      label = document.querySelector("#label"+this.focusedLabelIndex);
      label.classList.add("hubfocusedItemLabel");      
    }
  },

  /**
   * Description Determine if the new focused asset is part of a new showcase 
   * @method isNewShowcase
   * @param newFocusedIndex The requested index
   * @param direction The navigation use case (this.RIGHT or this.LEFT)
   * @return true if it is a new showcase
   */
  isNewShowcase: function(newFocusedIndex,direction) {
    if (direction === this.RIGHT) {
      var isNew = (newFocusedIndex === 6) || (newFocusedIndex === 12) || (newFocusedIndex === 13) || (newFocusedIndex === 19) || (newFocusedIndex === 25) || (newFocusedIndex === 31);
      return isNew;
    } else {
      var isNew = (newFocusedIndex === 5) || (newFocusedIndex === 11) || (newFocusedIndex === 12) || (newFocusedIndex === 18) || (newFocusedIndex === 24) || (newFocusedIndex === 30);
      return isNew;
    }
  },

  /**
   * Description In charge to perform the showcase text line animation during vertical navigation 
   * @method doShowcaseTextAnimation
   * @param direction : UP or DOWN
   * @return no value
   */
  doShowcaseTextAnimation: function(direction) {
    if (direction === this.DOWN) {
      // Update the label rendering
      var centerLabel = document.querySelector("#label"+this.focusedLabelIndex);
      centerLabel.classList.remove("hubfocusedLabel");
      centerLabel.classList.add("hubfocusedItemLabel");
      var label;
      for (var i = 0; i < this.showCaseLabel.length; i++) {
        label = document.querySelector("#label"+i);
        label.classList.remove("hubshowcaseLabels");
        label.classList.add("hubshowcaseItemLabel");
      }
      
      // Collapse and focus the center label
      if (this.focusedLabelIndex !== 0) {
        var beforeFocusLabel = document.querySelector("#label"+(this.focusedLabelIndex-1));
        beforeFocusLabel.style.width = this.showCaseLabelWidth[this.focusedLabelIndex-1] + this.DELTA_INTER_LABELS + "px";
      }
      centerLabel.style.width = this.showCaseLabelWidth[this.focusedLabelIndex] + this.DELTA_INTER_LABELS + "px";
      centerLabel.classList.add("hubfocusedLabel");
      this.marginLabels -= 10;
      this.showcaseList.style.webkitTransform = "translate3d(" + this.marginLabels + "px, 0px, 0px)";

    } else if (direction === this.UP) {
      // Update the label rendering
      var centerLabel = document.querySelector("#label"+this.focusedLabelIndex);
      centerLabel.classList.remove("hubfocusedItemLabel");
      centerLabel.classList.add("hubfocusedLabel");
      var label;
      for (var i = 0; i < this.showCaseLabel.length; i++) {
        label = document.querySelector("#label"+i);
        label.classList.remove("hubshowcaseItemLabel");
        label.classList.add("hubshowcaseLabels");
      }
      // Extend the center label
      centerLabel.style.width = this.CENTER_PIVOT_WIDTH + this.DELTA_INTER_SHOWCASE + "px";
      if (this.focusedLabelIndex !== 0) {
        var beforeFocusLabel = document.querySelector("#label"+(this.focusedLabelIndex-1));
        beforeFocusLabel.style.width = this.showCaseLabelWidth[this.focusedLabelIndex-1] + this.DELTA_BEFORE_FOCUSED_LABEL + "px";
      }
      this.marginLabels += 10;
      this.showcaseList.style.webkitTransform = "translate3d(" + this.marginLabels + "px, 0px, 0px)";
    }
  },
  
  /**
   * Description In charge to get the focus on the showcase text line
   * @method doShowcaseTextFocus
   * @param 
   * @return no value
   */
  doShowcaseTextFocus: function(direction) {
    var viewPort = document.querySelector("#hubVerticalMenuViewport");
    var centerLabel = document.querySelector("#label"+this.focusedLabelIndex);
    centerLabel.classList.add("hubfocusedLabel");
    
    if (direction === this.UP) {
      // Restore the menu container initial position
      viewPort.style.webkitTransform = "";
      this.menuContainer.style.marginTop = "0px";
      this.currentMenuTranslateY = 0;
    }
  },
  
  /**
   * Description In charge to remove the focus on the showcase text line
   * @method doShowcaseTextFocus
   * @param 
   * @return no value
   */
  removeShowcaseTextFocus: function() {
    var centerLabel = document.querySelector("#label"+this.focusedLabelIndex);
    centerLabel.classList.remove("hubfocusedLabel");
  },

  /*
   * =============================================================================
   * USER PROFILE 
   * =============================================================================
   */

  initializeProfileBar: function () {
      this.profileContainer = document.createElement('div');
      this.profileContainer.id = 'hubProfileContainer';      
/*      this.activeProfileContainer = document.createElement('div');
      this.activeProfileContainer.id = 'hubProfileActiveLabel';    
      this.activeProfileContainer.innerHTML = this.profileLabels[this.currentProfileIndex];*/
      this.profileContainer.appendChild(this.buildProfileList());
      this.el.appendChild(this.profileContainer); 
 /*     this.el.appendChild(this.activeProfileContainer); */ 
      this.setInitialProfileListPosition();  
  }, 


   /**
   * Creates the list of profiles (initially hidden except for the default one)
   */
  buildProfileList : function() {
    var i, profileFragment = document.createDocumentFragment();
    
    for (i = 0; i < this.profileLabels.length; i += 1) {
      profileFragment.appendChild(this.buildSingleProfile(this.profileLabels[i], i));
    }
    
    return profileFragment;
  },
  
  /*
   * 
   */
  buildSingleProfile: function(profileText, index) {
      var myProfile = document.createElement('div');

      myProfile.id = 'hubProfile' + index;      
      myProfile.classList.add('hubProfileLabel');
      if (index === this.activeProfileIndex) {
          this.focusedProfileElement = myProfile;
          myProfile.classList.add('hubFadeIn');            
      } else {
           myProfile.classList.add('hubFadeOut');            
      }   
      myProfile.innerText = profileText;
      
      return myProfile;
  },  


  /*
   *
   */
  setInitialProfileListPosition: function () {
      var previousProfileWidth;

      if (this.activeProfileIndex === 0) {
          previousProfileWidth = 0;
      } else {
          previousProfileWidth = this.profileWidths[this.activeProfileIndex - 1];
      }      
      
      this.profileContainer.style.left = this.profileInitialLeftValue - 
          this.activeProfileIndex * (this.profileGap + previousProfileWidth) + 'px';      
  },
  
  /**
   * Displaces the horizontal profile list
   */ 
  moveProfileList: function(step) {
      var previousProfileWidth, expectedIndex = this.currentProfileIndex + step;
      
      if (expectedIndex >= 0 && expectedIndex < this.profileLabels.length) {
           if (expectedIndex === 0) {
              previousProfileWidth = 0;
          } else {
              previousProfileWidth = this.profileWidths[expectedIndex - 1];
          }
          this.profileContainer.style.left = this.profileInitialLeftValue - 
              expectedIndex * (this.profileGap + previousProfileWidth) + 'px';
              
          this.focusedProfileElement = this.profileContainer.querySelector("#hubProfile" + (this.currentProfileIndex + step));    
              
          this.profileContainer.querySelector("#hubProfile" + this.currentProfileIndex).classList.remove("hubProfileFocusedLabel");
          this.focusedProfileElement.classList.add("hubProfileFocusedLabel");
             
          this.currentProfileIndex += step;           
      }  
  },  
  
  /*
   * @method changeProfile 
   */
  changeProfile: function () {
      if (this.currentProfileIndex !== this.activeProfileIndex) {
        //changing a profile requires to change the websocket, as we access different service layer instances
        //with different urls  
        ADSA_IMPL.stop(); //close current webSocket
        ADSA_IMPL.openWebsocket(window.profileData[this.currentProfileIndex].serviceLayerUrl);  
        ADSA.read({
            requestId: 57,
            source: 'data://cisco/adele/hub/profile',
            params: {},
            successCallback: this.changeProfileSuccessCallback,
            failureCallback: this.changeProfileFailureCallback
        });
         
      } 
  },
  
  /*
   * @method changeProfileSuccessCallback
   */
  changeProfileSuccessCallback: function (reqId, userData, messId) {
      this.activeProfileIndex = this.currentProfileIndex;
      window.application.userInfoBox.setUserName(userData.userName.toLowerCase());
      this.setFlowerColorWithProfile(userData.userColor);        
  },

  /*
   * @method changeProfileFailureCallback
   */
  changeProfileFailureCallback: function () {
      console.log("HUB: profile request failed");    
  },
  
  /*
   * @method setFlowerColorWithProfile
   */
  setFlowerColorWithProfile: function (color) {
      var rgb = parseColor('rgb('+color+')');
      flowerColorEvent.trigger("changeColorAccordingToProfile", rgb.r, rgb.g, rgb.b);
  },
    
/**
   * Description Focus the profile list, triggering the display of the whole list and focusing the current profile
   * <@method focusProfileList
   */
  focusProfileList: function() {
    this.focusedProfileElement.classList.add("hubProfileFocusedLabel");
    this.displayProfiles();
  },
  
  /*
   * @method displayProfiles
   */
  displayProfiles: function() {
      var i, profileElement;
      
      for (i = 0; i < this.profileContainer.childNodes.length; i += 1) {
          profileElement = this.profileContainer.childNodes[i];
          if (!profileElement.classList.contains('hubProfileFocusedLabel')) {
               profileElement.classList.remove("hubFadeOut");
               profileElement.classList.add("hubFadeIn");             
          } 
      }
  },
  
  /*
   * @method hideProfiles
   */
  hideProfiles: function () {
      var i, profileElement;
      
      for (i = 0; i < this.profileContainer.childNodes.length; i += 1) {
          profileElement = this.profileContainer.childNodes[i];
          if (i !== this.activeProfileIndex) {
               profileElement.classList.remove("hubFadeIn");
               profileElement.classList.add("hubFadeOut");             
          } 
      }      
  },

  /**
   * Description In charge to remove the focus on the profile line
   * @method removeProfileFocus
   * @param 
   * @return no value
   */
  unfocusProfileList: function() {
    this.focusedProfileElement.classList.remove("hubProfileFocusedLabel");
    this.focusedProfileElement = this.profileContainer.querySelector("#hubProfile" + this.activeProfileIndex);
    this.currentProfileIndex = this.activeProfileIndex; 
    this.hideProfiles();
    this.setInitialProfileListPosition(); //put back the initial position of the list
  },
  
  /*
  * ================================================================================================
  * VERTICAL MENU
  * ================================================================================================
  */
      
  /*
   * Description Build the vertical menu
   * @method buildMenu
   * @return none
   */
  buildMenu : function() {
    this.menuContainer = document.createElement("div");
    this.menuContainer.id="hubVerticalMenuContainer";
    this.hubVerticalMenuViewport = document.createElement("div");
    this.hubVerticalMenuViewport.id="hubVerticalMenuViewport";
    var hubSeparatorMenu = document.createElement("div");
    hubSeparatorMenu.id = "hubSeparatorMenu";
    this.menuList = this.buildVerticalMenu(this.menuLabels);
    this.menuContainer.appendChild(this.showcaseList);
    this.menuContainer.appendChild(hubSeparatorMenu);
    this.menuContainer.appendChild(this.menuList);
    this.hubVerticalMenuViewport.appendChild(this.menuContainer);
  },
  
  /**
   * Description Compute the HTML list with the menu items and add it into the DOM
   * @method buildVerticalMenu
   * @return The menu list node
   */
  buildVerticalMenu : function (labels) {
    var menuList = document.createElement("ul");
    menuList.id = "hubverticalMenuList";
    // Build the list of menu labels with li tags.
    var li, index = 3;
    for (var i = 0; i < labels.length; i++){
      li = document.createElement("li");
      li.id = "menulabel" + index;
      li.className = "hubVerticalMenuLabel";
      li.innerText = labels[i];
      menuList.appendChild(li);
      index++;
    }
    return menuList;
  },

  /*
   * Description Allow to move the menu up or down
   * @method moveMenu
   * @return no value
   */
  moveMenu : function(direction) {
    var viewPort = document.querySelector("#hubVerticalMenuViewport");
    if (direction === this.DOWN) {
      viewPort.style.webkitTransform = "translate3d(0px,-38px,0px)";
      this.menuContainer.style.marginTop = "0px";
/*
 * There is a graphical issue with the vertical translate 3d
      this.currentMenuTranslateY = - this.menuTranslateY["SHOWCASE_TEXT"];
      console.log("this.currentMenuTranslateY "+this.currentMenuTranslateY);
      var translate = "translate3d(0px, " + this.currentMenuTranslateY + "px, 0px)";
      this.menuContainer.style.webkitTransform = translate;
*/      
    } else {
      viewPort.style.webkitTransform = "";
      this.menuContainer.style.marginTop = "0px";
    }
  },
  
  /**
   * Description In charge to perform the menu navigation and transition effect. 
   * @method doMenuNagivation
   * @param direction : up or down
   * @return no value
   */
  doMenuNagivation: function(direction) {    
    var focusedItem;
    //console.log("[doMenuNagivation] " + this.focusedMenuItem);
    var newFocusedIndex = this.focusedMenuItem + direction;
    if (direction === this.DOWN) {
      if (newFocusedIndex !== this.MENU_FIRST_ITEM) {
        focusedItem = document.querySelector("#menulabel" + this.focusedMenuItem);
        focusedItem.classList.remove("hubfocusedMenuItem");
      }
      var index = newFocusedIndex - this.MENU_FIRST_ITEM;
      var yValue = -direction * this.menuTranslateY[this.menuLabels[index]];
      //console.log("index "+index);
      this.currentMenuTranslateY += yValue;
      this.menuContainer.style.marginTop = this.currentMenuTranslateY + "px";
      focusedItem = document.querySelector("#menulabel" + newFocusedIndex);
      focusedItem.classList.add("hubfocusedMenuItem");
    } else {
      if (newFocusedIndex !== this.MENU_LAST_ITEM) {
        focusedItem = document.querySelector("#menulabel" + this.focusedMenuItem);
        focusedItem.classList.remove("hubfocusedMenuItem");
      }
      var index = this.focusedMenuItem - this.MENU_FIRST_ITEM;      
      var yValue = -direction * this.menuTranslateY[this.menuLabels[index]];
      this.currentMenuTranslateY += yValue;
      this.menuContainer.style.marginTop = this.currentMenuTranslateY + "px";
      focusedItem = document.querySelector("#menulabel" + newFocusedIndex);
      focusedItem.classList.add("hubfocusedMenuItem");
    }    
  },
 
  
  /**
   * Description Remove the focus on the menu
   * @method removeMenuFocus 
   * @param none
   * @return no value
   */
  removeMenuFocus : function() {
    var focusedItem;
    focusedItem = document.querySelector("#menulabel" + this.focusedMenuItem);
    focusedItem.classList.remove("hubfocusedMenuItem");
  },
  
  
/*
 *
 * ================================================================================================
 * CENTER LIST BUILDING 
 * ================================================================================================
 *
 */

  /*
   * Description Create the container and the view port for the center asset list.
   * @method initCenterElement
   */
  initCenterElement : function() {
    console.log("[HUB] Build the center dom content");
    this.showCaseCenterFocusPivot = document.createElement("div");
    this.showCaseCenterFocusPivot.id = "hubCenterFocusContainer";  
    this.showCaseFocusSlide = document.createElement("div");
    this.showCaseFocusSlide.className = "hubCenterFocusList";
    this.showCaseCenterFocusPivot.appendChild(this.showCaseFocusSlide);
  },
  
  /**
   * Description Build the center list 
   * @method buildShowCaseCenterDomContent 
   * @param none
   * @return no value
   */
  buildShowCaseCenterDomContent : function() {
    var id = 0;
    
    // Showcases on the left : the more asset shall be on the left (bottom of the stack)
    // The last asset is completely visible (top of the stack)
    var lastId = this.buildCenterLeftAssets(id);
    id = lastId;
    
    // LIVE Showcase
    var divAsset = this.buildCenterLiveAsset(id);
    this.showCaseFocusSlide.appendChild(divAsset);
    this.setStepShowcaseSliding(id);
    id++;

    this.buildCenterRightAssets(id);
  },
  
  /**
   * Description Build the center list 
   * @method buildShowCaseCenterDomContent 
   * @param none
   * @return no value
   */
  buildCenterLeftAssets : function(fromId) {
    var asset, image, colorimetry, bgColor, title, channel, logo, duration, minPrice, divAsset, type,
    imgMoreUrl = this.GRAPHICAL_ASSETS_PATH + this.IMG_DEFAULT_HUB, id = fromId;
    for (var i = 0; i < this.LIVE; i++) {
      if (this.fakeDataMode) {
        colorimetry = this.getColor(i,0);
      } else {
        if (this.showcases[i][0].color === null) {
          colorimetry = "rgba(255,0,0,0.5)";
        } else {
          colorimetry = "rgba("+this.showcases[i][0].color+",0.5)";
        }
      }
      divAsset = this.buildCenterMoreAsset(id,colorimetry,imgMoreUrl);
      this.showCaseFocusSlide.appendChild(divAsset);
      this.setStepShowcaseSliding(id);
      id++;      
      // Build the showcase content (5 graphical assets)
      for (var j = 0; j < (this.MAX_ASSETS_BY_SHOWCASE); j++) {
        asset = this.showcases[i][j];
        type = asset.assetType;
        var imgWidth, imgHeight;
        if (type === this.VOD) {
          imgWidth = this.VOD_CENTER_WIDTH;
          imgHeight = this.VOD_CENTER_HEIGHT;
        } else {
          imgWidth = this.BROADCAST_CENTER_WIDTH;
          imgHeight = this.BROADCAST_CENTER_HEIGHT;
        }
        title = asset.title;
        if (this.fakeDataMode) {
          colorimetry = this.getColor(i,j);
        } else {
          if (asset.color === null) {
            colorimetry = "rgba(255,0,0,0.5)";
          } else {
            colorimetry = "rgba("+asset.color+",0.5)";
          }
        }
        channel = asset.channelNumber;
        if (this.fakeDataMode) {
          logo = this.LOGO_PATH + asset.channelLogo;
        } else {
          logo = asset.channelLogo;
        }
        if (type === this.BROADCAST) {
          duration = asset.getFormatedHour();
        } else if (type === this.VOD) {
          minPrice = asset.price;
        }
        if (this.fakeDataMode) {
          image = this.IMAGES_PATH + asset.poster;
        } else {
          image = asset.image[imgWidth + 'x' + imgHeight];
          if (image === undefined) {
            image = this.GRAPHICAL_ASSETS_PATH + this.IMG_DEFAULT_HUB;
          }
        }
        
        divAsset = this.buildCenterAsset(id,colorimetry,image,channel,logo,type,duration,minPrice,title);        
        this.showCaseFocusSlide.appendChild(divAsset);
        this.setStepShowcaseSliding(id);
        id++;
      }
    }
    return id;
  },
  
  buildCenterRightAssets : function(fromId) {
    var asset, image, colorimetry, title, channel, logo, duration, minPrice, divAsset, type,
    imgMoreUrl = this.GRAPHICAL_ASSETS_PATH + this.IMG_DEFAULT_HUB, id = fromId;
    for (var i = this.LIVE + 1; i < this.numberOfShowcases; i++) {    
      // Build the showcase content (5 graphical assets)
      for (var j = 0; j < (this.MAX_ASSETS_BY_SHOWCASE); j++) {
        asset = this.showcases[i][j];
        type = asset.assetType;
        type = asset.assetType;
        var imgWidth, imgHeight;
        if (type === this.VOD) {
          imgWidth = this.VOD_CENTER_WIDTH;
          imgHeight = this.VOD_CENTER_HEIGHT;
        } else {
          imgWidth = this.BROADCAST_CENTER_WIDTH;
          imgHeight = this.BROADCAST_CENTER_HEIGHT;
        }
        if (this.fakeDataMode) {
          colorimetry = this.getColor(i,j);
        } else {
          if (asset.color === null) {
            colorimetry = "rgba(255,0,0,0.5)";
          } else {
            colorimetry = "rgba("+asset.color+",0.5)";
          }
        }
        title = asset.title;
        channel = asset.channelNumber;
        if (this.fakeDataMode) {
          logo = this.LOGO_PATH + asset.channelLogo;
        } else {
          logo = asset.channelLogo;
        }
        if (type === this.BROADCAST) {
          duration = asset.getFormatedHour();
        } else if (type === this.VOD) {
          minPrice = asset.price;        
        }

        if (this.fakeDataMode) {
          image = this.IMAGES_PATH + asset.poster;
        } else {
          image = asset.image[imgWidth + 'x' + imgHeight];
          if (image === undefined) {
            image = this.GRAPHICAL_ASSETS_PATH + this.IMG_DEFAULT_HUB;
          }
        }
        
        divAsset = this.buildCenterAsset(id,colorimetry,image,channel,logo,type,duration,minPrice,title);
        this.showCaseFocusSlide.appendChild(divAsset);
        this.setStepShowcaseSliding(id);
        id++;
      }
      if (this.fakeDataMode) {
        colorimetry = this.getColor(i,this.MAX_ASSETS_BY_SHOWCASE);
      } else {
        var color = this.showcases[i][this.MAX_ASSETS_BY_SHOWCASE - 1].color;
        if (color === null) {
          colorimetry = "rgba(255,0,0,0.5)";
        } else {
          colorimetry = "rgba("+color+",0.5)";
        }
      }
      
      divAsset = this.buildCenterMoreAsset(id,colorimetry,imgMoreUrl);
      this.showCaseFocusSlide.appendChild(divAsset);
      this.setStepShowcaseSliding(id);
      id++;
    }
    return id;
  },
  
  /*
   * Initialize a new centered list asset node.
   * This is responsible to build the background layer
   * @method buildGenericDivNode
   */
  buildGenericCenterAsset: function(id,colorimetry) {
    var div = document.createElement("div");
    div.className = this.FOCUSED_ASSET_CLASS;
    div.id = this.ID_CENTER_BKG + id;
    div.style.backgroundColor = colorimetry;
    return div;
  },
  
  
  /*
   * Description Build a "more" asset node
   * id
   * colorimetry
   * imgUrl
   * @method buildCenterMoreAsset
   */
  buildCenterMoreAsset: function(id,colorimetry,imgUrl) {
    // The container
    var container = document.createElement("div");
    container.id = this.ID_CENTER + id;
    container.className = "hubFocusedContainerAsset";

    // The background layer with the color and the title
    var divMoreBkg = this.buildGenericCenterAsset(id,colorimetry);
    divMoreBkg.id = this.ID_CENTER_BKG + id;
    var div = document.createElement("div");
    div.className = "hubFocusedTitleAsset";
    div.innerText = "MORE";
    divMoreBkg.appendChild(div);
    container.appendChild(divMoreBkg);
    
    // The data layer
    var divData = document.createElement("div");
    divData.id = this.ID_CENTER_DATA + id;
    divData.className = "hubFocusedDataAsset";
    var div = document.createElement("div");
    div.className = "hubFocusedTitleAsset";
    div.innerText = "MORE";
    divData.appendChild(div);
    container.appendChild(divData);
    
    // The image layer
    var divMoreImg = document.createElement("img");
    divMoreImg.id = this.ID_CENTER_IMG + id;
    divMoreImg.className = "hubFocusedMoreImageAsset";
    divMoreImg.src = imgUrl;
    container.appendChild(divMoreImg);
    
    return container;
  },
  
  /*
   * Description Build the center asset container for the 'live'
   * @method buildCenterLiveAsset
   */
  buildCenterLiveAsset: function(id) {

    // The container
    var container = document.createElement("div");
    container.id = this.ID_CENTER + id;
    container.className = "hubFocusedContainerAsset";

    // The background layer
    var divBkdAsset = this.buildGenericCenterAsset(id,"black");
    container.appendChild(divBkdAsset);
    
    // The video layer
    var divVideo = document.createElement("div");
    divVideo.id = this.ID_CENTER_IMG + id;
    divVideo.className = "hubFocusedBroadcastImageAsset";
    divVideo.style.zIndex = 2;
    container.appendChild(divVideo);
    this.videoContainer = divVideo;

    // The banner layer
    var asset = this.showcases[this.LIVE][0][this.ID_PROGRAM];
    var divBanner = document.createElement("div");
    divBanner.id = this.ID_CENTER_BANNER + id;
    divBanner.style.zIndex = 2; 
    divBanner.className = "hubFocusedDataAsset";
    var div = document.createElement("div");
    div.className = "hubProgressBarLive";
    divBanner.appendChild(div);
    div = document.createElement("div");
    div.className = "hubTimeDurationAsset";    
    div.innerText = asset.getFormatedHour();
    this.focusLiveAssetTime = div;
    divBanner.appendChild(div);
    div = document.createElement("div");
    div.className = "hubFocusedTitleAsset";
    div.innerText = asset.title;
    this.focusLiveAssetTitle = div;
    divBanner.appendChild(div);
    container.appendChild(divBanner);

    return container;
  },

  /*
   * Description Create the generic base for an asset in the centered list
   * @method buildCenterGenericAsset
   */
  buildCenterAsset: function(id,colorimetry,imgUrl,channel,logo,type,duration,minprice,title) {
    
    // The container 
    var container = document.createElement("div");
    container.id = this.ID_CENTER + id;
    container.className = "hubFocusedContainerAsset";
    
    // The background layer with the colorimetry
    var divBkg = this.buildGenericCenterAsset(id,colorimetry);
    container.appendChild(divBkg);

    // The metadata layer
    var zIndex;
    if (type === this.BROADCAST) {
      zIndex = 3;
    } else {
      zIndex = 2;
    }
    var divData = document.createElement("div");
    divData.id = this.ID_CENTER_DATA + id;
    divData.style.zIndex = zIndex; 
    divData.className = "hubFocusedDataAsset";

    var divType;
    switch (type) {
      case this.BROADCAST:
        // Add the channel number, relatively to the divAsset
        var div = document.createElement("div");
        div.className = "hubChannelNumber";
        div.innerText = channel;
        divData.appendChild(div);
    
        // Add the channel logo
        div = document.createElement("div");
        div.className = "hubChannelLogo";
        div.style.backgroundImage = "url(" + logo + ")";
        divData.appendChild(div);
        var divBanner = document.createElement("div");
        divBanner.id = this.ID_CENTER_BANNER + id;
        divBanner.style.zIndex = 2; 
        divBanner.className = "hubFocusedDataAsset";
        this.customizeCenterBroadcastAsset(divBanner,duration,title);
        container.appendChild(divBanner);
        break;
      case this.VOD:
        this.customizeCenterVodAsset(divData,minprice,title);
        break;
    }
    container.appendChild(divData);
    
    // The image layer
    var divImg = document.createElement("img");
    divImg.id = this.ID_CENTER_IMG + id;
    var className = "hubFocusedBroadcastImageAsset";
    var zindex;
    if (type === this.BROADCAST) {
      className = "hubFocusedBroadcastImageAsset";
      zindex = 2;
    } else {
      className = "hubFocusedVodImageAsset";
      zindex = 3;
    }
    divImg.className = className;
    divImg.style.zIndex = zindex;
    divImg.src = imgUrl;
    container.appendChild(divImg);
    
    return container;
  },
  
  /**
   * Description Broadcast asset in the center list
   * @method builCenterBroadcastAsset
   */
  customizeCenterBroadcastAsset: function(divAsset,aDuration,aTitle) {
        var div = document.createElement("div");
        div.className = "hubWhiteLineBroadcast";
        divAsset.appendChild(div);

        div = document.createElement("div");
        div.className = "hubTimeDurationAsset";
        div.innerText = aDuration;
        divAsset.appendChild(div);

        div = document.createElement("div");
        div.className = "hubFocusedTitleAsset";
        div.innerText = aTitle;
        divAsset.appendChild(div);
    },


  /**
   * Description VOD asset in the center list
   * @method customizeCenterVodAsset
   */
  customizeCenterVodAsset: function(divAsset,aMinPrice,aTitle) {
    var div = document.createElement("div");
    div.className = "hubMinimumPriceStartLabel";
    div.innerHTML = "from";
    divAsset.appendChild(div);

    div = document.createElement("div");
    div.className = "hubMinimumPriceEnd";
    div.innerHTML = aMinPrice + " &euro;";
    divAsset.appendChild(div);

    div = document.createElement("div");
    div.className = "hubWhiteLineVod";
    divAsset.appendChild(div);

    div = document.createElement("div");
    div.className = "hubFocusedTitleAsset";
    div.innerText = aTitle;
    divAsset.appendChild(div);
  },

  /**
   * Description This method is in charge to compute the position for a given focused asset
   * depending of the list
   * @method setStepShowcaseSliding
   */ 
  setStepShowcaseSliding: function(k) {
    this.stepShowcaseCenterSlidingArray[k] = k * this.CENTER_PIVOT_WIDTH;
  },
  
  /*
   *  @getColor
   */
  getColor : function(showcase, asset) {
    var color;
    if (showcase < this.LIVE) {
      // Left showcase
      if (asset === 0) {
        // "more" background color
        color = this.showcases[showcase][0].color;
      } else {
        color = this.showcases[showcase][asset - 1].color;
      }
    } else {
      // Right showcase
      if (asset === this.MAX_ASSETS_BY_SHOWCASE) {
        // "more" background color
        color = this.showcases[showcase][this.MAX_ASSETS_BY_SHOWCASE - 1].color;
      } else {
        color = this.showcases[showcase][asset].color;
      }
    }
    return color;
  },
    
/*
 * ===============================================================
 *  External notifications
 * ===============================================================
 */

  /**
   * Description Allow to notify the flower with the new asset colorimetry
   * @method sendJacketColorimetry
   */
  sendJacketColorimetry : function(currentFocus, backColor) {
    var videoComponent = window.application.videoComponent;
    if (currentFocus === this.LIVE_INDEX) {
      //Use the video colorimetry if the video component is available
      if (videoComponent.isVideoAvailable()){
          videoComponent.startColorimetry();
      }
    } else {
      //Check if the video component is using the colorimetry : stop it in this case.
      if (videoComponent.isStartColorimetry()){
          videoComponent.stopColorimetry();
      }
      //Use the picture colorimetry
      var rgb = parseColor(backColor);
      flowerColorEvent.trigger("changeColorAccordingToContent", rgb.r, rgb.g, rgb.b);
    }
  },



  /**
   * Description Allow to inform the VOD action menu view of the currently selected asset
   * @method sendAssetSelection
   */
  sendAssetSelection : function(programIndex) {
      hubAssetEvent.trigger("setProgramAsset", programIndex);
  }
});