var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var response = require('../components/response_util');
var {ResponseCode } = require('../components/response_code_store');
var {ExceptionType, createException, convertException} = require('../components/exception_creator');

var auth = require('../components/auth');
var DBConst = require('../db/constant');
var ModelDress = require('../models/model_dress');
var TagHandler = require('./components/tag_handler');
var ModelUser = require('../models/model_user');
var ModelLike = require('../models/model_like');
var DressAdapter = require('./components/dress_aggr');
var FCMCreator = require('../components/fcm_message_creator');
var FCMSender = require('../components/fcm_sender');



router.get("/count/:count", (req, res) => {
    DressAdapter.getDress(
        req.headers.id,
        {isShow: true},
        0,
        parseInt(req.params.count),
        {createdAt: -1},
    )
    .then((_) => {
        res.json(response.success({dress: _}))
    })
    .catch((_) => {
        var error = convertException(_);
        res.json(response.fail(error, error.errmsg, error.code));
    })
});

router.get("/detail/:id", auth.signCondition, (req, res) => {
    
    DressAdapter.getDress(
        req.decoded.id,
        {
            $and: [
                {_id: mongoose.Types.ObjectId(req.params.id)},
                {isShow: true},
            ]
        },
        req.params.page,

    )
    .then((_) => res.json(response.success({dress: _})))
    .catch((_) => {
        console.log(` error!!!! ${JSON.stringify(_)}`);
        var error = convertException(_);
        res.json(response.fail(error, error.errmsg, error.code));
    })

})

router.get('/user/:id/:page', auth.signCondition, (req, res) => {
    DressAdapter.getDress(
        req.decoded.id,
        {
            $and: [
                {ownerId: mongoose.Types.ObjectId(req.params.id)},
                {isShow: true},
            ]
        },
        req.params.page,

    )
    .then((_) => res.json(response.success({dress: _})))
    .catch((_) => {
        var error = convertException(_);
        res.json(response.fail(error, error.errmsg, error.code));
    })
});

/**
 * 사용자 드레스 가져오기 
 * timestamp를 기준으로 다음 등록된 것들만 카운트 한다. 
 * 
 * 내가 최초(page=0) 이후에 등록된 항목으로 순서 변경을 막기 위함. 
 * ex) PAGE_COUNT갯수 만큼 가져간 후 누군가 하나를 등록했을 때 
 * 다음 PAGE_COUNT 갯수 만큼 가져간다면 이전 마지막 드레스가 다음에 포함된다. 
 */
router.get("/user/:id/:sortType/:page", auth.signCondition, (req, res) => {
    const sort = req.params.sortType == 'LIKE'
    ?{
        favoritePoint: -1,
    }
    :{
        createdAt: -1
    }

    DressAdapter.getDress(
        req.decoded.id, 
        {
            $and: [
              {ownerId: mongoose.Types.ObjectId(req.params.id)},
              {isShow: true},
            ]
        },
        req.params.page,
        DBConst.PAGE_COUNT,
        sort
    )
    .then(_ => {
        res.json(response.success({dress: _}));
    })
    .catch(_ => {
        var error = convertException(_);
        res.json(response.fail(error, error.errmsg, error.code));
    });
});

router.get('/sample/user/:id/:page', auth.signCondition, (req, res) => {
    ModelDress
        .find({owner: req.params.id})
        .limit(30)
    .then((_) => res.json(response.success({dress: _})))
    .catch((_) => {
        var error = convertException(_);
        res.json(response.fail(error, error.errmsg, error.code));
    })
});


router.post('/', auth.isSignIn, function (req, res) {
    const model = new ModelDress();
    model.say = req.body.say;
    model.images = req.body.images;
    model.owner = req.decoded.id;

    model.save()
    .then(cursor => {

        ModelUser.findById(req.decoded.id)
        .then(user => {
            user.dress.unshift(cursor._id)
            user.save()
            .then( user => {
                addTaging(model.id, user.id, req.body.tags);
                getDress(res, req.decoded.id, model.id);
            })
            .catch(_ => {
                var error = convertException(_);
                res.json(response.fail(error, error.errmsg, error.code));
            })
        })
        .catch(_ => {
            var error = convertException(_);
            res.json(response.fail(error, error.errmsg, error.code));
        });      
    })
    .catch(_ => {
        var error = convertException(_);
        res.json(response.fail(error, error.errmsg, error.code));
    });   
});


function getDress(res, userId, dressId)  {
    DressAdapter.getDress(
        userId, 
        {
            $and: [
              {_id: mongoose.Types.ObjectId(dressId)},
              {isShow: true},
            ]
        },
        0, 1, {createdAt: -1}

    )
    .then((_) => {
        // console.log("GET Dress Response : ");
        // console.log(_);
        res.json(response.success({dress: _}));
    })
    .catch((err) => {
        var error = convertException(_);
        res.json(response.fail(error, error.errmsg, error.code));
    })
}

async function sendLikePush(dressId) {
    var dress = await ModelDress.findById(dressId)
    if(dress) {
        var model = await ModelUser.findById(dress.owner)
                            .select('setting email pushToken _id')
                            .populate('setting')

        if(model){
            if(model.setting.likeAlarm) {
                var message = await FCMCreator.createMessage(model._id, FCMCreator.MessageType.LIKE)
                FCMSender.sendPush(message)
            }
        }
    }
}
function addTaging(dressId, userId, tags) {
    TagHandler.postTags(dressId, userId, tags)
}


/**
 * body : dressID/ userID
 */
 router.patch("/like", auth.isSignIn, (req, res) => {
    const userId = req.decoded.id;
    const dressId = req.body.dressId;

    ModelLike.findOne({
        $and: [
            {dressId: req.body.dressId},
            {userId: userId},
            
        ]
    })
    .then(cursor => {
        if(cursor == null) {
            const model = new ModelLike(req.body)
            model.userId = userId;
            model.save()
            .then(like => {
                changeLikeState(userId, dressId, true);
                res.json(response.success(like));        
            })
            .catch(_ => {
                console.log(_);
                var error = convertException(_);
                res.json(response.fail(error, error.errmsg, error.code));
            })
        } else {
            cursor.like = !cursor.like;
            cursor.save()
            .then(_ => {
                changeLikeState(userId, dressId, _.like);
                if(!_.like) {
                    _.remove()
                }
                res.json(response.success({dress: cursor}));
            })
            .catch(_ => {
                console.log(_);
                var error = convertException(_);
                res.json(response.fail(error, error.errmsg, error.code));        
            })
        }
    })
    .catch(_ => {
        console.log(err);
        var error = convertException(_);
        res.json(response.fail(error, error.errmsg, error.code));
    })
});

function changeLikeState(userID, dressID, likeState) {
    if(likeState) {
        sendLikePush(dressID)
        ModelUser.findById(userID)
        .then( _ => {
            _.likeDress.unshift(dressID);
            _.save();
        })
        .catch( _ => {
            console.log(_);
        })
        ModelDress.findById(dressID)
        .then( _ => { 
            _.like.unshift(userID)
            _.save();
        })
    } else {
        ModelUser.findById(userID)
        .then( _ => {
            _.likeDress.splice(_.likeDress.indexOf(dressID),1);
            _.save()
        })
        .catch( _ => {
            console.log(_);
        })

        ModelDress.findById(dressID)
        .then( _ => {
            _.like.splice(_.like.indexOf(userID),1);
            _.save()
        })
        .catch( _ => {
            console.log(_);
        })
    }
}


module.exports = router;