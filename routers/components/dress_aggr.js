var mongoose = require('mongoose');
var ModelTag = require('../../models/model_tag');
var ModelDress = require('../../models/model_dress');
var ModelUser = require('../../models/model_user');
var DBConst = require('../../db/constant');

//match and 
async function getDressIncludeBlockUser(id, match={isShow: true}, page = 0, limitCount=DBConst.PAGE_COUNT, sort={createdAt: -1}) {
    console.log("getDressIncludeBlockUser")
    var myInfo = await ModelUser.findById(id)   
    var myInfoObjId = [];

    if(myInfo != null && myInfo.blockUser != null) {
        // console.log("BLOCK USER: ");
        // console.log(myInfo.blockUser);
        for(i=0; i<myInfo.blockUser.length; i++) {
            myInfoObjId.push(mongoose.Types.ObjectId(myInfo.blockUser[i]))
        }    
    }

    match.$and.push({owner: {$nin: myInfoObjId}})

    var user = await ModelDress.aggregate([
        {
            $match: {owner: {$nin: myInfoObjId}}
        },
        {
            $match:  match
        },
        {
            $sort: sort
        },
        {
            $skip: (DBConst.PAGE_COUNT * page)
        },
        {
            $limit: limitCount
        },

        {
            $lookup: {from: ModelUser.collection.name, foreignField: '_id', localField: 'owner', as: 'user'}
        },
        {
            $unwind: "$user"
        },
        {
            $lookup: {from: ModelTag.collection.name, foreignField: '_id', localField: 'tags', as: 'tag'}
        },
        {
            $project: {
                id: 1,
                isShow: 1,
                images: 1,
                say: 1,
                isAward: 1,
                tags: '$tag',
                likeThis: {$in: [mongoose.Types.ObjectId(id), {$ifNull: ["$like", []]}]},
                reportThis: {$in: [mongoose.Types.ObjectId(id), {$ifNull: ["$police", []]}]},
                likeCount: {$size: "$like"},
                replyCount: {$size: "$reply"},
                cutByManager: {$ifNull: [-1, "$cutByManager"]},
                ownerId: "$owner",
                "owner._id": "$user._id",
                "owner.name": "$user.name",
                "owner.email": "$user.email",
                "owner.pictureMe": "$user.pictureMe",
                "owner.aboutMe": "$user.aboutMe",
                "owner.reportDress": "$user.reportDress",
                "owner.blockUser": "$user.blockUser",
                "owner.useStop": "$user.useStop",
                "owner.hasAward": "$user.hasAward",
                favoritePoint: {$add: [ {$multiply: [{$size: "$like"}, 3]}, {$size: "$reply"}]},
                createdAt: 1,
            }
        }, 
    ]
    );
    return user;



    // var cursor = await ModelDress.aggregate([
    //     {
    //         $lookup: {from: ModelUser.collection.name, foreignField: '_id', localField: 'owner', as: 'user'}
    //     },
    //     {
    //         $unwind: "$user"
    //     },
    //     {
    //         $lookup: {from: ModelTag.collection.name, foreignField: '_id', localField: 'tags', as: 'tag'}
    //     },
    //     {
    //         $project: {
    //             id: 1,
    //             isShow: 1,
    //             images: 1,
    //             say: 1,
    //             isAward: 1,
    //             tags: '$tag',
    //             likeThis: {$in: [mongoose.Types.ObjectId(id), {$ifNull: ["$like", []]}]},
    //             reportThis: {$in: [mongoose.Types.ObjectId(id), {$ifNull: ["$police", []]}]},
    //             likeCount: {$size: "$like"},
    //             replyCount: {$size: "$reply"},
    //             ownerId: "$owner",
    //             "owner._id": "$user._id",
    //             "owner.name": "$user.name",
    //             "owner.email": "$user.email",
    //             "owner.pictureMe": "$user.pictureMe",
    //             "owner.aboutMe": "$user.aboutMe",
    //             "owner.reportDress": "$user.reportDress",
    //             "owner.blockUser": "$user.blockUser",
    //             "owner.useStop": "$user.useStop",
    //             "owner.hasAward": "$user.hasAward",
    //             favoritePoint: {$add: [ {$multiply: [{$size: "$like"}, 3]}, {$size: "$reply"}]},
    //             createdAt: 1,
    //         }
    //     }, 
    //     {
    //       $match: match  
    //     },
    //     {
    //         $sort: sort
    //     },
    //     {
    //         $skip: (DBConst.PAGE_COUNT * page)
    //     },
    //     {
    //         $limit: limitCount
    //     },  
    // ])
    // return cursor;
}

async function getDress(id, match={isShow: true}, page = 0, limitCount=DBConst.PAGE_COUNT, sort={createdAt: -1}) {
    console.log("getDress")
    var cursor = await ModelDress.aggregate([
        {
            $lookup: {from: ModelUser.collection.name, foreignField: '_id', localField: 'owner', as: 'user'}
        },
        {
            $unwind: "$user"
        },
        {
            $lookup: {from: ModelTag.collection.name, foreignField: '_id', localField: 'tags', as: 'tag'}
        },
        {
            $project: {
                id: 1,
                isShow: 1,
                images: 1,
                say: 1,
                isAward: 1,
                tags: '$tag',
                likeThis: {$in: [mongoose.Types.ObjectId(id), {$ifNull: ["$like", []]}]},
                reportThis: {$in: [mongoose.Types.ObjectId(id), {$ifNull: ["$police", []]}]},
                likeCount: {$size: "$like"},
                replyCount: {$size: "$reply"},
                cutByManager: {$ifNull: [-1, "$cutByManager"]},
                ownerId: "$owner",
                "owner._id": "$user._id",
                "owner.name": "$user.name",
                "owner.email": "$user.email",
                "owner.pictureMe": "$user.pictureMe",
                "owner.aboutMe": "$user.aboutMe",
                "owner.reportDress": "$user.reportDress",
                "owner.blockUser": "$user.blockUser",
                "owner.useStop": "$user.useStop",
                "owner.hasAward": "$user.hasAward",
                favoritePoint: {$add: [ {$multiply: [{$size: "$like"}, 3]}, {$size: "$reply"}]},
                createdAt: 1,
            }
        }, 
        {
          $match: match  
        },
        {
            $sort: sort
        },
        {
            $skip: (DBConst.PAGE_COUNT * page)
        },
        {
            $limit: limitCount
        },  
    ])
    return cursor;

}
async function getDressWithId(id, match={isShow: true}, sort={createdAt: -1}) {
    // console.log(" DBConst.PAGE_COUNT : " + DBConst.PAGE_COUNT);
    // console.log(" match : " +match);
    // console.log("id: " +id);
    
    var cursor = await ModelDress.aggregate([
        {
            $lookup: {from: ModelUser.collection.name, foreignField: '_id', localField: 'owner', as: 'user'}
        },
        {
            $unwind: "$user"
        },
        {
            $lookup: {from: ModelTag.collection.name, foreignField: '_id', localField: 'tags', as: 'tag'}
        },
        {
            $project: {
                id: 1,
                isShow: 1,
                images: 1,
                say: 1,
                isAward: 1,
                tags: '$tag',
                likeThis: {$in: [mongoose.Types.ObjectId(id), {$ifNull: ["$like", []]}]},
                reportThis: {$in: [mongoose.Types.ObjectId(id), {$ifNull: ["$police", []]}]},
                likeCount: {$size: "$like"},
                replyCount: {$size: "$reply"},
                cutByManager: {$ifNull: [-1, "$cutByManager"]},
                ownerId: "$owner",
                "owner._id": "$user._id",
                "owner.name": "$user.name",
                "owner.email": "$user.email",
                "owner.pictureMe": "$user.pictureMe",
                "owner.aboutMe": "$user.aboutMe",
                "owner.reportDress": "$user.reportDress",
                "owner.useStop": "$user.useStop",
                "owner.hasAward": "$user.hasAward",
                favoritePoint: {$add: [ {$multiply: [{$size: "$like"}, 3]}, {$size: "$reply"}]},
                createdAt: 1,
            }
        }, 
        {
          $match:  match 
        },
        {
            $sort: sort
        },
    ])
    return cursor;
}

/**
 * 같은 동작 다른 느낌 
 * 
 */
    // ModelDress.aggregate([
    //     {
    //         $lookup: {from: ModelUser.collection.name, foreignField: '_id', localField: 'owner', as: 'user'}
    //     },
    //     {
    //         $unwind: "$user"
    //     },
    //     {
    //         $lookup: {from: ModelTag.collection.name, foreignField: '_id', localField: 'tags', as: 'tag'}
    //     },
    //     {
    //         $unwind: {
    //             path: "$tag",
    //             preserveNullAndEmptyArrays: false
    //         }  
    //     },
    //     {
    //         $project: {
    //             id: 1,
    //             isShow: 1,
    //             images: 1,
    //             say: 1,
    //             tags: '$tag',
    //             likeThis: {$in: [mongoose.Types.ObjectId(req.headers.id), "$like"]},
    //             likeCount: {$size: "$like"},
    //             replyCount: {$size: "$reply"},
    //             "owner._id": "$user._id",
    //             "owner.name": "$user.name",
    //             "owner.email": "$user.email",
    //             "owner.pictureMe": "$user.pictureMe",
    //             createdAt: 1,
    //         }
    //     }, 
    //     {
    //       $match: {
    //           $and: [
    //               {isShow: true},
    //           ]
    //       }  
    //     },
    //     {
    //         $group: {
    //             _id: '$_id',
    //             images: {$first: '$images'},
    //             say: {$first: '$say'},
    //             tags: {$push: '$tags'},
    //             likeThis: {$first: '$likeThis'},
    //             likeCount: {$first: '$likeCount'},
    //             replyCount: {$first: '$replyCount'},
    //             owner: {$first: '$owner'},
    //             createdAt: {$first: '$createdAt'},
    //             isShow: {$first: '$isShow'},
    //         }
    //     },
    //     {
    //         $project: {
    //             _id: 1,
    //             images: 1,
    //             say: 1,
    //             tags: 1,
    //             likeThis: 1,
    //             likeCount: 1,
    //             replyCount: 1,
    //             owner:1,
    //             isShow: 1,
    //             createdAt: 1
    //         }
    //     },
    //     {
    //         $match: {"tags.tag": {$in: [req.params.tag]}}
    //     },  
    //     {
    //         $sort: {createdAt: -1}
    //     },
    //     {
    //         $skip: (PAGE_COUNT * req.params.page)
    //     },
    //     {
    //         $limit: PAGE_COUNT
    //     },  
    // ])
    // .then((cursor) => res.json(response.successTrue(cursor)))
    // .catch((err) => res.json(response.successFalse(err)))



    async function getDressNoneTag(id, match={isShow: true}, page = 0, limitCount=DBConst.PAGE_COUNT, sort={createdAt: -1}) {
    
        var cursor = await ModelDress.aggregate([
            {
                $lookup: {from: ModelUser.collection.name, foreignField: '_id', localField: 'owner', as: 'user'}
            },
            {
                $unwind: "$user"
            },
            {
                $project: {
                    id: 1,
                    isShow: 1,
                    images: 1,
                    isAward: 1,
                    say: 1,
                    likeThis: {$in: [mongoose.Types.ObjectId(id), {$ifNull: ["$like", []]}]},
                    reportThis: {$in: [mongoose.Types.ObjectId(id), {$ifNull: ["$police", []]}]},
                    likeCount: {$size: "$like"},
                    replyCount: {$size: "$reply"},
                    cutByManager: {$ifNull: [-1, "$cutByManager"]},
                    ownerId: "$owner",
                    "owner._id": "$user._id",
                    "owner.name": "$user.name",
                    "owner.email": "$user.email",
                    "owner.pictureMe": "$user.pictureMe",
                    "owner.aboutMe": "$user.aboutMe",
                    "owner.reportDress": "$user.reportDress",
                    "owner.blockUser": "$user.blockUser",
                    "owner.useStop": "$user.useStop",
                    "owner.hasAward": "$user.hasAward",   
                    favoritePoint: {$add: [ {$multiply: [{$size: "$like"}, 3]}, {$size: "$reply"}]},
                    createdAt: 1,
                }
            }, 
            {
              $match: match  
            },
            {
                $sort: sort
            },
            {
                $skip: (DBConst.PAGE_COUNT * page)
            },
            {
                $limit: limitCount
            },  
        ])
    
        return cursor;
    }

module.exports = {
    getDress: getDress,
    getDressWithId: getDressWithId,
    getDressNoneTag: getDressNoneTag,
    getDressIncludeBlockUser: getDressIncludeBlockUser,
}