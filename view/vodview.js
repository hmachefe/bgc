/**
 Description: backbone view for the VOD ACTION MENU view
 @class VodView
 **/

// TODO - This template shall be replaced with a page built totally dynamically for better performance 
var vodview_template =  [
  '<div id="leftContainer">'
    ,'<div id="vodAsset">'
      ,'<div id="vodBorderAsset"></div>'
      ,'<div id="vodTitleAsset"></div>'
    ,'</div>'
    ,'<ul id="leftLabels"></ul>'
    ,'<ul id="leftValues"></ul>'
  ,'</div>'
  ,'<div id="separatorAction"></div>'
  ,'<div id="rightContainer">'
    ,'<div id="vodTitle"></div>'
    ,'<div id="pagesContainer">'
      ,'<ul id="pagesList"></ul>'
    ,'</div>'
    ,'<div id="numberPages"></div>'
    ,'<div id="leftArrowPages"> < </div>'
    ,'<div id="rightArrowPages"> > </div>'
    ,'<div id="actionMenuContainer">'
      ,'<ul id="actionMenuList"></ul>' 
    ,'</div>'
  ,'</div>'
].join("\n");


/////////////////////////////////////////////////////////////////////////////
//
// VodView implementation
//
/////////////////////////////////////////////////////////////////////////////

var VodView = Backbone.View.extend({

  VIEW_NAME : "store",
  DOWN_LIST_STEP : 36,
  NB_LINES_BY_PAGES : 6,
  LEFT_PAGE_STEP : 650,
  IMAGES_PATH : "resources/images/", // fake data mode
  IMAGE_WIDTH : 152,
  IMAGE_HEIGHT : 202,
  TITLE_LINE_HEIGHT: 40,
  SYNOPSIS_LINE_HEIGHT: 25,
  SYNOPSIS_MAX_NB_LINES_IN_LIST: 7,
  UP : -1,
  DOWN : 1,
  RIGHT : 1,
  LEFT : -1,
  INFO_PANEL_ID : -1,
  CHOOSE_VERSION_ID : 0,
  WATCH_TRAILER_ID : 1,
  // backbone parameters
  id              : "vodView",
  template        : vodview_template,

  isVisible       : false,
  menuItems : [
    'CHOOSE YOUR VERSION AND RENT',
    'WATCH TRAILER',
    'BOOKMARK',
    'RATE',      
    'SIMILAR',      
    'RECOMMEND'
  ],
  assetSelectedId : 0,
  downListPos : 0,
  program: null,
  currentFocusedId: undefined,
  nbPages: undefined,
  currentFocusedPage : 1,
  pageComponent : null,
  pageNumber : null,
  pagePrev : null,
  pageNext : null,
  focusItem : null,
  menuList : null,
  _forceMenuItem: null,

  /*
   *=============================================================
   * PUBLIC FUNCTIONS 
   *=============================================================
   */

  /**
   * Description: initialisation of the view
   * @method initialize
   * @param {} options
   * @return 
   */
  initialize: function(options) {
    Log.c("###ELE:: VodView.initialize()");
    _.bindAll(this, "render");
    _.bindAll(this, "setProgramAsset");
    _.bindAll(this, "show");
    _.bindAll(this, "formatSynopsis");

    // Bind the "custom application" event
    options.hubAssetEvent.bind("setProgramAsset", this.setProgramAsset);
  },

  /**
   * Description : render of the view (when something change) This method is in charge also to remove the view.
   * @method render
   * @return The current instance
   */
  render: function() {
    this.$el.html(this.isVisible ? this.template: "");
    if (this.isVisible) {
      Log.c("###ELE:: VodView is visible => Populate the DOM with asset content and action menu");
      this.init();
    }
    return this;
  },


  /**
   * Description : show/hide the view
   * @method show
   * @param {} flag
   * @return 
   */
  show: function( flag ) {
      Log.c("###ELE:: VodView.show("+flag+")");
      if (this.isVisible !== flag) {
        this.el.style.visibility = flag ? "visible" : "hidden";
        this.isVisible = flag;
        this.render();
      }
  },

  /**
   * Description Perform action on OK key pressed
   * @method onOkAction
   * @return 
   */
  onOkAction: function () {
    // If the user choose WATCH TRAILER, go to trick mode view
    if (this.currentFocusedId === this.WATCH_TRAILER_ID) {
      // Send information about the event to the trick mode view
      var bckColor = "rgba("+this.program.color+",0.5)";
      trickModeAssetEvent.trigger('setAssetObj', { color: bckColor, src: this.program.source });
      // Switch view
      window.application.changeToState(window.application.screens.VCR);
    }
  },

  /**
   * Description
   * @method onBackAction
   * @return 
   */
  onBackAction: function () {
      window.application.changeToState('hubmenu');
  },

  /**
   * Description
   * @method onUpAction
   * @return 
   */
  onUpAction: function () {
    // Go up in the action menu list
    var goUp = this.scrollMenu(this.UP);
    flowerColorEvent.trigger('noDisplacement', !goUp);  
  },

  /**
   * Description
   * @method onDownAction
   * @return 
   */
  onDownAction: function () {
    var boldedNodes;
    if (this.currentFocusedId === -1) {
      Log.c("###ELE:: Get focus");
      boldedNodes = document.querySelectorAll('.vodPagesCounterBold');
      for (var i = 0; i < boldedNodes.length; i++) {
        boldedNodes[i].classList.remove('vodPagesCounterBold');
      };
    }
    // Go down in the action menu list
    var goDown = this.scrollMenu(this.DOWN);
    flowerColorEvent.trigger('noDisplacement', !goDown);          
  },


  /**
   * Description
   * @method onRightAction
   * @return 
   */
  onRightAction: function () {
    if (this.currentFocusedId === this.INFO_PANEL_ID) {
      // Display the next page in paging component
      var goRight = this.scrollPage(this.RIGHT);  
      flowerColorEvent.trigger('noDisplacement', !goRight);    
    }
  },


  /**
   * Description
   * @method onLeftAction
   * @return 
   */
  onLeftAction: function () {
    if (this.currentFocusedId === this.INFO_PANEL_ID) {
      // Display the previous page in paging component
      var goLeft = this.scrollPage(this.LEFT);  
      flowerColorEvent.trigger('noDisplacement', !goLeft);    
    }
  },

  /**
   * Description
   * @method enter
   * @param {} from
   * @return 
   */
  enter: function(from) {
    var that;

    Log.c("###ELE:: VodView.enter() from "+from);
    // activate the view and populate it 
    this.show(true);
    // zoom enter for the view 
    that = this;
    this.el.addEventListener( 'webkitTransitionEnd', function(e) {
      that.el.removeEventListener( 'webkitTransitionEnd', arguments.callee, false );
      //that.el.className = "";
    } );
    
    // Adding a delai before anim enter because the view is toooooooooooooo fast :p
    window.setTimeout(function () {
      that.el.className = 'view_enter';
    }, 1);
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
      this.el.className = 'view_zoomin';
    }
  },
  
  /*
   *=============================================================
   * PRIVATE FUNCTIONS 
   *=============================================================
   */

  /**
   * Description Allow to set the elected asset
   * @method setSelectedAssetId
   * @param anIndex The index of the selected vod asset
   * @return no value
   */
  setProgramAsset: function (anIndex) {
    var progList = window.application.vodProgramList;
    for (i = 0; i < progList.length; i++) {
      if (progList[i].index === anIndex) {
        this.program = progList[i];
      }
    }
  },

  /**
  * Makes the scrolling into the menu of actions
  * @method scrollMenu
  * @param {integer} step The step increment/decrement for list scrolling
  */
  scrollMenu: function(step) {
    // The new top and down items shall have an alpha value modified.    
    var hasScrolled = false;
    var partialFocusedId = this.currentFocusedId + step;

    Log.c("###ELE:: partialFocusedId :" +partialFocusedId);
    if (partialFocusedId >= 0 && partialFocusedId < this.menuItems.length) {
      // Case where we leave the paging component
      if (this.currentFocusedId !== this.INFO_PANEL_ID) {
        this.focusItem.classList.remove('focusedMethod'); 
        this.downListPos -= step * this.DOWN_LIST_STEP;
        this.menuList.style.marginTop = this.downListPos + 'px';
      }
      this.currentFocusedId += step;
      this.focusItem = document.getElementById('method'+this.currentFocusedId);
      this.focusItem.classList.add('focusedMethod');            
      hasScrolled = true;  
    } else {
      if ((this.currentFocusedId !== -1) && (partialFocusedId < 0)) {
        Log.c("###ELE:: loose focus");
        // The focus shall be given to the paging component
        this.focusItem = document.getElementById('method'+this.currentFocusedId);
        this.focusItem.classList.remove('focusedMethod');
        this.currentFocusedId = -1;
        this.focusPagingComponent(this.currentFocusedPage);
        hasScrolled = false;          
      }
    }
    return hasScrolled;
},

/*
 * @method focusPagingComponent 
 */
focusPagingComponent : function(currentPage) {
  var classBold = 'vodPagesCounterBold';
  // Change font for the whole line
  if (!this.pagePrev.classList.contains(classBold)) {
    this.pagePrev.classList.add(classBold);
    this.pageNext.classList.add(classBold);
    document.getElementById('numberPages').classList.add(classBold);
  }

  var opacityClass = 'opacityArrowPages';
  if (currentPage === 1) {
    if (this.nbPages === 1) {
      this.pagePrev.classList.add(opacityClass);
      this.pageNext.classList.add(opacityClass);
    } else {
      this.pagePrev.classList.add(opacityClass);
      this.pageNext.classList.remove(opacityClass);
    }
  } else if (this.currentFocusedPage === this.nbPages) {
    this.pagePrev.classList.remove(opacityClass);
    this.pageNext.classList.add(opacityClass);
  } else {
    this.pagePrev.classList.remove(opacityClass);
    this.pageNext.classList.remove(opacityClass);
  }
},

/**
 * Makes the scrolling into the paging component
 *
 * @param {integer} step The step increment/decrement for list scrolling
 */
scrollPage: function(step) {
  var partialFocusedPage = this.currentFocusedPage + step;
  if (partialFocusedPage >= 1 && partialFocusedPage <= this.nbPages) {
      pageListPos -= step * this.LEFT_PAGE_STEP;
      this.pageComponent.style.marginLeft = pageListPos + 'px';
      this.currentFocusedPage+= step;
      this.pageNumber.innerText = this.currentFocusedPage + '/' + this.nbPages;
      this.focusPagingComponent(this.currentFocusedPage);
      return true;
  }
  else {
      return false;
  }
},

/*
 * @method setVodAsset
 */
setVodAsset: function(color,urlImage,title) {
  var divAsset = document.getElementById('vodAsset');
  divAsset.style.backgroundColor =  color;
  divAsset.style.backgroundImage =  'url('+urlImage+')';
  divAsset.style.backgroundRepeat = "no-repeat";      
  divAsset.style.backgroundPosition = "right top";
  divAsset.style.backgroundSize = "152px 202px";
  this.setTextContent('vodTitleAsset',title);
},

/*
 * @method setTextContent
 */
setTextContent: function(divId, text) {
  var div = document.getElementById(divId);
  div.innerText = text;   
},

/*
 * @method setAssetTitle
 */
/*
 * @method setAssetTitle
 */
setAssetTitle: function(title) {
  var titleNode = document.getElementById('vodTitle'),
      context = this;

  // Set text
  titleNode.innerText = title;

  // Triger a timeout to check if the text is too long for one line
  window.setTimeout(function () {
    if (titleNode.offsetHeight > context.TITLE_LINE_HEIGHT) {
      titleNode.style.top = (titleNode.offsetTop + ((Math.round(titleNode.offsetHeight / context.TITLE_LINE_HEIGHT) - 1 * context.TITLE_LINE_HEIGHT))) + 'px';
    }
  }, 100);
},


/*
 * @method splitStringAtInterval
 */
splitStringAtInterval: function(string, interval) {
  var result = [];
  for (var i = 0; i < string.length; i += interval) {
    result.push(string.substring (i, i+interval));
  }
  return result;
},

/*
 *  Method raise when the synopsis has been rendered.
 *  This method will compute the number of lines necessary to display the entire synopsis and create the missig pages to handle it 
 */
formatSynopsis: function (synopsis) {
  var listeNode = document.getElementById('pagesList'),
      synopsysNode = document.querySelector('.synopsis'),
      availableHeight = listeNode.offsetHeight - synopsysNode.offsetTop - 10, // -10 for margin-top
      nblines = totalLines = (synopsysNode.offsetHeight / this.SYNOPSIS_LINE_HEIGHT),
      pageNode,
      paragraphNode;

  // Replace the summary
  while (availableHeight > this.SYNOPSIS_LINE_HEIGHT) {
    nblines--;
    availableHeight -= this.SYNOPSIS_LINE_HEIGHT;
  }
  synopsysNode.style.marginTop = (availableHeight + 10) + 'px';

  // Then add all necessary pages to display the entire synopsis
  while (nblines > 0) {
    // Create synopsys pages and fix the text to the right line on each of them 
    pageNode = document.createElement('li');
    pageNode.className = 'horizontalPage';
    paragraphNode = document.createElement('p');
    paragraphNode.innerText = synopsis;
    paragraphNode.style.marginTop = ((totalLines - nblines) * this.SYNOPSIS_LINE_HEIGHT * -1) + 'px';

    // Insert node
    pageNode.appendChild(paragraphNode);
    listeNode.appendChild(pageNode);

    // Update remaining lines and page number
    nblines -= this.SYNOPSIS_MAX_NB_LINES_IN_LIST;
    this.pageNumber.innerText = '1/' + (++this.nbPages);
  }

},

/*
 * @method createPages
 */
createPages: function(moods, plots, director, actors , summary) {
  var pageList = document.getElementById('pagesList'),
      callbackFormatSynopsysFunction = this.formatSynopsis,
      listNode,
      infoNode;
  
  // Create the first page
  listNode = document.createElement('li');
  listNode.className = 'horizontalPage';

  // Insert VOD infos
  infoNode = document.createElement('strong');
  infoNode.id = 'moods';
  infoNode.innerText = moods;
  listNode.appendChild(infoNode);

  infoNode = document.createElement('strong');
  infoNode.id = 'plots';
  infoNode.innerText = plots;
  listNode.appendChild(infoNode);

  infoNode = document.createElement('p');
  infoNode.id = 'director';
  infoNode.innerText = director;
  listNode.appendChild(infoNode);

  infoNode = document.createElement('p');
  infoNode.id = 'actors';
  infoNode.innerText = actors;
  listNode.appendChild(infoNode);

  infoNode = document.createElement('p');
  infoNode.className = 'synopsis';
  infoNode.innerText = summary;
  listNode.appendChild(infoNode);

  // Inject page
  pageList.appendChild(listNode);
  this.nbPages = 1;

  // Insert a delay before properly display synopsys (we are waiting for node injection to retreive node values)
  window.setTimeout(function () {
    callbackFormatSynopsysFunction(summary);
  }, 50);
},

/*
 * Allow to set the view content
 * @method setAssetContent
 */
setAssetContent: function() {
  // Set the VOD asset content on the left side
  var image, color;
  var indice = this.IMAGE_WIDTH + "x" + this.IMAGE_HEIGHT;
  if (this.program.image[indice]) {
    image = this.program.image[indice];
    color = "rgba("+this.program.color+",0.5)";
  } else {
    // Fake data mode
    image = this.IMAGES_PATH + this.program.poster;
    color = this.program.color;
  }

  // Set the title on the rigth side and on the top (allow to display long title)
  this.setVodAsset(color,image,this.program.title);
  this.setAssetTitle(this.program.title);
  
  // Allow to fill the pages container
  var moods = "Moods : " + this.program.moods;
  var plots = "Plots : " + this.program.plots;
  var director = "Directed by : " + this.program.directors;
  var actors = "With : " + this.program.actors;
  var summary = this.program.summary;
  
  // Create summary pages
  this.createPages(moods, plots, director, actors , summary);
},

/* Build the vertical menu
 * @method createActionsMenu
 */
createActionsMenu: function(items) {
  var listNode;

  for (var i = 0; i < items.length; i += 1) {
    // Create menu item
    listNode = document.createElement('li');
    listNode.className = 'menuItem';
    listNode.id = 'method' + i;
    listNode.innerText = items[i];

    // Insert menu item
    this.menuList.appendChild(listNode);
  }
},

/*
 * Build the list of properties related to the asset
 * @method createAssetProperties
 */
createAssetProperties: function(props, parentNode, forceInnerHTML) {
  var listNode,
      size,
      i;

  size = props.length;
  for (i = 0; i < size; i++) {
    // Creating list item
    listNode = document.createElement('li');
    listNode.className = 'propItem';
    
    if (forceInnerHTML)
      listNode.innerHTML = props[i];
    else
      listNode.innerText = props[i];

    // Inject it
    parentNode.appendChild(listNode);
  }

},

/*
 * Manage the asset properties
 * @method fillLabelsPropertiesArray
 */
fillLabelsPropertiesArray : function() {
  var labelsProperties = [];

  labelsProperties.push("audio");
  labelsProperties.push("subtitle");
  labelsProperties.push("version");
  labelsProperties.push("starting price");
  
  return (labelsProperties);
},

/*
 * Manage the asset properties values
 * @method fillValuesPropertiesArray
 */
fillValuesPropertiesArray : function() {
  var valuesProperties = [];

  valuesProperties.push(this.program.audios);
  valuesProperties.push(this.program.subtitles);
  valuesProperties.push(this.program.videoFormat);
  valuesProperties.push(this.program.price + " &euro;");
  
  return (valuesProperties);
},

/*
 * Description Perform the page initialisation
 * @method init
 */
init: function() {
  var boldNodes;

  window.application.userInfoBox.setViewName(this.VIEW_NAME);
  this.menuList = document.getElementById('actionMenuList');
  this.menuList.className = 'animableMenu';
  this.currentFocusedId = this.INFO_PANEL_ID; // Focus by default on the paging component
  this.downListPos = 0;
  this.menuList.style.marginTop = this.downListPos + 'px';
  this.pageComponent = document.getElementById('pagesList');
  this.pageComponent.className = 'animablePage';
  this.pageNumber = document.getElementById('numberPages');
  this.pagePrev = document.getElementById('leftArrowPages');
  this.pageNext = document.getElementById('rightArrowPages');
  this.currentFocusedPage = 1;
  pageListPos = 0;

  // Build action menu
  this.createActionsMenu(this.menuItems);

  // Build left asset
  this.createAssetProperties(this.fillLabelsPropertiesArray(), document.getElementById('leftLabels'));
  this.createAssetProperties(this.fillValuesPropertiesArray(), document.getElementById('leftValues'), true);
  
  // Build center page, set current page
  this.setAssetContent();
  this.focusPagingComponent(this.currentFocusedPage);
  this.pageNumber.innerText = '1/' + this.nbPages;

  // If we want to select a special asset in menu
  if (this._forceMenuItem != null) {
    this.scrollMenu(this._forceMenuItem);
    this._forceMenuItem = null;

    // Remove bold page index
    boldNodes = document.querySelectorAll('.vodPagesCounterBold');
    for (var i = 0; i < boldNodes.length; i++) {
      boldNodes[i].classList.remove('vodPagesCounterBold');
    };
  }
}

});
