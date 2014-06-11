var nb_events,nb_channels,events=[];
var idx_nav,idx_evts;
var toggle_events,time_range;
var time_t0,time_t1=[];

function cb_duration(t1,id){
    var time_dt= 0;
    var cb=null;

    t1 = Date.now();
    time_dt = t1 - time_t0;
    cb = document.getElementById(id);
    cb.innerHTML = time_dt+' ms';
}

function display_channels(requestId, asset, callId){
    var node = document.getElementById('asset');
    var html="";
    var channel;
    var focused;
    var time, currentTime;
    var service_len = nb_channels= asset.services.length;
    var t1=Date.now();

    //display cd duration
    cb_duration(t1,'cb_duration');

    channel = document.getElementById('total');
    channel.innerHTML = 'returned : ' + asset.total;
    nb_events = asset.total;

    channel = document.getElementById('remain');
    channel.innerHTML = 'remained : ' + asset.remaining;

    time = new Date();
    currentTime = time.toLocaleTimeString()+' ('+time.toLocaleDateString()+')';
    channel = document.getElementById('currentTime');
    channel.innerHTML = ' curTime : ' + currentTime;

    channel = document.getElementById('rangeTime');
    channel.innerHTML = ' rangeTime : '+time_range +'h';

    for(var i=0; i<service_len; i++){
        var service = asset.services[i].service;
        var content_len = asset.services[i].contents.length;
        focused = (i===0)?'focused':'unfocused';
        events[i]=asset.services[i].contents;

        html += '<div class="channels '+focused+'" style="margin-top: 10px;background-color:rgba(255,255,0,0.5);height: 150px;">'+
                    '<div id="text" style="display: inline-block;margin-left: 15px;font-size: 20px;line-height: 26px;padding-right: 30px;border-right: 3px yellow groove;">'+
                        'channelId : '+service.channelId+' </br>'+
                        'channelName : '+service.channelName+' </br>'+
                        'channelNumber : '+service.channelNumber+' </br>'+
                    '</div>'+
                    '<div id="text" style="display: inline-block;margin-left: 45px;font-size: 20px;line-height: 19px;">'+
                        'channelLogo : <img src="'+service.channelLogo+'" style="margin-top: 10px"/> </br>'+
                        'source : '+service.source+'</br>'+
                        '<strong style="color: #ffd700">number of events : '+content_len+'</strong>'+
                    '</div>'+
                '</div>';
    }

    node.innerHTML = html;
}

function init(){
    var callId;
    var options = {}, params = {};
    var start_time = Date.now();
    var end_time = start_time + time_range * 60 * 60 * 1000; //start + 3h

    params = {
        COUNT: 40,
        DATETIME_START: start_time,
        DATETIME_END: end_time
    };

    options.uri = 'data://cisco/adele/tv/timeline';
    options.params = params;
    options.successCallback = display_channels;
    options.failureCallback = function(requestId, error, callId) {
        console.log("read failed : requestId = "+requestId+", error = "+error+", callId = "+callId);
    }

    time_t0 = Date.now();

    ADSA_IMPL.openWebsocket(window.profileData[0].serviceLayerUrl);
    callId = ADSA.read({
        params: options.params,
        successCallback: options.successCallback,
        requestId: 1,
        source: options.uri,
        failureCallback: options.failureCallback});
}

function nav (dir){
    var MAX = nb_channels;
    var node = document.getElementsByClassName('channels');
    if((dir < 0) && (idx_nav > 0)){ //up
        node[idx_nav].classList.remove("focused");
        node[idx_nav].classList.add("unfocused");
        idx_nav--;
        node[idx_nav].classList.remove("unfocused");
        node[idx_nav].classList.add("focused");
    }else if((dir > 0) && (idx_nav < MAX)){ //down
        node[idx_nav].classList.remove("focused");
        node[idx_nav].classList.add("unfocused");
        idx_nav++;
        node[idx_nav].classList.remove("unfocused");
        node[idx_nav].classList.add("focused");
    }
}

function toggle_display(){
    if(toggle_events){
        display_events(events[idx_nav],idx_nav);
        toggle_events = false;
    }else{
        remove_events();
        toggle_events = true;
    }

}

function keyEvent (e) {
//    console.log('KEY CODE : '+e.keyCode)
	switch(e.keyCode){
        case 48: //KEY_0 <=> menu
            location.assign("index.html")
        break;

        case 52: //KEY_4 <=> previous
            location.assign("hub.html")
        break;

        case 54: //KEY_6 <=> next
            location.assign("linear_broadcast.html")
        break;

        case 37: //KEY_8 <=> down
            nav(-1);
        break;

        case 39: //KEY_2 <=> up
            nav(1);
        break;

        case 13: //enter
            toggle_display();
        break;
	};
}

window.onload = function(){
	document.removeEventListener("keydown",keyEvent,false);
	document.addEventListener("keydown",keyEvent,false);

    nb_events=nb_channels=idx_nav=idx_evts=0;
    toggle_events = true;
    time_range = 12;

    time_t0 = 0;

    setTimeout(init,1000);
}