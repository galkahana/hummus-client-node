var request = require('request'),
    files = require('./files'),
    url = require('url');

var JobStatusConstants  = {
    eJobDone : 0,
    eJobInProgress : 1,
    eJobFailed : 2    
};


function jobs(config) {
    this.config = config;
    this.defaultRequest = request.defaults({
        'auth': {
            'bearer': config.token,
        },
        'baseUrl': url.resolve(config.servicesUrl + '/','generation-jobs')
    });
    this.statuses = JobStatusConstants;
}


jobs.prototype.get = function(jobId,cb) {    
    this.defaultRequest.get(encodeURIComponent(jobId),function(error,response,body) {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body);
            return cb(null,data);
        }        
        else
            return cb(error || new Error('bad response'),response);
    });  
}

jobs.prototype.create = function(jobTicket,cb) {
    this.defaultRequest.post({ 
            body: jobTicket,
            uri: '',
            json: true
        },function(error,response,body) {
        if (!error && response.statusCode == 200) {
            var data = body;
            return cb(null,data);
        }        
        else
            return cb(error || new Error('bad response'),response);
    });     
}

/*
    Can pass parameters to limit the returned list:
    
    {
        in: [....], // a list of job ids
        searchTerm: '', // a term to look in the job labels
        dateRangeFrom: , // use dateRangeFrom and dataRangeTo define range limits. use dates, lower resolution may be ignored
        dataRangeTo:  
    }
*/
jobs.prototype.list = function(parameters,cb) {
    
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

jobs.prototype.delete = function(jobs,cb) {
    
    if(jobs && Object.prototype.toString.call( jobs ) !== '[object Array]' ) {
       jobs = [jobs];
    }    
    
    this.defaultRequest.post({ 
            body: {
                    type:'deleteAll',
                    items:jobs
                },
            uri: 'actions',
            json: true
        },function(error,response,body) {
        if (!error && response.statusCode == 200) {
            return cb(null,body);
        }        
        else
            return cb(error || new Error('bad response'),response);
    });       
}

function trackJobAndDownload(self,job,cb) {
    if(job.status == JobStatusConstants.eJobFailed) {
        return cb(new Error('Job Failed'),job);
    }
    else if(job.status == JobStatusConstants.eJobDone) {
        return new files(self.config).download(job.generatedFile,function(readable){
            cb(null,readable);
        });
    }
    else  {
        setTimeout(function() {
            self.get(job._id || job.uid,function(err,newJob) {
                if(err)
                    return cb(err);
                else
                    trackJobAndDownload(self,newJob,cb);
            });
        },1000);
    }
}


jobs.prototype.createAndDownload = function(jobTicket,cb) {
    var self = this;
    this.create(jobTicket,function(err,job) {
        if(err)
            return cb(err);
        else
            trackJobAndDownload(self,job,cb);
    });
}

module.exports = function(config){return new jobs(config)};