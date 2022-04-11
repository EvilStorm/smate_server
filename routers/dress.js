var express = require('express');
var router = express.Router();
var util = require('../components/response_util');
var ModelDress = require('../models/model_dress');
var TagHandler = require('./components/tag_handler');
var ModelUser = require('../models/model_user');
var ModelLike = require('../models/model_like');
var DressAdapter = require('./components/dress_aggr');


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

router.get("/detail/:id", (req, res) => {
    ModelDress.findById(req.params.id)
    .then((_) => res.json(response.success({dress: _})))
    .catch((_) => {
        var error = convertException(_);
        res.json(response.fail(error, error.errmsg, error.code));
    })
})

router.get('/user/:id/:page', auth.isSignIn, (req, res) => {
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

router.get('/sample/user/:id/:page', auth.isSignIn, (req, res) => {
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
    model.owner = req.body.owner;

    model.save()
    .then(cursor => {

        ModelUser.findById(req.body.owner)
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