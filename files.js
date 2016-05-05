var request = require('request'),
    url = require('url');


function files(config) {
    this.config = config;
    this.defaultRequest = request.defaults({
        'auth': {
            'bearer': config.token,
        },
        'baseUrl': url.resolve(config.servicesUrl + '/','generated-files')
    });
}


files.prototype.get = function(fileId,cb) {    
    this.defaultRequest.get(encodeURIComponent(fileId),function(error,response,body) {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body);
            return cb(null,data);
        }        
        else
            return cb(error || new Error('bad response'),response);
    })   
}

/*
    Can pass parameters to limit the returned list:
    
    {
        in: [....], // a list of job ids
        dateRangeFrom: , // use dateRangeFrom and dataRangeTo define range limits. use dates, lower resolution may be ignored
        dataRangeTo:  
    }
*/
files.prototype.list = function(parameters,cb) {
    
    if(typeof parameters == 'function') {
        cb = parameters;
        parameters = null;
    }
    parameters = parameters || {};
    
    this.defaultRequest.get({ 
            qs: parameters,
            uri: ''
        },function(error,response,body) {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body);
            return cb(null,data);
        }        
        else
            return cb(error || new Error('bad response'),response);
    });  
}

files.prototype.delete = function(fileId,cb) {    
    this.defaultRequest.delete(encodeURIComponent(fileId),function(error,response,body) {
        if (!error && response.statusCode == 204) {
            return cb(null);
        }        
        else
            return cb(error || new Error('bad response'),response);
    })   
}

files.prototype.download = function(fileId,cb) {    
    cb(this.defaultRequest.get(encodeURIComponent(fileId) + '/download'));
}

module.exports = function(config){return new files(config)};