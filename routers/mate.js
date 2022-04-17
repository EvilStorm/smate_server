var express = require('express');
var router = express.Router();

var auth = require('../components/auth');
var ModelMate = require('../models/model_mate');
var TagHandler = require('./components/tag_handler');
var ModelUser = require('../models/model_user');
var ModelMateJoin = require('../models/model_mate_join');
var ModelMateRoom = require('../models/model_mate_room');
var response = require('../components/response_util');
var DBConst = require('../db/constant');
var {ResponseCode } = require('../components/response_code_store');
var {ExceptionType, createException, convertException} = require('../components/exception_creator');


var FCMCreator = require('../components/fcm_message_creator');
var FCMSender = require('../components/fcm_sender');


router.post("", auth.isSignIn, (req, res) => {
    console.log(req.body);

    var data = req.body;
    const tags = [...req.body.tags];

    data.owner = req.decoded.id
    data.tags = [];

    ModelMate(data)
    .save()
    .then(async (_) => {

        await TagHandler.postTagsMate(_._id, _.owner, tags)
        const resposeData = await getMateDetail(_._id)
        console.log(`resposeData: ${JSON.stringify(resposeData)}`)
        res.json(response.success(resposeData))
    })
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

async function getMateDetail(mateId) {
    const id = mateId;
    return new Promise((resolve, reject) => {
        try {
            ModelMate.findById(id)
            .then((_) => {
                console.log(`_____: ${JSON.stringify(_)}`)
                return resolve(_)
            })
            .catch((_) => reject());
        }catch (e) {
            console.log(e);
            reject();
        }

    });
}

router.get("/page/:page", auth.signCondition, (req, res) => {
    ModelMate.find()
    .skip(DBConst.PAGE_COUNT* req.params.page)
    .limit(DBConst.PAGE_COUNT)
    .sort({createdAt: -1})
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});



router.patch("/:_id", auth.isAdmin, (req, res) => {
    ModelMate.findByIdAndUpdate({_id: req.params._id}, {$set: req.body})
    .exec()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});
router.delete("/:_id", auth.isAdmin, (req, res) => {
    ModelMate.findByIdAndDelete(req.params._id)
    .exec()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

module.exports = router;