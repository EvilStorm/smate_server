var response = require('./response_util');

var {ResponseCode } = require('../components/response_code_store');
var {ExceptionType, createException, convertException} = require('../components/exception_creator');
const { header } = require('express/lib/request');

auth = {}


auth.isSignIn = function(req, res, next) {

  var token = req.headers['identifyid'];
  var userId = req.headers['userid'];
  
  if (!token || !userId) {
    var error = createException(ExceptionType.REQUIRED_JWT_TOKEN);
    res.json(response.fail(error, error.errmsg, error.code));
  } else {
    req.decoded = {
      token: token,
      id: userId,
    };
  
    console.log("req.decoded" )
    console.log(req.decoded )
    
    next();
  }
}

auth.isAdmin = function(req, res, next) {

  console.log(`headers: ${JSON.stringify(req.headers)}`)

  var token = req.headers['identifyid'];
  console.log(`TOKEN: ${token}`)
  if(token != null && token == 'admin') {
    req.decoded = {
      token: req.headers['identifyid'],
      id: req.headers['userid'],
    };
    next();
  } else {
    var error = createException(ExceptionType.REQUIRED_JWT_TOKEN);
    res.json(response.fail(error, error.errmsg, error.code));

  }
}

module.exports = auth;
