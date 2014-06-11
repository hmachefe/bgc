/**
 Description: Log management.
 Use this structure to activate/disable personal log
 @class Log
 **/

if (!Log) var Log = {
    logger: {
        /**
         Description:  flag used for LOG purpose by Axel Taldir
         @property axt
         @type boolean
         @default false
         **/
        axt: false,

        /**
         Description:  flag used for LOG purpose by Youssef Nouiara
         @property yn
         @type boolean
         @default false
         **/
        yn:  false,

        /**
         Description:  flag used for LOG purpose by YunYaw Chu
         @property yyc
         @type boolean
         @default false
         **/
        yyc: false,

        /**
         Description:  flag used for LOG purpose by Olivier Paris
         @property op
         @type boolean
         @default false
         **/
        op:  false,

        /**
         Description:  flag used for LOG purpose by Hugo MACHEFER
         @property hum
         @type boolean
         @default false
         **/
        hma: false,

        /**
         Description:  flag used for LOG purpose by Eric LEDUC
         @property hum
         @type boolean
         @default false
         **/
        ele: false
    }
};


(function () {

    /**
     * Description: base private function which decide if the application must display  the current text
     * @method show
     * @param {} document
     * @param {} pltType
     * @return
     */
    function show(m) {

        // Do not display log if not in debug mode
        if( !App_configuration.debug )
            return false;

        // Test if the log is for the authorized person
        if (Log.logger.axt && m.match(/###AXT/)) {
            return true;
        }
        else if (Log.logger.yn && m.match(/###YN/)) {
            return true;
        }
        else if (Log.logger.yyc && m.match(/>>>YY/)) {
            return true;
        }
        else if (Log.logger.op && m.match(/###OP/)) {
            return true;
        }
        else if (Log.logger.hma && m.match(/###HMA/)) {
            return true;
        }
        else if (Log.logger.rac && m.match(/###RAC/)) {
            return true;
        }
        else if (Log.logger.ele && m.match(/###ELE/)) {
            return true;
        }
        return false;
    };


    /**
     * Description: Display a message to the console (if show() return true), can
     *              be platform specific
     * @method c
     * @return
     */
    Log.c = function (m) {
        if (show(m)) {
            console.log(m);
        }
    };


    /**
     * Description: Display an alert
     * @method a
     * @return
     */
    Log.a = function (m) {
        if (show(m)) {
            alert(m);
        }
    };

    /**
     * Description: Dump the properties of an object
     * @method printObject
     * @return
     */
    Log.printObject = function (tag, object) {
        var output = tag + ' ' + JSON.stringify(object);
        Log.c(output);
    };

    /**
     * Description: print the stacktrace
     * @method printStackTrace
     * @return
     */
    Log.printStackTrace  = function () 
    {
        var callstack = [];
        var isCallstackPopulated = false;
        try {
            i.dont.exist+=0; //doesn't exist- that's the point
        } 
        catch(e) 
        {
            //console.log('e.stack='+e.stack);
            if (e.stack) { //Firefox
                var lines = e.stack.split('\n');
                for (var i=0, len=lines.length; i<len; i++) {
                    //if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
                    callstack.push(lines[i]);
                    //}
                }
                //Remove "i.dont.exist" error
                callstack.shift();
                //Remove call to printStackTrace()
                callstack.shift();
                isCallstackPopulated = true;
            }
            else if (window.opera && e.message) { //Opera
                var lines = e.message.split('\n');
                for (var i=0, len=lines.length; i<len; i++) {
                    if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
                        var entry = lines[i];
                        //Append next line also since it has the file info
                        if (lines[i+1]) {
                            entry += ' at ' + lines[i+1];
                            i++;
                        }
                        callstack.push(entry);
                    }
                }
                //Remove call to printStackTrace()
                callstack.shift();
                isCallstackPopulated = true;
            }
        }
        if (!isCallstackPopulated) { //IE and Safari
            var currentFunction = arguments.callee.caller;
            while (currentFunction) {
                var fn = currentFunction.toString();
                var fname = fn.substring(fn.indexOf('function') + 8, fn.indexOf('')) || 'anonymous';
                callstack.push(fname);
                currentFunction = currentFunction.caller;
            }
        }
        console.log('callstack=\n'+callstack.join('\n'));
    };

})();
