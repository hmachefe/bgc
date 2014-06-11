ADSA = {
	successCallback: function(r) {
//    	console.log("SUCCESS:", r);
	},

	failureCallback: function(e) {
//    	console.log("ERROR:", e);
	},
	
	shallow_copy: function(source) {
	    var dest = {};
        if (source) {
            for (var property in source) {
                if (source.hasOwnProperty(property)) {
                    dest[property] = source[property];
                }
            }
        }
        return dest;
    },

    create : function(params) {
        return ADSA_IMPL.create(params);
    },
    
    read : function(params) {
        return ADSA_IMPL.read(params);
    },
    
    update : function(params) {
        return ADSA_IMPL.update(params);
    },
    
    delete : function(params) {
        return ADSA_IMPL.delete(params);
    }
};

