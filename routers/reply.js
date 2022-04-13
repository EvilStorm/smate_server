var express = require('express');
var router = express.Router();

var auth = require('../components/auth');
var ModelReply = require('../models/model_reply');
var ModelUser = require('../models/model_user');
var ModelDress = require('../models/model_dress');
var response = require('../components/response_util');
var DBConst = require('../db/constant');
var {ResponseCode } = require('../components/response_code_store');
var {ExceptionType, createException, convertException} = require('../components/exception_creator');


var FCMCreator = require('../components/fcm_message_creator');
var FCMSender = require('../components/fcm_sender');


async function sendLikePush(dressId) {
    var dress = await ModelDress.findById(dressId)
    if(dress) {
        var model = await ModelUser.findById(dress.owner)
                            .select('setting email pushToken _id')
                            .populate('setting')
        if(model){
            if(model.setting.replyAlarm) {
                var message = await FCMCreator.createMessage(model._id, FCMCreator.MessageType.REPLY)
                FCMSender.sendPush(message)
            }
        }
    }
}

router.post("", auth.isSignIn, (req, res) => {
    console.log("Post Reply!!");
    console.log(req.body);
    
    const model = new ModelReply(req.body)
    .save()
    .then(cursor => {
        sendLikePush(req.body.parent)

        ModelUser.findById(req.body.owner)
        .then(user => {
            user.reply.unshift(cursor._id);
            user.save();
        })
        ModelDress.findById(req.body.parent)
        .then(dress => {
            dress.reply.unshift(cursor._id);
            dress.save();
        })

        ModelReply.findById(cursor.id)
        .populate('owner', 'id name email pictureMe aboutMe useStop hasAward reportDress' )
        // .populate('-parent')
        .then(_ => {
            res.json(response.success(_));
        })
        .catch(_ => {
            var error = convertException(_)
            res.json(response.fail(error, error.errmsg, error.code))
        });
    

    })
    .catch(_ => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});



router.get("/:page", (req, res) => {
    ModelReply.find()
    .skip(DBConst.PAGE_COUNT* req.params.page)
    .limit(DBConst.PAGE_COUNT)
    .sort({createdAt: -1})
    .then(_ => {
        res.json(response.success(_));
    })
    .catch( _ => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

router.get("/detail/:page", (req, res) => {
    ModelReply.find()
    .populate('owner', 'id name email pictureMe aboutMe useStop hasAward reportDress' )
    .populate({
        path: 'parent',
        select: 'images isAward createdAt',
        populate:{
            path: 'owner',
            select: 'id name email pictureMe aboutMe useStop hasAward reportDress'
        }
    })
    .skip(DBConst.PAGE_COUNT* req.params.page)
    .limit(DBConst.PAGE_COUNT)
    .sort({createdAt: -1})
    .then(_ => {
        res.json(response.success(_));
    })
    .catch( _ => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

router.get("/dress/:dressId", (req, res) => {
    ModelReply.find({parent: req.params.dressId, isShow: true})
    .populate('owner', 'id name email pictureMe aboutMe useStop hasAward reportDress' )
    .select('-parent')
    .sort({createdAt: -1})
    .then(_ => {
        res.json(response.success(_));
    })
    .catch( _ => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});


router.get('/monthly/:year/:month/:day', function (req, res) {

    let startDate = new Date(Date.UTC(req.params.year, req.params.month-1, req.params.day, 0, 0, 0))
    let endDate = new Date(Date.UTC(req.params.year, req.params.month-1, req.params.day, 23, 59, 59, 999))

    ModelReply.find({
        createdAt: 
            {"$gte": startDate, "$lte": endDate},
    })
    .then(_ => {
        res.json(response.success(_));
    })
    .catch(_ => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    })

});


router.get("/user/:userId/:page", (req, res) => {
    ModelReply.find({owner: req.params.userId})
    .populate('owner', 'id name email pictureMe aboutMe useStop hasAward reportDress' )
    .populate({
        path: 'parent',
        select: 'images isAward createdAt',
        populate:{
            path: 'owner',
            select: 'id name email pictureMe aboutMe useStop hasAward reportDress'
        }
    })
    .skip(DBConst.PAGE_COUNT* req.params.page)
    .limit(DBConst.PAGE_COUNT)
    .sort({createdAt: -1})
    .then(_ => {
        res.json(response.success(_));
    })
    .catch( _ => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

router.get("/dress/:dressId/:page", (req, res) => {
    ModelReply.find({parent: req.params.dressId, isShow: true})
    .populate('owner', 'id name email pictureMe aboutMe useStop hasAward reportDress' )
    .select('-parent')
    .skip(DBConst.PAGE_COUNT* req.params.page)
    .limit(DBConst.PAGE_COUNT)
    .sort({createdAt: -1})
    .then(_ => {
        res.json(response.success(_));
    })
    .catch( _ => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

router.delete("/:reply_id", (req, res) => {

    ModelReply.findByIdAndUpdate(req.params.reply_id, {$set: {isShow: false}})
    .then( _ => {
        res.json(response.success(_));
    })
    .catch( _ => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});


module.exports = router;