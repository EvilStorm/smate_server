var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var response = require('../components/response_util');
var ModelTag = require('../models/model_tag');
var ModelTagUseMap = require('../models/model_tag_use_mate_map');
var ModelMate = require('../models/model_mate');
var ModelUser = require('../models/model_user');
var ModelMateJoin = require('../models/model_mate_join');




var auth = require('../components/auth');
var {ResponseCode } = require('../components/response_code_store');
var {ExceptionType, createException, convertException} = require('../components/exception_creator');


var DressAdapter = require('./components/dress_aggr');
var MateAdapter = require('./components/mate_aggr');

const PAGE_COUNT = 30;

router.get("", (req, res) => {
    ModelTag.find()
    .sort({count: -1})
    .exec()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

router.get("/all", (req, res) => {
    ModelTag.find()
    .sort({count: -1})
    .exec()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

router.get("/hot", (req, res) => {
    ModelTag.find()
    .sort({count: -1})
    .limit(20)
    .exec()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});


router.get("/tagMap", (req, res) => {
    ModelTagUseMap.find()
    .sort({createdAt: -1})
    .then(_ => {
        res.json(response.success(_));
    })
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

router.get("/:tag", (req, res) => {
    ModelTag.find({tag: req.params.tag})
    .sort({count: -1})
    .exec()
    .then((_) => {
        res.json(response.success(_))
    })
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

router.get("/tagMap/detail", auth.isAdmin, (req, res) => {
    ModelTagUseMap.find()
    .populate('user')
    .populate('mate')
    .populate('tag')
    .sort({createdAt: -1})
    .then(_ => {
        res.json(response.success(_));
    })
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});
router.get("/tagMap/detail/:id", auth.signCondition, (req, res) => {

    MateAdapter.getMateDetail(
        req.decoded.id, 
        {
            $and: [
                {isShow: true},
                {"tags._id": mongoose.Types.ObjectId(req.params.id)}
            ]
        },
    )
    .then(_ => {
        res.json(response.success(_));
    })
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });

});

router.get("/search/favoriate/:page", auth.isSignIn, (req, res) => {
    DressAdapter.getDress(
        req.decoded.id, 
        {
            $and: [
                {isShow: true},
            ]
        },
        req.params.page,
        50,
        {
            favoritePoint: -1
        }
    )
    .then(_ => {
        res.json(response.success(_));
    })
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});


router.get("/search/:word", (req, res) => {
    ModelTag.find({tag: RegExp(req.params.word, "i")})
    .sort({count: -1})
    .exec()
    .then((cursor) => res.json(response.success(cursor)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});





router.get("/search/tagId/:tagId/mate/:page", auth.signCondition, async (req, res) => {
    console.log(" req.params.tagId: " + req.params.tagId)
    MateAdapter.getMateDetail(
        req.decoded.id, 
        {
            $and: [
                {isShow: true},
                {"tags._id": mongoose.Types.ObjectId(req.params.tagId)}
            ]
        },
        req.params.page
    )
    .then(_ => {
        res.json(response.success(_));
    })
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

router.get("/search/word/:word/mate/:page", auth.signCondition, (req, res) => {
    console.log(" req.params.tagId: " + req.params.tagId)

    var searchWords = req.params.word.split(',');
    console.log(searchWords);

    MateAdapter.getMateDetail(
        req.decoded.id,  
        {
            $and: [
                {isShow: true},
                {"tags.tag": {$in: req.params.word.split(',')}}
            ]
        },
        req.params.page
    )
    .then(_ => {
        res.json(response.success(_));
    })
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

router.post('', (req, res) => {
    ModelTag.find({tag: req.body.tags})
    .then(_ => {
        
    })
    .catch((err) => res.json(response.successFalse(err)));
});


module.exports = router;
