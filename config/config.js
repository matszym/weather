module.exports = require('./env/' + process.env.NODE_ENV + '.js');

/* 

Sample config file:

######################
env/production.js
######################

module.exports = {
   googleMapsAPI: 'your API key'
}

*/