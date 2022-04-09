var express = require('express');
var router = express.Router();

var ModelUser = require('../models/model_user');
var ModelSetting = require('../models/model_setting');
var mongoose = require('mongoose');
var auth = require('../components/auth');
var response = require('../components/response_util');
var {ResponseCode } = require('../components/response_code_store');
var {ExceptionType, createException, convertException} = require('../components/exception_creator');

router.post('/signin', async function(req, res) {

    try {
        var user = await ModelUser.findOne({
            identifyId: req.body.identifyId
        })

        var userId = null
        if(user == null) {
            userId = await addAccountProcess(req.body)
        } else {
            userId = user._id
        }
        
        var myInfo = await getMyInfo(userId)

        res.json(response.success(myInfo));

    } catch (err) {
        var error = convertException(err)
        res.json(response.fail(error, error.errmsg, error.code))
    }
})


async function addAccountProcess(data) {
    try {

        const user = new ModelUser(data);
        var userSaveResult = await user.save()

        const setting = new ModelSetting();
        setting.owner = userSaveResult._id;
        var settingSaveResult = await setting.save()
        
        userSaveResult.setting = settingSaveResult._id
        await userSaveResult.save()

        return userSaveResult._id
    } catch (e) {
      return e;
    }
}

async function getMyInfo(id) {
    
    var result = await ModelUser.findOne({
        _id: mongoose.Types.ObjectId(id),
    })
    .populate('setting')

    return result
}


module.exports = router;
