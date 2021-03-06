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

router.get('/detail/me', auth.isSignIn, async function(req, res) {

    try {

        var result = await ModelUser.findOne({
            _id: mongoose.Types.ObjectId(req.decoded.id),
        })
        .populate([
            {
                path: 'mate',
                populate: [
                    {
                        path: "tags",
                    }, 
                    {
                        path: "owner",
                        select: "_id nickName pictureMe"
                    }, 
                ]           
            },
            {
                path: 'mate',
                populate: {
                    path: "member",
                    populate: [
                        {
                            path: "member",
                            select: "_id nickName pictureMe"
                        },
                        {
                            path: "joinMember",
                            select: "_id nickName pictureMe"
                        },
                        {
                            path: "deniedMember",
                            select: "_id nickName pictureMe"
                        },
                    ]
                },
            },
        ])
        .populate([{
            path: 'mateJoin',
            populate: {
                path: "member",
                select: "_id nickName pictureMe"
            },
        },
        {
            path: 'mateJoin',
            populate: {
                path: "owner",
                select: "_id nickName pictureMe"
            },
        },
        {
            path: 'mateJoin',
            populate: {
                path: "mate",
                select: "_id images title message memberLimit locationStr mateDate tags",
                populate: {
                    path : "tags"
                }
            },
        },

        ])
        .populate('setting')
        res.json(response.success(result));

    } catch (err) {
        var error = convertException(err)
        res.json(response.fail(error, error.errmsg, error.code))
    }
});



router.get('/check/nickName/:nickName',  async function(req, res) {

    try {

        var result = await ModelUser.findOne({
            nickName: req.params.nickName,
        })
    
        if(result == null) {
            res.json(response.success({result: 1, message: '????????? ??? ????????????.'}));
        } else {
            res.json(response.success({result: 0, message: '?????? ???????????????.'}));
        }

    } catch (err) {
        var error = convertException(err)
        res.json(response.fail(error, error.errmsg, error.code))
    }
});

router.patch("/", auth.isSignIn, (req, res) => {
    ModelUser.findByIdAndUpdate({_id: req.decoded.id}, {$set: req.body})
    .exec()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});


module.exports = router;
