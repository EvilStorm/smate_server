var mongoose = require('mongoose');
var ModelTag = require('../../models/model_tag');
var ModelMate = require('../../models/model_mate');
var ModelUser = require('../../models/model_user');
var DBConst = require('../../db/constant');
const ModelMateJoin = require('../../models/model_mate_join');


async function getMateDetail(uId, match={isShow: true}, page = 0, limitCount=DBConst.PAGE_COUNT, sort={createdAt: -1}) {

    var mate = await ModelMate.aggregate([
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
        {
            $project: {
                id: 1,
                title: 1,
                images: 1,
                message: 1,
                mateDate: 1,
                memberLimit: 1,
                locationStr: 1,
                createdAt: 1,
                loc: 1,
                isShow: 1,
                images: 1,
                tags: '$tag',
                member: '$mem',
                'owner._id': '$user._id',
                'owner.nickName': '$user.nickName',
                'owner.pictureMe': '$user.pictureMe',
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
  
    ]);
    console.log(` mate: ${JSON.stringify(mate)}`)
    return mate;

}


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
            {
                $project: {
                    id: 1,
                    title: 1,
                    images: 1,
                    message: 1,
                    mateDate: 1, 
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
    getMateDetail: getMateDetail,
}