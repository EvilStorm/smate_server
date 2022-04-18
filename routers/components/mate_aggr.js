var mongoose = require('mongoose');
var ModelTag = require('../../models/model_tag');
var ModelMate = require('../../models/model_mate');
var ModelUser = require('../../models/model_user');
var DBConst = require('../../db/constant');
const ModelMateJoin = require('../../models/model_mate_join');

async function getMate(mateID) {
    const mId = mateID;
    return new Promise(async (resolve, reject) => {
        console.log(` mId: ${mId}`)
        var mate = await ModelMate.aggregate([
            {
                $match: {_id: mongoose.Types.ObjectId(mId)}
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
                $lookup: {
                    from: ModelMateJoin.collection.name, 
                    foreignField: '_id', 
                    localField: 'member', 
                    as: 'mem',
                    pipeline: [
                        {
                            $lookup: {from: ModelUser.collection.name, foreignField: '_id', localField: 'member', as: 'user'}
                        },
                        {
                            $lookup: {from: ModelUser.collection.name, foreignField: '_id', localField: 'joinMember', as: 'jm'}
                        },                        {
                            $lookup: {from: ModelUser.collection.name, foreignField: '_id', localField: 'deniedMember', as: 'dm'}
                        },                        
                        {
                            $project: {
                                member: '$user',
                                joinMember: '$jm',
                                deniedMember: '$dm',
                            },    
                        },
                    ]
                },
            },
            // {
            //     $lookup: {
            //         from: ModelUser.collection.name, 
            //         foreignField: '_id', 
            //         localField: 'mem.member', 
            //         as: 'mem.member',
            //     },  
            // },
            // {
            //     $lookup: {
            //         from: ModelUser.collection.name, 
            //         foreignField: '_id', 
            //         localField: 'mem.joinMember', 
            //         as: 'mem.joinMember',
            //     },  
            // },
            // {
            //     $lookup: {
            //         from: ModelUser.collection.name, 
            //         foreignField: '_id', 
            //         localField: 'mem.deniedMember', 
            //         as: 'mem.deniedMember',
            //     },  
            // },

            // {
            //     $unwind: "$mem.member"
            // },
            {
                $project: {
                    id: 1,
                    title: 1,
                    images: 1,
                    message: 1,
                    memberLimit: 1,
                    locationStr: 1,
                    loc: 1,
                    images: 1,
                    tags: '$tag',
                    member: '$mem',
                    'owner._id': '$user._id',
                    'owner.nickName': '$user.nickName',
                    'owner.pictureMe': '$user.pictureMe',
                }
            }
        ]);
        console.log(` mate: ${JSON.stringify(mate)}`)
         resolve(mate);   
    })
}

module.exports = {
    getMate: getMate,
}

// owner: {type: Schema.Types.ObjectId, ref: 'User', index: true,},
// images: [{type: String}],
// title: {type: String},
// message: {type: String},
// memberLimit: {type: Number, default: 4},
// member: {type: Schema.Types.ObjectId, ref: 'MateJoin'},
// locationStr: {type: String},
// loc: { type: {type:String}, coordinates: [Number]},
// tags: [{type: Schema.Types.ObjectId, ref: 'Tag', index: true}],
// reply: [{type: Schema.Types.ObjectId, ref: 'Reply'}],
// isShow: {type:Boolean, default:true},
// createdAt: {type: Date, default: Date.now}