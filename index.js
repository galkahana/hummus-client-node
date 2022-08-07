module.exports = function(token,servicesUrl) {
    var config = {
      token:token,
      servicesUrl:servicesUrl || 'https://services.pdfhummus.com/api'  
    };
    
    return {
       jobs:require(__dirname + '/jobs')(config),
       files:require(__dirname + '/files')(config)
    }
}