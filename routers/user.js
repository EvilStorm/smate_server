var express = require('express');
var router = express.Router();

var ModelUser = require('../models/model_user');
var mongoose = require('mongoose');
var auth = require('../components/auth');
var response = require('../components/response_util');
var {ResponseCode } = require('../components/response_code_store');
var {ExceptionType, createException, convertException} = require('../components/exception_creator');

router.get('/me', auth.isSignIn, async function(req, res) {

    try {

        var result = await ModelUser.findOne({
            _id: mongoose.Types.ObjectId(req.decoded.id),
        })
        .populate('setting')
        res.json(response.success(result));

    } catch (err) {
        var error = convertException(err)
        res.json(response.fail(error, error.errmsg, error.code))
    }
});

module.exports = router;
