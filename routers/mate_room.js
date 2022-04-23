
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var auth = require('../components/auth');
var ModelMate = require('../models/model_mate');
var ModelUser = require('../models/model_user');
var ModelMateRoom = require('../models/model_mate_room');
var ModelMateMsg = require('../models/model_mate_message');
var response = require('../components/response_util');
var DBConst = require('../db/constant');
var {ResponseCode } = require('../components/response_code_store');
var {ExceptionType, createException, convertException} = require('../components/exception_creator');


var FCMCreator = require('../components/fcm_message_creator');
var FCMSender = require('../components/fcm_sender');

router.get('/:roomId/page/:page', auth.isSignIn, (req, res) => {
    ModelMateMsg.find({
        roomId: mongoose.Types.ObjectId(req.params.roomId),
    })
    .populate('owner', '_id nickName pictureMe')
    .sort({createdAt: -1})
    .skip(DBConst.PAGE_COUNT * req.params.page)
    .limit(DBConst.PAGE_COUNT)
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        console.log(_);
        var error = convertException(_);
        res.json(response.fail(error, error.errmsg, error.code));
    })
});

router.post('/', auth.isSignIn, async (req, res) => {
    try {

        const room = await ModelMateRoom.findById(req.body.roomId);

        const msg = await ModelMateMsg(req.body);
        await msg.save();

        //메시지 방 사람들에게 채팅 알림을 보낸다.
        var message = await FCMCreator.createMessage(room._id, FCMCreator.MessageType.CHAT);
        FCMSender.sendPushMulti(message);
        res.json(response.success(msg));
    } catch (e){
        console.log(e);
        var error = convertException(e)
        res.json(response.fail(error, error.errmsg, error.code))
    }
});

router.post('/push/test/:roomId', async (req, res) => {
    try {
        //메시지 방 사람들에게 채팅 알림을 보낸다.
        var message = await FCMCreator.createMessage(req.params.roomId, FCMCreator.MessageType.CHAT);
        FCMSender.sendPushMulti(message);
        res.json(response.success({result: 1}));
    } catch (e){
        console.log(e);
        var error = convertException(e)
        res.json(response.fail(error, error.errmsg, error.code))
    }
});

module.exports = router;