/**
 Description: generic class most of (sub) views are inherited from, as Backbone MVC-compliant views.
 Common behaviour has been placed here to every sub-classes inherited from BaseView.
 Then : implementing (even as empty stubs) methods like onRightAction(), etc, won't be required any more
 by any sub-class inherited from BaseView. Since already implemented there within/by this BaseView
 Furthermore, BaseView class is responsible for title displayed at the top of each selected "screen"
 @class BaseView
 @extends Backbone.View
 **/


var BaseView = Backbone.View.extend({

    // backbone parameters
    id					: "baseView",
    el					: undefined,
    template			: "",
    className   		: "view_zoomout",

    // View parameters
	title				: "BaseView",	// It's the title which will be displayed. Must be overrided on all subview
    isVisible           : false,
	repeatInterval		: undefined,


    /**
     * Description : initialisation of the view
     * @method initialize
     * @param {} options
     * @return 
     */
    initialize: function (options) {

        Log.c("###AXT:: BaseView.initialize()");

        // Bind followings methods to be sure that use of "this" will be contextual to
        // this class
        _.bindAll(this, "onRightAction");
        _.bindAll(this, "onLeftAction");
        _.bindAll(this, "onOkAction");
        _.bindAll(this, "onBackAction");
        _.bindAll(this, "onUpAction");
        _.bindAll(this, "onDownAction");
        _.bindAll(this, "onEnterLongKeyPress");
        _.bindAll(this, "onExitLongKeyPress");

	},


	/**
	 * Description: render of the view (when something change)
	 * @method render
	 * @return ThisExpression
	 */
	render: function() {

		this.$el.html(this.isVisible ? this.template: "");
		
		return this;

	},



	/**
	 * Description:    show/hide the view
	 * @method show
	 * @param {} flag
	 * @return 
	 */
	show: function( flag ) {

		if( this.isVisible != flag )
		{
			this.el.style.visibility = flag ? "visible" : "hidden";
			this.isVisible = flag;
			this.render();
		}

	},

	/**
	 * Description
	 * @method onOkAction
	 * @return 
	 */
	onOkAction: function () {

	},

	/**
	 * Description
	 * @method onBackAction
	 * @return 
	 */
	onBackAction: function () {

	},

	/**
	 * Description
	 * @method onUpAction
	 * @return 
	 */
	onUpAction: function () {
		
	},

	/**
	 * Description
	 * @method onDownAction
	 * @return 
	 */
	onDownAction: function () {
		
	},

	/**
	 * Description
	 * @method onRightAction
	 * @return 
	 */
	onRightAction: function () {

	},

	/**
	 * Description
	 * @method onLeftAction
	 * @return 
	 */
	onLeftAction: function () {
 
	},

    /**
     * Description
     * @method onEnterLongKeyPress
     * @param {} key
     * @return 
     */
    onEnterLongKeyPress: function (key) {

        Log.c("###AXT:: BaseView.onEnterLongKeyPress(): --> <--");
		if( key.keyCode==37 || key.keyCode==39 || key.keyCode==38 || key.keyCode==40  )
		{
			if( key.keyCode==37 )
				this.repeatInterval = setInterval( this.onLeftAction, 200 );
			else if( key.keyCode==39 )
				this.repeatInterval = setInterval( this.onRightAction, 200 );
			else if( key.keyCode==38 )
				this.repeatInterval = setInterval( this.onUpAction, 200 );
			else if( key.keyCode==40 )
				this.repeatInterval = setInterval( this.onDownAction, 200 );
		}
 
    },

    /**
     * Description
     * @method onExitLongKeyPress
     * @param {} key
     * @return 
     */
    onExitLongKeyPress: function (key) {

        Log.c("###AXT:: BaseView.onExitLongKeyPress(): --> <--");
		if( this.repeatInterval != undefined )
		{
			clearInterval(this.repeatInterval);
			this.repeatInterval = undefined;
		}

    },

	/**
	 * Description
	 * @method enter
	 * @param {} from
	 * @return 
	 */
	enter: function(from) {

		Log.c("###AXT:: BaseView.enter()");
       	if (window.application.titleView) {
			window.application.titleView.setTitle(this.title);
		}

		if( !this.isVisible )
			this.show(true);

		this.el.className = "view_enter";
		
	},

	/**
	 * Description
	 * @method exit
	 * @param {} to
	 * @return 
	 */
	exit: function(to) {

		Log.c("###AXT:: BaseView.exit()");
		
		this.el.className = "view_zoomout";

	}
	
});
