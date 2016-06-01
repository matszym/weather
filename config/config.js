module.exports = function() {
   require('./env/' + process.env.NODE_ENV + '.js');  
}