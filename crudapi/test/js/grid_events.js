var assetType = {
    UNKNOWN:"unknow",
    TV:"broadcast",
    ON_DEMAND:"vod",
    LIBRARY:"library"
};


function cb_local_duration(t2,id, idx){
    var time_dt= 0;
    var cb=null;

    t2 = Date.now();
    time_dt = t2 - time_t1[idx];
    cb = document.getElementById(id);
    cb.innerHTML = cb.outerText.split(":")[0]+': '+time_dt+' ms';
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
    var time = new Date(content.startTime);
    var startTime = time.toLocaleTimeString()+' ('+time.toLocaleDateString()+')';
    var endTime = new Date(content.endTime);
    time = new Date(content.endTime);
    endTime = time.toLocaleTimeString()+' ('+time.toLocaleDateString()+')';

    domHTML =   '<div class="events" style="border: 3px yellow groove; margin-top: 10px;background-color:rgba(255,255,0,0.2);height: 238px;">'+
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
                        'startTime : '+startTime+' </br>'+
                        'endTime : '+endTime+' </br>'+
                        'price : <strong style="color: red">none</strong> </br>'+
                        'url : <strong style="color: red">none</strong>  </br>'+
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
    var time = new Date(content.startTime);
    var startTime = time.toLocaleTimeString()+' ('+time.toLocaleDateString()+')';
    var endTime = new Date(content.endTime);
    time = new Date(content.endTime);
    endTime = time.toLocaleTimeString()+' ('+time.toLocaleDateString()+')';

    domHTML =   '<div style="border: 3px yellow groove; margin-top: 10px;background-color:rgba(255,255,0,0.2);height: 218px;">'+
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
                        'subtitleList : '+content.subtitleList.toString().substr(0,30)+subtitle_dots+
                        '</div>'+
                    '<div id="text" style="display: inline-block;margin-left: 15px;font-size: 15px;line-height: 19px;">'+
                        'summary : '+content.summary.substr(0,30)+summary_dots+' </br>'+
                        'actors : '+content.actors.toString().substr(0,30)+actors_dots+'</br>'+
                        'genre : '+content.genre+' </br>'+
                        'moods : '+content.moods+' </br>'+
                        'plots : '+content.plots+' </br>'+
                        'match : '+content.match+' </br>'+
                        'rate : '+content.rate+' </br>'+
                        'directors : '+content.directors.toString().substr(0,30)+directors_dots+'</br>'+
                        'startTime : '+startTime+' </br>'+
                        'endTime : '+endTime+' </br>'+
                    '</div>'+
                    '<div id="cb_duration_small_'+idx+'" style="margin-left: 35px;"> CB duration : 0 ms</div>'+
                    '<div id="cb_duration_large_'+idx+'" style="position: absolute;margin-top: -16px;margin-left: 325px;">CB duration : 0 ms</div>'+
        '</div>';
    return domHTML;
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

function display_events(contents){
    var node = document.getElementById('asset');
    node.style.display="none"

    node = document.getElementById('events');

    for (var i =0; i<contents.length; i++ ){
        if(assetType.ON_DEMAND === contents[i].assetType){
            node.innerHTML += vod_format(contents[i],i);
        }else if (assetType.TV === contents[i].assetType){
            node.innerHTML += broadcast_format(contents[i],i);
        }else {
            console.log(" =====> ASSET TYPE = '+ contents[i].assetType +' <====")
        }
    }

    //load all img and colorimetry
    for (var i =0; i<contents.length; i++ ){
        var content = contents[i];
        if(assetType.ON_DEMAND === content.assetType){
            loadImage(content.smallThumbnail,82,110,i,loadSmallImg,failureCbSmallImg);
            loadImage(content.largeThumbnail,152,202,i,loadLargeImg,failureCbLargeImg);
        }else if (assetType.TV === content.assetType){
            loadImage(content.smallThumbnail,196,110,i,loadSmallImg,failureCbSmallImg);
            loadImage(content.largeThumbnail,320,180,i,loadLargeImg,failureCbLargeImg);
        }else {
            console.log(" =====> ASSET TYPE = '+ contents[i].assetType +' <====")
        }
    }
}

function remove_events(){
    var node = document.getElementById('events');
    node.innerHTML = '';

    node = document.getElementById('asset');
    node.style.display="block";
}





