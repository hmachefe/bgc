/**
 Description: specific view dedicated to FLOWER as a background (further) component.
 @class BaseView
 @extends Backbone.View
 **/
var FlowerView = BaseView.extend({

    angleShortKeyPressHorizontal: 3.5, // original value : 5 DEG
    angleShortKeyPressVertical: 3.5, // original value : 5 DEG

    /* flower settings for SHOWCASES view */
    hub_camera_original_position_z_offset: 10,
    hub_screen_rotation_horizontal_ratio: 1,
    hub_screen_rotation_vertical_ratio: 1,
    hub_screen_rotation_speed: 0.8,
    hub_screen_delta_x: -1.1,
    hub_screen_delta_y: 0.35,
    hub_screen_delta_z: -10.5,

    /* flower settings for ON DEMAND view */
    vod_screen_rotation_horizontal_ratio: 12,
    vod_screen_rotation_vertical_ratio: 8,
    vod_screen_rotation_speed: 0.8,
    vod_screen_delta_x: 0,
    vod_screen_delta_y: -0.8,
    vod_screen_delta_z: 15,

    /* flower settings for GRID view */
    grid_screen_rotation_horizontal_ratio: 4,
    grid_screen_rotation_vertical_ratio: 4,
    grid_screen_rotation_speed: 0.8,
    grid_screen_delta_x: 0,
    grid_screen_delta_y: -0.4,
    grid_screen_delta_z: 15,

    /* flower settings for INFO LAYER view */
    infolayer_screen_rotation_horizontal_ratio: 12,
    infolayer_screen_rotation_vertical_ratio: 8,
    infolayer_screen_rotation_speed: 0.8,
    infolayer_screen_delta_x: 1.6,
    infolayer_screen_delta_y: -1.2,
    infolayer_screen_delta_z: 0,

    angleBackToDefaultBalancedPosition: 0.1, //.5 to watch rotation back to default balanced position "more quicky"

    rotationSpeed: 0,

    LEFT: "left",
    RIGHT: "right",
    DOWN: "down",
    UP: "up",
    STATE_DURATION: 400, // Duration (in ms) of a translation on left/right
    MOVE_DURATION: 1250, // Duration (in ms) of a translation on left/right
    // Rotation de 5° dans la sens inverse de l’appui sur 30f (1,25s)

    MOVE2_DURATION: 10000, // Duration (in ms) of the come back of the translation
    // Retour à l’état initial a une vitesse de 2°/s de façon linéaire
    COLOR_DURATION: 900, // Duration (in ms) of the changecolor transition
    OPACITY_DURATION: 1250, // Duration (in ms) of the change opacity transition
    ROT_SPEED: 0.0005, // rotation speed of triangles (in turn per sec) 0.01
    MIN_ROT_SPEED: 0.8,
    MAX_ROT_SPEED: 1.2,
    leftCounter: 0, // leftCounter is increased or decreased every time LEFT key is pressed 
    rightCounter: 0, // rightCounter is increased or decreased every time RIGHT key is pressed 
    upCounter: 0, // upCounter is increased or decreased every time UP key is pressed 
    downCounter: 0, // downCounter is increased or decreased every time DOWN key is pressed 


    id: "flowerView",
    el: $("#flower_container"),
    template: undefined, // .template($('#stats-template').html()),

    // Delegated events definition
    events: {
        // Appel "changeColor" s'il y a un evnt de changement colorimetrie
        "#change_color": "changeColor"
    },

    // Global constants

    defaultProfileColor: undefined,

    user1: {},
    user2: {},

    lastTimestamp: 0,
    userProfileDependentLayerMaterialColor: [],
    userProfileDependentLayerMaterialSpecular: [],

    // Global parameters
    scene: undefined,
    camera: undefined,
    renderer: undefined,
    model: undefined,
    animations: undefined,
    kfAnimations: [],
    kfAnimationsLength: 0,
    meshes: [],
    materials: [],
    loader: undefined,
    progress: 0,
    dynMaterial: undefined,
    limiteFPS: false,
    baseNode: undefined,
    baseNodePos: undefined, // Contain the initial position value (vector3) of the "base" mesh
    baseNodePosX: 0,
    baseNodePosY: 0,
    baseNodePosZ: 0,
    baseNodeRotX: 0,
    baseNodeRotY: 0,
    baseNodeRotZ: 0,

    particleMat: undefined, // Reference to the material of particule assets
    particleOpacity: 0,

    lightPos: new THREE.Vector3(0, 0, 5),
    curTween: undefined,
    contentColorTween: undefined,
    profileColorTween: undefined,
    opacityTweens: [],

    petalMeshByLayer: [], // Array containing an array of petal meshs for each layer

    // Index of the layer parameters of each screen
    SCREEN_IDX_HUB: 0,
    SCREEN_IDX_FILTER: 1,
    SCREEN_IDX_DATA: 2,
    SCREEN_IDX_FLUX: 3,
    SCREEN_IDX_ACTION: 4,

    // Static layer parameters
    // The colors for layers 0, 2 and 3 can change according to profile
    // The color for layer 1 can change according to content
    layerParameters: [{
        color: 0x005Cc6,
        opacity: [0.20, 0.100, 0.05, 0.025, 0.00],
        textureFilename: "flower_layer_1.png"
    }, {
        color: 0x944C2B,
        opacity: [0.15, 0.135, 0.12, 0.110, 0.10],
        textureFilename: "flower_layer_2.png"
    }, {
        color: 0x005Cc6,
        opacity: [0.20, 0.165, 0.13, 0.115, 0.10],
        textureFilename: "flower_layer_3.png"
    }, {
        color: 0x005Cc6,
        opacity: [0.19, 0.050, 0.05, 0.050, 0.05],
        textureFilename: "flower_layer_4.png"
    }],


    stepHorizontalRotation: 0,
    stepVerticalRotation: 0,
    noMove: false,
    noHorizontalMove: false,
    noVerticalMove : false,

    // Performance measure
    perfStartup: 0,
    perfTimeAccumul: 0,
    perfFrames: 0,
    colladaLocation: "resources/models/",
    colladaFile: "2014.04.25-Fleur_UvMapping.dae",
    flowerRenderedCounter: 0,

    /**
     * Description : initialisation of the view
     * @method initialize
     * @param {} options
     * @return
     */
    initialize: function (options) {

        Log.c("###HMA:: FlowerView.initialize()");
        var loader;

        // Bind followings methods to be sure that use of "this" will be contextual to
        // this class
        _.bindAll(this, "changeColorAccordingToContent");
        _.bindAll(this, "changeColorAccordingToProfile");
        _.bindAll(this, "onColladaLoad");
        _.bindAll(this, "onRightAction");
        _.bindAll(this, "onLeftAction");
        _.bindAll(this, "onUpAction");
        _.bindAll(this, "onDownAction");
        _.bindAll(this, "onOkAction");
        _.bindAll(this, "onBackAction");
        _.bindAll(this, "onChangeState");
        _.bindAll(this, "animate");
        _.bindAll(this, "noDisplacement");
        _.bindAll(this, "noVerticalDisplacement");
        _.bindAll(this, "noHorizontalDisplacement");

        // Bind the "custom application" event
        options.leftEvent.bind("onLeft", this.onLeftAction);
        options.rightEvent.bind("onRight", this.onRightAction);
        options.upEvent.bind("onUp", this.onUpAction);
        options.downEvent.bind("onDown", this.onDownAction);
        options.okEvent.bind("onOk", this.onOkAction);
        options.backEvent.bind("onBack", this.onBackAction);

        options.flowerColorEvent.bind("noDisplacement", this.noDisplacement);
        options.flowerColorEvent.bind("noVerticalDisplacement", this.noVerticalDisplacement);
        options.flowerColorEvent.bind("noHorizontalDisplacement", this.noHorizontalDisplacement);
        options.flowerColorEvent.bind("changeColorAccordingToContent", this.changeColorAccordingToContent);
        options.flowerColorEvent.bind("changeColorAccordingToProfile", this.changeColorAccordingToProfile);

        options.changeState.bind("onChangeState", this.onChangeState);

        this.defaultProfileColor = options.defaultProfileColor;
        this.user1.name = "user1";
        this.user1.color = {};
        this.user1.color.r = 0;
        this.user1.color.g = 0.3568627450980392;
        this.user1.color.b = 0.6470588235294118;
        this.user2.name = "user2";
        this.user2.color = {};
        this.user2.color.r = 231 / 255;
        this.user2.color.g = 121 / 255;
        this.user2.color.b = 46 / 255;

        // Load the flower file
        loader = new THREE.ColladaLoader();
        loader.options.convertUpAxis = true;
        loader.load(this.colladaLocation + this.colladaFile, this.onColladaLoad);
        this.rotationSpeed = this.hub_screen_rotation_speed;

    },


    /**
     * Description: render of the view (invoked by BaseView parent class).
     * But too early to paint, because of asynchronous AJAX request completion . Then return...
     * @method render
     * @return ThisExpression
     */
    render: function () {
        return this;
    },

    /**
     * Description: renderFlower of the view (when something comes to change). Internal rendering loop lays on this method
     * @method render
     * @return ThisExpression
     */
    renderFlower: function (timestamp) {

        this.flowerRenderedCounter++;
        if (this.flowerRenderedCounter % 2 == 0) return;

        if (this.flowerRenderedCounter === Number.MAX_VALUE) this.flowerRenderedCounter = 0;

        // Update any TWEEN animations
        TWEEN.update();

        // Manage animations
        var frameTime = (timestamp - this.lastTimestamp) * 0.001; // seconds
        this.rotateMeshes(frameTime);
        this.lastTimestamp = timestamp;
        this.renderer.render(this.scene, this.camera);

        return this; // It seems it's "standard" on backbone application

    },


    /**
     * Description:     entry point for the custom animation.
     *                  responsible for flower animation rendering loop (based on requestAnimationFrame())
     * @method animate
     * @param {} flag
     * @return
     */
    animate: function () {

        requestAnimationFrame(this.animate);
        this.renderFlower(Date.now());

    },

    /**
     * Description:     each mesh (meaning each pyramid) shall rotate with a specific rule along with Z axis
     * @method rotateMeshes
     * @param {} frameTime
     * @return
     */
    rotateMeshes: function (frameTime) {
        this.model.rotation.z += Math.PI * (this.rotationSpeed * frameTime) / 180;
        this.baseNodeRotZ = this.model.rotation.z;
    },


    /**
     * Change the color of 3 layers of the flower
     * @param {} r
     * @param {} g
     * @param {} b
     */
    changeColorAccordingToProfile: function (r, g, b) {

        r = r / 255;
        g = g / 255;
        b = b / 255;

        // Remove any previous color  animation
        if (this.profileColorTween != undefined) {
            TWEEN.remove(this.profileColorTween);
        }

        // Change the material color of the layer
        var mat0 = this.materials[0],
            mat2 = this.materials[2],
            mat3 = this.materials[3];
        if (mat0 !== undefined && mat2 !== undefined && mat3 !== undefined) {
            this.profileColorTween = new TWEEN.Tween(mat0.color).to({
                r: r,
                g: g,
                b: b
            }, this.COLOR_DURATION)
                .easing(TWEEN.Easing.Linear.None).start();
            this.profileColorTween = new TWEEN.Tween(mat2.color).to({
                r: r,
                g: g,
                b: b
            }, this.COLOR_DURATION)
                .easing(TWEEN.Easing.Linear.None).start();
            this.profileColorTween = new TWEEN.Tween(mat3.color).to({
                r: r,
                g: g,
                b: b
            }, this.COLOR_DURATION)
                .easing(TWEEN.Easing.Linear.None).start();
        }
    },

    /**
     * Description:     flower color is supposed to evolve according to flower jacket (or live video) color
     * @param {} r
     * @param {} g
     * @param {} b
     * @return
     */
    changeColorAccordingToContent: function (r, g, b) {
        //return;
        var cssColor = [r, g, b];

        r = cssColor[0] / 255;
        g = cssColor[1] / 255;
        b = cssColor[2] / 255;
        Log.c("###HMA:: FlowerView.changeColor(): color=(" + r + "," + g + "," + b + ")");

        // Remove any previous color  animation
        if (this.contentColorTween != undefined) {
            TWEEN.remove(this.contentColorTween);
        }

        // Change the material color of the layer
        var mat = this.materials[1];
        if (mat != undefined) {
            this.contentColorTween = new TWEEN.Tween(mat.color).to({
                r: r,
                g: g,
                b: b
            }, this.COLOR_DURATION)
                .easing(TWEEN.Easing.Linear.None).start();
        }
    },

    /**
     * Description:     not used yet. Ubik UI code legacy. Used earlier while migrating from HUB view to FILTER view
     * @method onChangeState
     * @param {} from
     * @param {} to
     * @return
     */
    onChangeState: function (from, to) {
        //TODO check that the following states correspond to the right opacity
        switch (to) {
        case window.application.screens.HUB:
            this.changeOpacity(this.SCREEN_IDX_HUB);
            this.changeZdepth(this.hub_screen_delta_z, this.hub_screen_delta_x, this.hub_screen_delta_y);
            this.rotationSpeed = this.hub_screen_rotation_speed;
            break;
        case window.application.screens.VOD:
            this.changeOpacity(this.SCREEN_IDX_ACTION);
            this.changeZdepth(this.vod_screen_delta_z, this.vod_screen_delta_x, this.vod_screen_delta_y);
            this.rotationSpeed = this.vod_screen_rotation_speed;
            break;
        case window.application.screens.GRID:
            this.changeOpacity(this.SCREEN_IDX_DATA);
            this.changeZdepth(this.grid_screen_delta_z, this.grid_screen_delta_x, this.grid_screen_delta_y);
            this.rotationSpeed = this.grid_screen_rotation_speed;
            break;
        case window.application.screens.INFOLAYER:
            this.changeOpacity(this.SCREEN_IDX_FLUX);
            this.changeZdepth(this.infolayer_screen_delta_z, this.infolayer_screen_delta_x, this.infolayer_screen_delta_y);
            this.rotationSpeed = this.infolayer_screen_rotation_speed;
            break;
        case window.application.screens.FLOWER:
        default:
            this.changeOpacity(this.SCREEN_IDX_FLUX);
            break;
        }
        return;
    },

    /**
     * getScreenRotationRatio:     computes angle depending on how often key has been pressed (by <n> as an argument)
     *                             algorithm is based on geometrical serie U[n+1] = U[n] / 2 + original const
     * @method computeRotationFromCounter
     * @return {ratio}  value given as a ratio (no unit)
     */
    getScreenRotationRatio: function (direction) {
        var ratio;
        switch (direction) {
        case this.LEFT:
        case this.RIGHT:
            switch (window.application.curState) {
            case window.application.screens.HUB:
                ratio = this.hub_screen_rotation_horizontal_ratio;
                break;
            case window.application.screens.GRID:
                ratio = this.grid_screen_rotation_horizontal_ratio;
                break;
            case window.application.screens.VOD:
                ratio = this.vod_screen_rotation_horizontal_ratio;
                break;
            }
            break;

        case this.UP:
        case this.DOWN:
            switch (window.application.curState) {
            case window.application.screens.HUB:
                ratio = this.hub_screen_rotation_vertical_ratio;
                break;
            case window.application.screens.GRID:
                ratio = this.grid_screen_rotation_vertical_ratio;
                break;
            case window.application.screens.VOD:
                ratio = this.vod_screen_rotation_vertical_ratio;
                break;
            }
            break;

        }
        return ratio;
    },

    /**
     * getScreenRotationRatio:     computes angle depending on how often key has been pressed (by <n> as an argument)
     *                             algorithm is based on geometrical serie U[n+1] = U[n] / 2 + original const
     * @method computeRotationFromCounter
     * @return {ratio}  value given as a ratio (no unit)
     */
    getScreenDisplacementZdepth: function () {
        var zDepth;
        switch (window.application.curState) {
        case window.application.screens.HUB:
            zDepth = this.hub_screen_delta_z;
            break;
        case window.application.screens.GRID:
            zDepth = this.grid_screen_delta_z;
            break;
        case window.application.screens.VOD:
            zDepth = this.vod_screen_delta_z;
            break;
        }
        return zDepth;
    },

    /**
     * Description:     computes angle depending on how often key has been pressed (by n argument)
     *                  algorithm is based on geometrical serie U[n+1] = U[n] / 2 + original const
     * @method computeRotationFromCounter
     * @param {n}       counter that stands for how many times key button has been pushed
     * @return {angle}  value given in RAD
     */
    computeRotationFromCounter: function (n, direction) {
        var twoN, twoNminusOne;
        var computedAngle;

        switch (direction) {
        case this.LEFT:
        case this.RIGHT:

            rawAngle = this.angleShortKeyPressHorizontal;
            break;

        case this.UP:
        case this.DOWN:
            rawAngle = this.angleShortKeyPressVertical;
            break;
        }


        twoN = Math.pow(2, n);
        twoNminusOne = Math.pow(2, (n - 1));
        computedAngle = this.angleShortKeyPressHorizontal * ((twoN - 1) / (twoNminusOne));
        return computedAngle;
    },


    /**
     * Description:     flower behaviour in case LEFT key has been pressed
     * @method onLeftAction
     * @return
     */
    onLeftAction: function () {
        var screenRotationRatio;
        var screenRotationAngle;

        /* flower is not supposed to move (any more) as long as selected view is VOD or GRID */
        /* please refer to  http://spvss-confluence.cisco.com/pages/viewpage.action?pageId=8390901 */
        if ((window.application.curState == window.application.screens.VOD) || (window.application.curState == window.application.screens.GRID))
            return;

        if ((this.noMove === true)||(this.noHorizontalMove === true))
            return;

        this.leftCounter++;
        screenRotationRatio = this.getScreenRotationRatio(this.LEFT);
        screenRotationAngle = this.computeRotationFromCounter(this.leftCounter, this.LEFT);
        this.stepHorizontalRotation = ((screenRotationAngle) * (Math.PI) / 180) / screenRotationRatio;

        {
            // Remove any previous animation
            if (this.curTween != undefined)
                TWEEN.remove(this.curTween);
            // The move
            this.curTween = new TWEEN.Tween(this.baseNode.rotation).to({
                x: this.baseNodeRotX,
                y: (this.stepHorizontalRotation),
                z: this.baseNodeRotZ
            }, this.MOVE_DURATION)
                .easing(TWEEN.Easing.Sinusoidal.Out).start();
            // the come back
            var that = this;
            this.curTween.onComplete(function () {
                window.application.flowerView.curTween = new TWEEN.Tween(that.baseNode.rotation).to({
                    x: that.baseNodeRotX,
                    y: that.baseNodeRotY,
                    z: that.baseNodeRotZ + that.angleBackToDefaultBalancedPosition
                }, that.MOVE2_DURATION)
                    .easing(TWEEN.Easing.Linear.None).start();
                that.stepHorizontalRotation = 0;
                that.leftCounter = 0;
                that.rightCounter = 0;
            });

        }

    },


    changeZdepth: function (aScreenOffsetZ, aScreenOffsetX, aScreenOffsetY) {
        // Remove any previous animation
        if (this.curTweenZ !== undefined)
            TWEEN.remove(this.curTweenZ);
        // The move
        if (this.baseNode !== undefined) {
            this.curTweenZ = new TWEEN.Tween(this.baseNode.position).to({
                x: aScreenOffsetX,
                y: aScreenOffsetY,
                z: aScreenOffsetZ
            }, this.MOVE_DURATION)
                .easing(TWEEN.Easing.Cubic.Out).start();
        }
    },

    /**
     * Description:     flower behaviour in case RIGHT key has been pressed
     * @method onRightAction
     * @return
     */
    onRightAction: function () {

        var screenRotationRatio;
        var screenRotationAngle;

        /* flower is not supposed to move (any more) as long as selected view is VOD or GRID */
        /* please refer to  http://spvss-confluence.cisco.com/pages/viewpage.action?pageId=8390901 */
        if ((window.application.curState == window.application.screens.VOD) || (window.application.curState == window.application.screens.GRID))
            return;

        if ((this.noMove === true)||(this.noHorizontalMove === true))
            return;

        this.rightCounter++;
        screenRotationRatio = this.getScreenRotationRatio(this.RIGHT);
        screenRotationAngle = this.computeRotationFromCounter(this.rightCounter, this.RIGHT);
        this.stepHorizontalRotation = -((screenRotationAngle) * (Math.PI) / 180) / screenRotationRatio;

        // Remove any previous animation
        if (this.curTween != undefined)
            TWEEN.remove(this.curTween);
        // The move
        this.curTween = new TWEEN.Tween(this.baseNode.rotation).to({
            x: this.baseNodeRotX,
            y: (this.stepHorizontalRotation),
            z: this.baseNodeRotZ
        }, this.MOVE_DURATION)
            .easing(TWEEN.Easing.Exponential.Out).start();
        // the come back
        var that = this;
        this.curTween.onComplete(function () {
            window.application.flowerView.curTween = new TWEEN.Tween(that.baseNode.rotation).to({
                x: that.baseNodeRotX,
                y: that.baseNodeRotY,
                z: that.baseNodeRotZ + that.angleBackToDefaultBalancedPosition
            }, that.MOVE2_DURATION)
                .easing(TWEEN.Easing.Linear.None).start();
            that.stepHorizontalRotation = 0;
            that.leftCounter = 0;
            that.rightCounter = 0;
        });

    },



    /**
     * Description:     flower behaviour in case DOWN key has been pressed
     * @method onDownAction
     * @return
     */
    onDownAction: function () {

        var screenRotationRatio;
        var screenRotationAngle;

        /* flower is not supposed to move (any more) as long as selected view is VOD or GRID */
        /* please refer to  http://spvss-confluence.cisco.com/pages/viewpage.action?pageId=8390901 */
        if ((window.application.curState == window.application.screens.VOD) || (window.application.curState == window.application.screens.GRID))
            return;

        if ((this.noMove === true)||(this.noVerticalMove === true))
            return;

        this.downCounter++;

        screenRotationRatio = this.getScreenRotationRatio(this.DOWN);
        screenRotationAngle = this.computeRotationFromCounter(this.downCounter, this.DOWN);
        this.stepVerticalRotation = -((screenRotationAngle) * (Math.PI) / 180) / screenRotationRatio;

        // Remove any previous animation
        if (this.curTween != undefined)
            TWEEN.remove(this.curTween);
        // The move
        this.curTween = new TWEEN.Tween(this.baseNode.rotation).to({
            x: (this.stepVerticalRotation),
            y: this.baseNodeRotY,
            z: this.baseNodeRotZ
        }, this.MOVE_DURATION)
            .easing(TWEEN.Easing.Exponential.Out).start();
        // the come back
        var that = this;
        this.curTween.onComplete(function () {
            window.application.flowerView.curTween = new TWEEN.Tween(that.baseNode.rotation).to({
                x: that.baseNodeRotX,
                y: that.baseNodeRotY,
                z: that.baseNodeRotZ + that.angleBackToDefaultBalancedPosition
            }, that.MOVE2_DURATION)
                .easing(TWEEN.Easing.Linear.None).start();
            that.stepVerticalRotation = 0;
            that.downCounter = 0;
            that.upCounter = 0;
        });

    },


    /**
     * Description:     flower behaviour in case UP key has been pressed
     * @method onUpAction
     * @return
     */
    onUpAction: function () {

        var screenRotationRatio;
        var screenRotationAngle;

        /* flower is not supposed to move (any more) as long as selected view is VOD or GRID */
        /* please refer to  http://spvss-confluence.cisco.com/pages/viewpage.action?pageId=8390901 */
        if ((window.application.curState == window.application.screens.VOD) || (window.application.curState == window.application.screens.GRID))
            return;

        if ((this.noMove === true)||(this.noVerticalMove === true))
            return;

        this.upCounter++;

        screenRotationRatio = this.getScreenRotationRatio(this.UP);
        screenRotationAngle = this.computeRotationFromCounter(this.upCounter, this.UP);
        this.stepVerticalRotation = ((screenRotationAngle) * (Math.PI) / 180) / screenRotationRatio;

        // Remove any previous animation
        if (this.curTween != undefined)
            TWEEN.remove(this.curTween);
        // The move
        this.curTween = new TWEEN.Tween(this.baseNode.rotation).to({
            x: (this.stepVerticalRotation),
            y: this.baseNodeRotY,
            z: this.baseNodeRotZ
        }, this.MOVE_DURATION)
            .easing(TWEEN.Easing.Exponential.Out).start();
        // the come back
        var that = this;
        this.curTween.onComplete(function () {
            window.application.flowerView.curTween = new TWEEN.Tween(that.baseNode.rotation).to({
                x: that.baseNodeRotX,
                y: that.baseNodeRotY,
                z: that.baseNodeRotZ + that.angleBackToDefaultBalancedPosition
            }, that.MOVE2_DURATION)
                .easing(TWEEN.Easing.Linear.None).start();
            that.stepVerticalRotation = 0;
            that.downCounter = 0;
            that.upCounter = 0;
        });

    },


    /**
     * Description:     flower behaviour in case BACK key has been pressed
     * @method onBackAction
     * @return
     */
    onBackAction: function () {

        //if (this.baseNode != undefined)
        {
            // Remove any previous animation
            if (this.curTween != undefined)
                TWEEN.remove(this.curTween);
            // The move
            this.curTween = new TWEEN.Tween(this.baseNode.position).to({
                x: this.baseNodePosX,
                y: this.baseNodePosY,
                z: (this.baseNodePosZ - this.hub_screen_delta_z)
            }, this.MOVE_DURATION)
                .easing(TWEEN.Easing.Cubic.Out).start();
            // the come back
            var that = this;
            this.curTween.onComplete(function () {

            });
        }

    },

    /**
     * Description:     variable that stands for decision made by other views to move it or not
     * @method noHorizontalDisplacement
     * @return
     */
    noHorizontalDisplacement: function (param) {
        this.noHorizontalMove = param; // true of false
    },

    /**
     * Description:     variable that stands for decision made by other views to move it or not
     * @method noHorizontalDisplacement
     * @return
     */
    noVerticalDisplacement: function (param) {
        this.noVerticalMove = param; // true of false
    },


    /**
     * Description:     variable that stands for decision made by other views to move it or not
     * @method noDisplacement
     * @return
     */
    noDisplacement: function (param) {
        this.noMove = param; // true of false
    },


    /**
     * Description:     asynchronous callback requested as soon as XML collada file has been loaded and parsed
     * @method onColladaLoad
     * @param {} flag : collada model provided as a JSON data structure
     * @return
     */
    onColladaLoad: function (collada) {

        Log.c("###AXT:: FlowerView.onColladaLoad()");
        this.model = collada.scene;
        this.model.scale.x = this.model.scale.y = this.model.scale.z = 1; // 1/8 scale, modeled in cm
        this.model.updateMatrix();
        this.baseNode = this.model;
        this.baseNodePos = this.model.position;

        window.referenceModel = collada.scene.children[0];


        this.scenePostProcessing(this.model);
        this.extractPetalMeshes();
        this.removeLights();
        this.createMaterials();
        this.storeUserProfileDependentColorLayers();
        this.scene3DInit();
        this.animate();
    },

    /**
     * Change the global opacity of all the layers
     * @param screenIdx is one of SCREEN_IDX_*
     */
    changeOpacity: function (screenIdx) {
        // Start a transition on each layer
        for (var l = 0; l < this.layerParameters.length; l++) {
            var opacity = this.layerParameters[l].opacity[screenIdx];

            // Remove any previous animation
            if (this.opacityTweens[l]) {
                TWEEN.remove(this.opacityTweens[l]);
            }

            // Change the material opacity of the layer
            if (this.materials[l]) {
                var tween = new TWEEN.Tween(this.materials[l]);
                tween.to({
                    opacity: opacity
                }, this.OPACITY_DURATION);
                tween.easing(TWEEN.Easing.Linear.None);
                tween.start();

                this.opacityTweens[l] = tween;
            }
        }
    },


    /**
     * Description:     init the collada scene after the load/parse of the model: Camera, Light,
     * @method scene3DInit
     * @return
     */
    scene3DInit: function () {
        var width = 1280,
            height = 720;
        var container = this.el;

        this.camera = new THREE.PerspectiveCamera(35, width / height, 1, 2000);

        this.scene = new THREE.Scene();
        this.scene.add(this.model);

        this.baseNodePos.x = this.hub_screen_delta_x; //-7.4
        this.camera.position.x = this.hub_screen_delta_x; //-7.4
        this.baseNodePos.y = this.hub_screen_delta_y; //-7.4
        this.camera.position.y = this.hub_screen_delta_y; //-7.4
        this.baseNodePos.z = this.hub_screen_delta_z; //-7.4

        this.camera.position.z = this.hub_camera_original_position_z_offset; //-7.4


        this.baseNodePosX = this.baseNodePos.x;
        this.baseNodePosY = this.baseNodePos.y;
        this.baseNodePosZ = this.baseNodePos.z;

        this.baseNodeRotX = this.baseNode.rotation.x;
        this.baseNodeRotY = this.baseNode.rotation.y;
        this.baseNodeRotZ = this.baseNode.rotation.z;

        this.camera.lookAt(this.scene.position);

        // Lights
        this.light = new THREE.DirectionalLight(0xffffff, 1.5);
        this.light.position = this.lightPos;
        this.scene.add(this.light);


        // Create and attach the Renderer

        this.renderer = new THREE.WebGLRenderer({
            antialias: false,
            alpha: true
        });
        this.renderer.setSize(width, height);
        //this.renderer.setClearColor( 0x00000A, 1);

        container.appendChild(this.renderer.domElement);

        Log.c("###HMA:: FlowerView.scene3DInit(): w=" + width + ", h=" + width);

    },


    /**
     * Description:     Start the animation fo the collada file
     * @method scene3Dstart
     * @param {} flag : collada model provided as a JSON data structure
     * @return
     */
    scene3Dstart: function () {

        Log.c("###AXT:: FlowerView.scene3Dstart()");

        for (var i = 0; i < this.kfAnimationsLength; ++i) {

            var animation = this.kfAnimations[i];

            for (var h = 0, hl = animation.hierarchy.length; h < hl; h++) {

                var keys = animation.data.hierarchy[h].keys;
                var sids = animation.data.hierarchy[h].sids;
                var obj = animation.hierarchy[h];

                if (keys.length && sids) {

                    for (var s = 0; s < sids.length; s++) {

                        var sid = sids[s];
                        var next = animation.getNextKeyWith(sid, h, 0);

                        if (next) next.apply(sid);

                    }

                    obj.matrixAutoUpdate = false;
                    animation.data.hierarchy[h].node.updateMatrix();
                    obj.matrixWorldNeedsUpdate = true;

                }

            }

            animation.play(false, 0);
            this.lastTimestamp = Date.now();

        }

    },


    /**
     * Description:     post process the model: create an array of all mesh to prevent
     *       further recursive parsing if the model + fixe animation from
     *       quaternion to euler.
     *       create also a list of unique materials
     * @method scenePostProcessing
     * @param {} object
     * @return
     */
    scenePostProcessing: function (object) {

        if (object == undefined) return;

        for (i = 0; i < this.model.children.length; i++) {
            object = this.model.children[i];
            if ((object instanceof THREE.Mesh)) {
                // Manage meshes & rotation
                object.useQuaternion = false;
                object.rotation.setFromQuaternion(object.quaternion);
                object.priv_anim = 2 * Math.PI * this.ROT_SPEED * (1.2) / 2;
            }
        }
    },

    /**
     * Description:         permanent direct array references onto userProfileDependentLayerMaterialColor[...]
     *                      dedicated to reflecting USER colors (blue for user1, ???yellow??? for user2)
     *                      to avoid browsing model every time, again an again, to target them
     *                      when these pyramid colors have to be changed. OPTIMIZATION? TBC
     * @method storeUserProfileDependentColorLayers
     * @return
     */
    storeUserProfileDependentColorLayers: function () {
        var k = 0;
        for (var i = 0; i < this.model.children.length - 1; i++) {
            if (!(this.model.children[i] instanceof THREE.Mesh)) continue; //FIXME temp
            var mesh = this.model.children[i];
            var mat = mesh.material;
            var color = mat.color;
            var specular = mat.specular;
            //console.log("setUSerColor:: mesh.name == " + mesh.name);
            switch (mesh.name) {
            case "couche2_1":
            case "couche2_2":
            case "couche2_3":
                break;

            default:
                this.userProfileDependentLayerMaterialColor[k] = color;
                this.userProfileDependentLayerMaterialSpecular[k] = specular;
                k++;
                break;
            }
        }
    },


    /**
     * Description:         delete a node identified by its name, recursive behaviour
     * @method meshDelete
     * @param {} object: current node candidate for deletion along with recursivity
     * @param {} name: name by which node shall be targeted and deleted
     * @return
     */
    meshDelete: function (object, name) {

        for (var i = 0; i < object.children.length; i++) {
            var child = object.children[i];
            if (child.name == name) {
                object.remove(child);
                return;
            } else if (child.children.length > 0) {
                this.meshDelete(child, name);
            }
        }
    },


    /**
     * Description:         rescale a node identified by its name
     * @method meshScale
     * @param {} object: current node candidate for re-scaling along with recursivity
     * @param {} name: name by which node shall be targeted and re-scaled
     * @param {} scale: scale rules to be applied
     * @return
     */
    meshScale: function (object, name, scale) {

        for (var i = 0; i < object.children.length; i++) {
            var child = object.children[i];
            if (child.name == name) {
                child.scale.set(scale /*0.7*/ , scale /*0.7*/ , scale /*0.7*/ );
                return;
            } else if (child.children.length > 0) {
                this.meshScale(child, name);
            }
        }
    },


    /**
     * Description:         post process the mesh to reduce draw call
     * @method meshPostProcessing
     * @param {} object
     * @return
     */
    meshPostProcessing: function (object) {

        if (object == undefined) return;
        //Log.log("###AXT:: FlowerView.meshPostProcessing(): process child.name="+object.name+", nb="+object.children.length);

        var combined = new THREE.Geometry();
        var material = undefined;
        var meshToDelete = [];

        for (var i = 0; i < object.children.length; i++) {
            var child = object.children[i];
            if (child.name.substr(0, 5) == "Point" && child.children.length == 0) {
                Log.c("###AXT:: FlowerView.meshPostProcessing(), remove=" + child.name);
                meshToDelete.push(child);
            } else if (child.name.substr(0, 5) == "Point") {
                child.updateMatrixWorld(true);
                for (var j = 0; j < child.children.length; j++) {
                    if ((child.children[j] instanceof THREE.Mesh)) {
                        var geometry = child.children[j].geometry.clone();
                        child.children[j].updateMatrix();
                        geometry.applyMatrix(child.children[j].matrix);
                        geometry.applyMatrix(child.matrix);
                        THREE.GeometryUtils.merge(combined, geometry);

                        if (this.particleMat == undefined) {
                            this.particleMat = new THREE.MeshLambertMaterial({
                                color: child.children[j].material.color,
                                ambient: 0x050505,
                                name: child.children[j].material.name,
                                transparent: child.children[j].material.transparent,
                                opacity: (child.children[j].material.opacity > 0.5 ? 1.0 - child.children[j].material.opacity + 0.1 : child.children[j].material.opacity),
                                blending: THREE.AdditiveBlending,
                                fog: false,
                                depthTest: false,
                                depthWrite: false,
                                side: THREE.DoubleSide
                            });
                            Log.c("###AXT:: FlowerView.meshPostProcessing(), material=" + this.particleMat.name);
                        }
                    }
                }
                meshToDelete.push(child);
            } else if (child.name == "base001" || child.name == "base002" || child.name == "base") {
                this.simplifyGeometry(child);
            }
        }

        var mesh = new THREE.Mesh(combined, this.particleMat);
        mesh.name = "combinedParticles";
        mesh.position.copy(object.position);
        mesh.scale.set(0.125, 0.125, 0.125);
        mesh.updateMatrixWorld(true);
        mesh.updateMatrix();
        this.scene.add(mesh);

        if (meshToDelete.length > 0) {
            Log.c("###AXT:: FlowerView.meshPostProcessing(): must delete =" + meshToDelete.length);
            for (var i = 0; i < meshToDelete.length; i++) {
                object.remove(meshToDelete[i]);
            }
        }
    },


    /**
     * Description:         get a node identified by its name
     * @method findMeshByName
     * @param {} name: name by which node shall be targeted and returned
     * @return
     */
    findMeshByName: function (name) {
        for (var i = 0; i < this.model.children.length; i++) {
            var object = this.model.children[i];
            if ((object instanceof THREE.Mesh)) {
                if (object.name == name) {
                    return object;
                }
            }
        }

        return null;
    },

    /**
     * Description:         Vertex Painting
     * @method createMaterials
     * @return
     */
    createMaterials: function () {
        var l, textures = [],
            layers = this.layerParameters;

        // The color for the layers 0, 2 and 3 is the defined color for the default user
        // If no such color is found, the color will remain the default one        
        if (this.defaultProfileColor) {
            layers[0].color = 'rgb(' + this.defaultProfileColor + ')';
            layers[2].color = 'rgb(' + this.defaultProfileColor + ')';
            layers[3].color = 'rgb(' + this.defaultProfileColor + ')';
        }

        // Instanciate textures
        for (l = 0; l < layers.length; l++) {
            textures.push(THREE.ImageUtils.loadTexture(this.colladaLocation + layers[l].textureFilename));
        }

        // Create new materials to set on each layer (materials are shared)
        for (l = 0; l < layers.length; l++) {
            // create the layers material
            //MeshLambertMaterial ou MeshPhongMaterial
            this.materials[l] = new THREE.MeshLambertMaterial({
                map: textures[l],
                color: new THREE.Color(layers[l].color),
                opacity: layers[l].opacity[this.SCREEN_IDX_HUB],
                transparent: true,
                blending: THREE.AdditiveBlending,
                shininess: 50
            });

            // Set the material on each petal mesh of the current layer
            var petals = this.petalMeshByLayer[l];
            if (petals) {
                for (var p = 0; p < petals.length; p++) {
                    var mesh = petals[p];
                    if (mesh) {
                        mesh.material = this.materials[l];
                    }
                }
            }
        }
    },


    /**
     * Description:         search for a material identified by it's name on the material list.
     * @method getMaterialFromName
     * @param {} materialName: name by which material shall be targeted and returned
     * @return  : return the instance of the material or undefined
     */
    getMaterialFromName: function (materialName) {

        for (var i = 0; i < this.materials.length; i++) {
            if (this.materials[i].name == materialName) {
                return this.materials[i];
            }
        }
        // not found: return undefined
        return undefined;

    },


    /**
     * Description:         regroup several mesh under a node on one mesh
     * @method simplifyGeometry
     * @param {} object
     * @return
     */
    simplifyGeometry: function simplifyGeometry(object) {
        //Log.c("###AXT:: simplifyGeometry(), object="+object.name+", p=("+object.position.x+","+object.position.y+","+object.position.z+")");
        for (var i = 0; i < object.children.length; i++) {
            var pointMesh = object.children[i];
            if (pointMesh.children.length == 0 && pointMesh.name.substr(2, 5) == "Point") {
                object.remove(pointMesh);
                i = -1;
            } else if (pointMesh.name.substr(0, 5) != "Point") {
                var mesh = [];
                for (var j = 0; j < pointMesh.children.length; j++)
                    mesh.push(pointMesh.children[j]);
                for (var j = 0; j < mesh.length; j++) {
                    pointMesh.remove(mesh[j]);
                    mesh[j].position.addSelf(pointMesh.position);
                    mesh[j].scale.multiplySelf(pointMesh.scale);
                }
                object.remove(pointMesh);
                for (var j = 0; j < mesh.length; j++) {
                    object.add(mesh[j]);
                }
                i = -1;
            }
        }
    },

    /**
     * Extract the petals meshes from the collada description
     */
    extractPetalMeshes: function () {
        // Loop through the object contained in the collada model to extract
        // the mesh corresponding to the petals.
        for (var i = 0; i < this.model.children.length; i++) {
            var object = this.model.children[i];
            if (object instanceof THREE.Mesh) {
                var result = object.name.match(/couche([0-9]*)_([0-9]*)/);

                // result[1] contains the layer ID
                // result[2] contains the petal ID within the layer
                if (result != null) {
                    var layer = result[1] - 1; // Layer ID are 1-based in the collada, change it for 0-based.
                    if (this.petalMeshByLayer[layer] == undefined) {
                        this.petalMeshByLayer[layer] = [];
                    }

                    // For now, we don't care about ordering (petal ID is although in result[2])
                    this.petalMeshByLayer[layer].push(object);
                }
            }
        }
    },

    /**
     * Remove the lights from the scene (the one defined in the collada file)
     */
    removeLights: function () {
        for (var i = this.model.children.length - 1; i >= 0; i--) {
            var object = this.model.children[i];
            if (object instanceof THREE.PointLight) {
                this.model.remove(object);
            }
        }
    }
});