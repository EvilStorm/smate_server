var express = require('express');
var router = express.Router();
var auth = require('../components/auth');

var ModelPolice = require('../models/model_police');
var response = require('../components/response_util');
var {ResponseCode } = require('../components/response_code_store');
var {ExceptionType, createException, convertException} = require('../components/exception_creator');


router.get("/", auth.isSignIn, (req, res) => {
    ModelPolice.find({owner: req.decoded.id})
    .exec()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

router.post("/", auth.isSignIn, (req, res) => {
    const model = new ModelPolice(req.body)
    model.save()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });

});




module.exports = router;