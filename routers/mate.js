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
var MateAggr = require('./components/mate_aggr');


var FCMCreator = require('../components/fcm_message_creator');
var FCMSender = require('../components/fcm_sender');

router.get("/detail/:mateId", (req, res) => {
    MateAggr.getMate(req.params.mateId)
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});
router.post("", auth.isSignIn, (req, res) => {
    console.log(req.body);

    var data = req.body;
    const tags = [...req.body.tags];

    data.owner = req.decoded.id
    data.tags = [];

    ModelMate(data)
    .save()
    .then(async (_) => {
        var user = await ModelUser.findById(req.decoded.id);
        user.mate.unshift(_._id);
        await user.save();
        
        var mateJoin = await ModelMateJoin(
            {
                owner: req.decoded.id,
                mate: _.id,
                member: [],
                joinMember: [],
                deniedMember: [],
            }
        ).save();

        console.log( ` JOIN ID : ${mateJoin._id}`)
        var mate = await ModelMate.findById(_._id);
        mate.member = mateJoin._id;

        await mate.save();

        console.log( ` SAVE : ${JSON.stringify(_)}`);

        await TagHandler.postTagsMate(_._id, _.owner, tags)
        const resposeData = await getMateDetail(_._id)
        console.log(`resposeData: ${JSON.stringify(resposeData)}`)

        //채팅방 생성
        var roomInfo = {
            owner: req.decoded.id,
            mate: _._id,
            member: [req.decoded.id]
        }
        var room = await ModelMateRoom(roomInfo);
        await room.save();
        console.log( ` MateRoom : ${room._id}`)
        //채팅방 생성 끝


        
        res.json(response.success(resposeData))
    })
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

router.post("/join/:mateId", auth.isSignIn, async (req, res) => {
    // var mate = await ModelMate.findById(req.params.mateId);
    // mate.member.push(req.decoded.id);
    // mate

    var joinMate = await ModelMateJoin.findOne({mate: req.params.mateId});
    joinMate.member.push(req.decoded.id);
    
    joinMate.save()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

router.post("/separate/:mateId", auth.isSignIn, async (req, res) => {
    var joinMate = await ModelMateJoin.findOne({mate: req.params.mateId});

    const index = joinMate.member.indexOf(req.decoded.id);
    if(index > -1) {
        joinMate.member.splice(index, 1);
    }
    joinMate
    .save()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

router.post("/accept/:mateId", auth.isSignIn, async (req, res) => {
    var joinMate = await ModelMateJoin.findOne({mate: req.params.mateId});


    joinMate.joinMember.push(req.body.joinMemberId);


    joinMate
    .save()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

router.post("/denied/:mateId", auth.isSignIn, async (req, res) => {
    var joinMate = await ModelMateJoin.findOne({mate: req.params.mateId});

    joinMate.deniedMember.push(req.body.joinMemberId);


    joinMate
    .save()
    .then((_) => res.json(response.success(_)))
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


router.get("/search/tag/:tags", auth.signCondition, (req, res) => {
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