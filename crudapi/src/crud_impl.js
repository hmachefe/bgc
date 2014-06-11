
var JNB = {
    //public, actually implement the API
    create : function(params) {
        return this.callNative("create", params);
    },

    read : function(params) {
        var errorCallback;

        // If the websocket is closed, directly raise failure callback
        if (this.ws == null) {
            errorCallback = params.failureCallback || this.emptyCallback;
            errorCallback(params.requestId, 'WebSocket closed', -1);
            return (null);
        }
        else {
            return (this.callNative("read", params));
        }
    },

    update : function(params) {
        return this.callNative("update", params);
    },

    delete : function(params) {
        return this.callNative("delete", params);
    },

    //private
    log : function(text) {
        var div_log = document.getElementById("log");
        if (div_log) {
            div_log.innerHTML = (new Date).getTime() + ": " + (text ? (unescape(text) + "<br>") : "<br>") + div_log.innerHTML;
        }
        console.log((new Date).getTime() + ": " + (text ? unescape(text) : ""));
    },

    callNative : function(crud, params) {
        var requestId = params.requestId;
        var domainMethodCrud = (params.source.substr(this.sourcePrefix.length, params.source.length) + "/" + crud);
        var requestParams = params.params || this.emptyObject;
        var onSuccess = params.successCallback || this.emptyCallback;
        var onError = params.failureCallback || this.emptyCallback;

        // Check if the ws is open and available before go too far
        if (this.ws.readyState != 1) {
            // If the readyState is not OPEN, raise an error (see http://www.w3.org/TR/2011/WD-websockets-20110419/#the-websocket-interface)
            this.REQUEST_QUEUE.push({crud : crud, param : params});
            return;
        }

        var messageId = this.rpcMessageId++;
        var message = this.buildRPCMessage(messageId, domainMethodCrud, requestParams);

        this.rpcMessageQueue[messageId] = {requestId: requestId, message: message, onSuccess : onSuccess, onError : onError};

//        console.log("call native: " + domainMethodCrud + "(" + JSON.stringify(message.params) +")");
        this.sendRequest(message);

        return messageId;
    },

    buildRPCMessage : function(messageId, method, params) {
        params = this.flattenParams(params);

        return {jsonrpc: "2.0", id: messageId, method: method, params: params};
    },

    flattenParams : function(params) {
        var flatParams = {};
        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                var value = params[key];
                if (value) {
                    if (typeof value === 'object') {
                        flatParams[key] = JSON.stringify(value);
                    } else {
                        flatParams[key] = value;
                    }
                }
            }
        }
        return flatParams;
    },

    emptyCallback : function(x) {},
    emptyObject : Object.freeze({}),

    sourcePrefix : "data://cisco/adele/",

    rpcMessageId : 1,
    rpcMessageQueue : {},
    notificationListeners : {},

    mergeMixedEvents : function(mixedEvents) {
        var services = null, contents = null, asset = {};

        if (mixedEvents && (mixedEvents.services)) {
            services = mixedEvents.services;
            contents = mixedEvents.contents;
            if(contents){
                for (var i = 0, m = services.length; i < m; i++) {
                    var channel = services[i].service;
                    var events = services[i].contents;

                    for (var j = 0, n = events.length; j < n; j++) {
                        var event = events[j];
                        // Merge channel into event
                        $.extend(event,channel);
                        contents.push(event);
                    }
                }
                asset.contents = contents;
            }else{
                asset = mixedEvents;
            }

        }else{
            asset = mixedEvents;
        }

        return asset;
    },


// Called from service
    onResponse : function(rpcResponse) {
// 	    console.log("Got response: " + JSON.stringify(rpcResponse));
        var messageId = rpcResponse.id;
        var result = this.mergeMixedEvents(rpcResponse.result);
        var error = rpcResponse.error;

        var message = this.rpcMessageQueue[messageId];
        var callback = error ? message.onError : message.onSuccess;

        try {
            callback(message.requestId, result ? result : error, messageId);
        } finally {
            delete this.rpcMessageQueue[messageId];
        }
    },

    onNotification : function(rpcNotification) {
//      console.log("Got notification: " + JSON.stringify(rpcNotification));
        var name = rpcNotification.method;
        var params = rpcNotification.params;

        var listeners = notificationListeners[name];
        for (var i=0, len=listeners.length; i<len; i++) {
            try {
                listeners[i](name, params);
            } catch (e) {

            }
        }
    },

    addImpl : function(extra) {
        this.extendObject(this, extra);
    },

    extendObject : function(destination, source) {
        if (source) {
            for (var property in source) {
                if (source.hasOwnProperty(property)) {
                    destination[property] = source[property];
                }
            }
        }
        return destination;
    }
};

// WebSockets
JNB.addImpl({
    start : function() {
        var	searchPos, queryString, queryElements, profileData = [], i,
            profileElement, singleQueryElements, profile,
            hardcodedProfileData = [{ // Default server addresses and ports provided by @celamber
                'profileIndex': 0,
                'serviceLayerUrl': '172.21.119.28:8893'
            },
                {
                    'profileIndex': 1,
                    'serviceLayerUrl': '172.21.119.28:8891'
                }];

        ;

        //extract the relevant information
        searchPos = window.location.search.toLowerCase().indexOf('?');
        if (searchPos >= 0) {
            queryString = window.location.search.toLowerCase().substr(searchPos + 1);
            queryElements = queryString.split('&');
            for (i = 0; i < queryElements.length; i += 1) {
                singleQueryElements = queryElements[i].split('=');
                //specific case: a websocket address is defined for a given profile
                //wsaddressprofileN=address with N being the index of the profile
                if (singleQueryElements[0].indexOf('wsaddressprofile') >= 0) {
                    profileElement= {};
                    profileElement.profileIndex =
                        singleQueryElements[0].substr(singleQueryElements[0].lastIndexOf('e') + 1);
                    profileElement.serviceLayerUrl = singleQueryElements[1];
                    profileData.push(profileElement);
                }
            }
        }

        //profile information gathered from url? Store it. If not, use the hardcoded ones
        if (profileData.length > 0) {
            window.profileData = profileData;
        } else {
            //If profileData array has not been filled up, it means that an incorrect query, or no query, was provided
//           console.log('[ADSA_IMPL] %c[SPECIFIED_ADDRESS]%c Incorrect query or no query provided, fallback to hardcoded service layer urls]', 'color: #e67e22;', 'color: black;', 'color: #2980b9;');
            window.profileData = hardcodedProfileData;
        }
        //      console.log('[ADSA_IMPL] %c[SPECIFIED_ADDRESS]%c Connecting websocket (for initial active profile) on %c[' + wsAddress + ']', 'color: #e67e22;', 'color: black;', 'color: #2980b9;');
    },

    stop : function() {
        this.ws = null;
    },

    createWebsocket: function (wsAddress) {
        this.ws = new WebSocket('ws://' + wsAddress);

        this.ws.onopen = function() {
//            console.log("JNB: websocket open");
            JNB.processQueue();
        };

        this.ws.onmessage = function(message) {
            //JNB.log(message.data);
            var msg = JSON.parse(message.data);
            if (msg.id) {
                JNB.onResponse(msg);
            } else {
                JNB.onNotification(msg);
            }
        };

        this.ws.onerror = function() {
            var i;

//            JNB.log("JNB: websocket error");
        };

        this.ws.onclose = function() {
//            JNB.log("JNB: websocket close");

            for (i = 0; i < JNB.REQUEST_QUEUE.length; i += 1) {
                JNB.REQUEST_QUEUE[i].param.failureCallback(JNB.REQUEST_QUEUE[i].param.requestId, 'WebSocket not open !', -1);
            }

            // Close the ws by setting null object
            JNB.ws = null;
        };

    },

    openWebsocket: function (socketUrl) {
        this.createWebsocket(socketUrl);
    },

    sendRequest : function(rpcRequest) {
        this.ws.send(JSON.stringify(rpcRequest));
    },

    ws : null,
    checkConnect : function() {
        if (this.ws) {
            return true;
        }

        return false;
    },

    REQUEST_QUEUE : [],

    processQueue : function () {
        var request, i;
        for (i = 0; i < this.REQUEST_QUEUE.length; i += 1) {
            request = this.REQUEST_QUEUE[i];
            switch (request.crud) {
                case "read":
                    JNB.read(request.param);
                    break;
                case "update":
                    JNB.update(request.param);
                    break;
                case "delete":
                    JNB.del(request.param);
                    break;
                default:
//                    console.log("ERROR: Unknown crud method %s", request.crud);
                    break;
            }
        }
        this.REQUEST_QUEUE = [];
    }
});

JNB.start();

ADSA_IMPL=JNB;
