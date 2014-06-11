var idx_nav;
var uris;
var margin_top;
var list_uris=[];
var assetType = {
    UNKNOWN:"unknown",
    TV:"broadcast",
    ON_DEMAND:"vod",
    LIBRARY:"library"
};
var time_t0,time_t1=[];

function cb_global_duration(t1){
    var time_dt= 0;
    var cb=null;

    t1 = Date.now();
    time_dt = t1 - time_t0;
    cb = document.getElementById('cb_duration');
    cb.innerHTML = time_dt+' ms';
}

function cb_local_duration(t2,id,idx){
    var time_dt= 0;
    var cb=null;

    t2 = Date.now();
    time_dt = t2 - time_t1[idx];
    cb = document.getElementById(id);
    cb.innerHTML = cb.outerText.split(":")[0]+': '+time_dt+' ms';
}

function display_profile(requestId, asset, callId){
    var node = document.getElementById('asset');
    var html="";
    var t1=Date.now();

    //display cd duration
    cb_global_duration(t1);

    html += '<div style="margin-top: 10px;">'+
        '<h2 style="font-size: 20px;margin-left: 15px;margin-bottom: 5px;">Current profile : </h2>'+
        '<div id="text" style="border: 3px yellow groove;background-color:rgb('+asset.userColor+');display: inline-block;margin-left: 15px;font-size: 20px;line-height: 26px;padding-right: 5px;padding-left: 5px;margin-bottom: 40px;">'+
        'User Id : '+asset.userId+' </br>'+
        'user Name : '+asset.userName+' </br>'+
        'user Color : '+asset.userColor+' </br>'+
        '</div>'+
        '</div>';
    node.innerHTML = html;
}

function display_tv(requestId, asset, callId){
    var node = document.getElementById('asset');
    var html="", service, content;
    var channelId, channelName, channelNumber, channelLogo, source, startTime, endTime, time;
    var t1 = Date.now();

    //display cd duration
    cb_global_duration(t1);

    service = asset.services[0].service;
    content = asset.services[0].contents[0];

    channelId = service.channelId;
    channelName = service.channelName;
    channelNumber = service.channelNumber;
    channelLogo = service.channelLogo;
    source = service.source;

    time = new Date(content.startTime);
    startTime = time.toLocaleTimeString()+' ('+time.toLocaleDateString()+')';
    endTime = new Date(content.endTime);
    time = new Date(content.endTime);
    endTime = time.toLocaleTimeString()+' ('+time.toLocaleDateString()+')';

    html += '<div style="border: 3px yellow groove; margin-top: 10px;background-color:rgba(255,255,0,0.5);height: 500px;">'+
        '<div id="text" style="display: inline-block;margin-left: 15px;font-size: 20px;line-height: 26px;padding-right: 5px">'+
        'channelId : '+channelId+' </br>'+
        'channelName : '+channelName+' </br>'+
        'channelNumber : '+channelNumber+' </br>'+
        'startTime : '+startTime+' </br>'+
        'endTime : '+endTime+' </br>'+
        'channelLogo : <img src="'+channelLogo+'"/> </br>'+
        'source : '+source+
        '</div>'+
        '</div>';
    node.innerHTML = html;
}

function loadSmallImg(requestId, image, callId) {
    var oDiv,oImg;
    var t2=Date.now();

    if(image){
        oImg=document.getElementById("small_img_"+requestId);
        oImg.setAttribute('src', image.image);
        oDiv=document.getElementById("small_color_img_"+requestId);
        oDiv.innerHTML = "<p style='text-align: center'>Small</p>";
        oDiv.setAttribute('style','display:inline-block; width:50px; height:50px; position: absolute;margin-top: 5px;border: 3px yellow groove;background-color:rgb(' + image.color+')');
        oDiv=document.getElementById("small_color_txt_"+requestId);
        oDiv.outerText = oDiv.outerText.replace(":",': '+image.color);

        //display cb duration
        cb_local_duration(t2,"cb_duration_small_"+requestId,requestId);
    }else{
        console.log("===> image : UNDEFINED !!!  <=> BUG ");
    }
}

function loadLargeImg(requestId, image, callId) {
    var oDiv,oImg;
    var t2=Date.now();
    if(image){
        oImg=document.getElementById("large_img_"+requestId);
        oImg.setAttribute('src', image.image);
        oDiv=document.getElementById("large_color_img_"+requestId);
        oDiv.innerHTML = "<p style='text-align: center'>Large</p>";
        oDiv.setAttribute('style','display:inline-block; width:50px; height:50px; position: absolute;margin-top: 5px;border: 3px yellow groove;margin-left: 65px;background-color:rgb(' + image.color+')');
        oDiv=document.getElementById("large_color_txt_"+requestId);
        oDiv.outerText = oDiv.outerText.replace(":",': '+image.color);

        //display cb duration
        cb_local_duration(t2,"cb_duration_large_"+requestId,requestId);
    }else{
        console.log("===> image : UNDEFINED !!!  <=> BUG ");
    }
}

function failureCbSmallImg(requestId, error, callId) {
    console.log("--> SMALL image loading failed !!");
    oDiv=document.getElementById("small_color_txt_"+requestId);
    oDiv.innerHTML = 'colorimetry small img : <strong style="color:red"">none</strong></br>';
}

function failureCbLargeImg(requestId, error, callId) {
    console.log("--> LARGE image loading failed !!");
    oDiv=document.getElementById("large_color_txt_"+requestId);
    oDiv.innerHTML = 'colorimetry large img : <strong style="color:red"">none</strong></br>';
}

function loadImage(url,width,height,callId,successCb,failureCb){
    time_t1[callId] = Date.now();
    callId = ADSA.read({
        requestId: callId,
        source: "data://cisco/adele/utils/image",
        params: {URL: url, WIDTH: width, HEIGHT: height},

        successCallback: successCb,
        failureCallback: failureCb
    });
}

function vod_format(content,idx){
    var domHTML;
    var assetId_dots = (content.assetId.length < 24)?"":"...";
    var title_dots = (content.title.length < 24)?"":"...";
    var summary_dots = (content.summary.length < 30)?"":"...";
    var actors_dots = (content.actors.length < 30)?"":"...";
    var subtitle_dots = (content.subtitleList.length < 30)?"":"...";
    var directors_dots = (content.directors.length < 30)?"":"...";
    var audioList_dots = (content.audioList.length < 30)?"":"...";
    var url_dots = (content.url.length < 50)?"":"...";
    var time = new Date(content.startTime);
    var startTime = time.toLocaleTimeString()+' ('+time.toLocaleDateString()+')';
    var endTime = new Date(content.endTime);
    time = new Date(content.endTime);
    endTime = time.toLocaleTimeString()+' ('+time.toLocaleDateString()+')';

    domHTML =   '<div style="border: 3px yellow groove; margin-top: 10px;background-color:rgba(255,255,0,0.2);height: 238px;">'+
                    '<div id="small_color_img_'+idx+'"></div>'+
                    '<div id="large_color_img_'+idx+'"></div>'+
                    '<div id="small_border" style="border: 3px yellow groove;width: 82px; height: 110px; display: inline-block;overflow: hidden">'+
                        '<img id="small_img_'+idx+'"/>'+
                    '</div>'+
                    '<div id="large_thumbnail" style="border: 3px yellow groove;width: 152px; height: 202px; display: inline-block;overflow: hidden;margin-top: 6px;margin-left: 50px;">'+
                        '<img id="large_img_'+idx+'"/>'+
                    '</div>'+
                    '<div id="text" style="display: inline-block;margin-left: 15px;font-size: 15px;line-height: 19px;padding-right: 5px;border-right: 3px yellow groove;">'+
                        'assetId : '+content.assetId.substr(0,24)+assetId_dots+' </br>'+
                        'assetType : '+content.assetType+' </br>'+
                        'title : '+content.title.substr(0,24)+title_dots+' </br>'+
                        '<span id="small_color_txt_'+idx+'" >colorimetry small img :  </br></span>'+
                        '<span id="large_color_txt_'+idx+'" >colorimetry large img :  </br></span>'+
                        'duration : '+content.duration+' </br>'+
                        'rating : '+content.rating+' </br>'+
                        'videoFormat : '+content.videoFormat+' </br>'+
                        'audioList : '+content.audioList.toString().substr(0,30)+audioList_dots+' </br>'+
                        'subtitleList : '+content.subtitleList.toString().substr(0,30)+subtitle_dots+' </br>'+
                        'summary : '+content.summary.substr(0,30)+summary_dots+
                    '</div>'+
                    '<div id="text" style="display: inline-block;margin-left: 15px;font-size: 15px;line-height: 19px;">'+
                        'actors : '+content.actors.toString().substr(0,30)+actors_dots+'</br>'+
                        'genre : '+content.genre+' </br>'+
                        'moods : '+content.moods+' </br>'+
                        'plots : '+content.plots+' </br>'+
                        'match : '+content.match+' </br>'+
                        'rate : '+content.rate+' </br>'+
                        'directors : '+content.directors.toString().substr(0,30)+directors_dots+'</br>'+
                        'price : '+content.price+'$ </br>'+
                        'url : '+content.url.toString().substr(0,50)+url_dots+'</br></br></br>'+
                    '</div>'+
                    '<div id="cb_duration_small_'+idx+'"> CB duration : 0 ms</div>'+
                    '<div id="cb_duration_large_'+idx+'" style="position: absolute;margin-top: -16px;margin-left: 155px;">CB duration : 0 ms</div>'+
                '</div>';
    return domHTML;
}

function broadcast_format(content,idx){
    var domHTML;
    var assetId_dots = (content.assetId.length < 24)?"":"...";
    var title_dots = (content.title.length < 24)?"":"...";
    var summary_dots = (content.summary.length < 30)?"":"...";
    var actors_dots = (content.actors.length < 30)?"":"...";
    var subtitle_dots = (content.subtitleList.length < 30)?"":"...";
    var directors_dots = (content.directors.length < 30)?"":"...";
    var audioList_dots = (content.audioList.length < 30)?"":"...";
    var logo_dots = (content.channelLogo.length < 30)?"":"...";
    var time = new Date(content.startTime);
    var startTime = time.toLocaleTimeString()+' ('+time.toLocaleDateString()+')';
    var endTime = new Date(content.endTime);
    time = new Date(content.endTime);
    endTime = time.toLocaleTimeString()+' ('+time.toLocaleDateString()+')';

    domHTML =   '<div style="border: 3px yellow groove; margin-top: 10px;background-color:rgba(255,255,0,0.2);height: 275px;">'+
                    '<div id="small_color_img_'+idx+'"></div>'+
                    '<div id="large_color_img_'+idx+'"></div>'+
                    '<div id="small_border" style="border: 3px red groove;display: inline-block;width: 196px; height: 110px; overflow: hidden">'+
                        '<img id="small_img_'+idx+'"/>'+
                    '</div>'+
                    '<div id="large_thumbnail" style="border: 3px red groove;width: 320px; height: 180px; display: inline-block;overflow: hidden;margin-left: 10px;margin-top: 6px">'+
                        '<img id="large_img_'+idx+'"/>'+
                    '</div>'+
                    '<div id="text" style="display: inline-block;margin-left: 15px;font-size: 15px;line-height: 19px;padding-right: 5px;border-right: 3px yellow groove;">'+
                        'assetId : '+content.assetId.substr(0,24)+assetId_dots+' </br>'+
                        'assetType : '+content.assetType+' </br>'+
                        'title : '+content.title.substr(0,24)+title_dots+' </br>'+
                        '<span id="small_color_txt_'+idx+'" >colorimetry small img :  </br></span>'+
                        '<span id="large_color_txt_'+idx+'" >colorimetry large img :  </br></span>'+
                        'duration : '+content.duration+' </br>'+
                        'rating : '+content.rating+' </br>'+
                        'videoFormat : '+content.videoFormat+' </br>'+
                        'audioList : '+content.audioList.toString().substr(0,30)+audioList_dots+' </br>'+
                        'subtitleList : '+content.subtitleList.toString().substr(0,30)+subtitle_dots+' </br>'+
                        'summary : '+content.summary.substr(0,30)+summary_dots+' </br>'+
                        'actors : '+content.actors.toString().substr(0,30)+actors_dots+' </br>'+
                        'genre : '+content.genre+
                    '</div>'+
                    '<div id="text" style="display: inline-block;margin-left: 15px;font-size: 15px;line-height: 19px;margin-top: 7px;">'+
                        'moods : '+content.moods+' </br>'+
                        'plots : '+content.plots+' </br>'+
                        'match : '+content.match+' </br>'+
                        'rate : '+content.rate+' </br>'+
                        'directors : '+content.directors.toString().substr(0,30)+directors_dots+'</br>'+
                        'startTime : '+startTime+' </br>'+
                        'endTime : '+endTime+' </br>'+
                        'channelId : '+content.channelId+' </br>'+
                        'channelName : '+content.channelName+' </br>'+
                        'channelNumber : '+content.channelNumber+' </br>'+
                        'channelLogo : '+content.channelLogo.substr(0,24)+logo_dots+' </br>'+
                        'source : '+content.source+' </br></br>'+
                    '</div>'+
                    '<div id="cb_duration_small_'+idx+'" style="margin-left: 35px;"> CB duration : 0 ms</div>'+
                    '<div id="cb_duration_large_'+idx+'" style="position: absolute;margin-top: -16px;margin-left: 325px;">CB duration : 0 ms</div>'+
                '</div>';
    return domHTML;
}

function display_assets(requestId, asset, callId){
    var node = document.getElementById('asset');
    var t1 = Date.now();
    node.innerHTML = "";

    //display cd duration
    cb_global_duration(t1);

    for (var i =0; i<asset.contents.length; i++ ){
        if(assetType.ON_DEMAND === asset.contents[i].assetType){
            node.innerHTML += vod_format(asset.contents[i],i);
        }else if (assetType.TV === asset.contents[i].assetType){
            node.innerHTML += broadcast_format(asset.contents[i],i);
        }else {
            console.log(" =====> ASSET TYPE = '+ asset.contents[i].assetType +' <====")
        }
    }

    //load all img and colorimetry
    for (var i =0; i<asset.contents.length; i++ ){
        var content = asset.contents[i];
        if(assetType.ON_DEMAND === content.assetType){
            loadImage(content.smallThumbnail,82,110,i,loadSmallImg,failureCbSmallImg);
            loadImage(content.largeThumbnail,152,202,i,loadLargeImg,failureCbLargeImg);
        }else if (assetType.TV === content.assetType){
            loadImage(content.smallThumbnail,196,110,i,loadSmallImg,failureCbSmallImg);
            loadImage(content.largeThumbnail,320,180,i,loadLargeImg,failureCbLargeImg);
        }else {
            console.log(" =====> ASSET TYPE = '+ asset.contents[i].assetType +' <====")
        }
    }
}

function display(){
    var callId;
    var options = {};

    options.params = {COUNT: 5};
    options.uri = uris.querySelector('#'+list_uris[idx_nav]).textContent;
    options.failureCallback = function(requestId, error, callId) {
        console.log("read failed : requestId = "+requestId+", error = "+error+", callId = "+callId);
    }

    if(list_uris[idx_nav] === "profile"){
        options.successCallback = display_profile;

    }else if((list_uris[idx_nav] === "social")||
        (list_uris[idx_nav] === "onDemand")||
        (list_uris[idx_nav] === "library")||
        (list_uris[idx_nav] === "reco")||
        (list_uris[idx_nav] === "music")||
        (list_uris[idx_nav] === "football")){
        options.successCallback = display_assets;

    }else if(list_uris[idx_nav] === "tv"){
        options.successCallback = display_tv;
    }

    time_t0 = Date.now();
    ADSA_IMPL.openWebsocket(window.profileData[0].serviceLayerUrl);
    callId = ADSA.read({
        requestId: Date.now(),
        source: options.uri,
        params: options.params,
        successCallback: options.successCallback,
        failureCallback: options.failureCallback});
}

function nav (dir){
    var STEP = 24;
    var MAX_URI = 8;
    if((dir < 0) && (idx_nav < (MAX_URI-1))){ //up
        idx_nav++;
        margin_top -= STEP ;
    }else if((dir > 0) && (idx_nav > 0)){ //down
        idx_nav--;
        margin_top += STEP;
    }
    uris.style.marginTop = margin_top + 'px';
}

function keyEvent (e) {
//    console.log('KEY CODE : '+e.keyCode)
    switch(e.keyCode){
        case 39: //right <=> down
            nav(-1);
            break;

        case 37: //left <=> up
            nav(1);
            break;

        case 13: //enter
            display();
            break;

        case 48: //KEY_0 <=> menu
            location.assign("index.html")
            break;

        case 52: //KEY_4 <=> previous
            location.assign("adele_flower.html")
            break;

        case 54: //KEY_6 <=> next
            location.assign("grid.html")
            break;
    };
}

window.onload = function(){
    document.addEventListener("keydown",keyEvent,false);
    uris = document.getElementById('select');
    uris.style.marginTop = "0px";
    margin_top = 0;
    idx_nav = time_t0 = 0;
    list_uris = ["profile","social","tv","onDemand","library","reco","music","football"];
}