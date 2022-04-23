const ModelUser = require('../models/model_user');
const ModelMateRoom = require('../models/model_mate_room');

const MessageType = {
    SYSTEM: 'system',
    ACTION: 'action',
    REPLY: 'reply',
    LIKE: 'like',
    POSTING: 'posting',
    AWARD: 'award',
    CHAT: 'chat',
}

async function createMessage(targetId, type) {

    if(!MessageType) {
        throw new Error("MessageType is Not support!!!");
    }

    console.log(type)
    switch(type) {
        case MessageType.SYSTEM: 
            return await createSystemMessage(targetId, type);
        case MessageType.AWARD: 
            return await createAwardMessage(targetId, type);
        case MessageType.ACTION: 
            return await createActionMessage(targetId, type);
        case MessageType.REPLY: 
            return await createReplyMessage(targetId, type);
        case MessageType.LIKE: 
            return await createLikeMessage(targetId, type);
        case MessageType.CHAT: 
            return await createChatMessage(targetId, type);
        case MessageType.POSTING: 
            return await createPostingMessage(targetId, type);
    }
}

function createSystemMessage(targetId, msgType) {

}
function createActionMessage(targetId, msgType) {

}

const testToken = 'dZdc9ARjHQU:APA91bEjSyKWMnz7bEE4nhID8JWO263hw2TfuA8l6MT9TYb47737JPwLsOQyuEU9IQSIQFFjXYgVWaP5edAhZ2hGnf0IicZR5CH-A3rGIX4Pad-gy-cbZrBLJ78C6olvoAXzV1TWMMIO';


/**
 * Award 수신
 * @param {DailyDress Object ID} targetId 
 */
async function createAwardMessage(targetId, msgType) {
    var result = await ModelUser.findById(targetId).exec();

    var fcmToken = result.pushToken == null ? testToken: result.pushToken
    const pushInfos = {
        notification: {
            title: '뽄',
            body: '오늘의 뽄으로 선택되었어요!!.'
        },
        data:{
            type: msgType
        },
        token: fcmToken
    }
    return pushInfos;
}
/**
 * Chat Message
 * @param {Object ID} targetId 
 */
async function createChatMessage(targetId, msgType) {
    var result = await ModelMateRoom.findById(targetId)
    .populate('member', 'pushToken')
    .exec();

    var tokenList = [];
    for(var i=0; i<result.member.length; i++) {
        tokenList.push(result.member[i].pushToken);
    }
    console.log(tokenList);
    
    var fcmToken = result.pushToken == null ? testToken: result.pushToken
    const pushInfos = {
        notification: {
            title: '메시지',
            body: '신규 메시지가 왔어요.'
        },
        data:{
            type: msgType
        },
        tokens: tokenList
    }
    return pushInfos;
}


/**
 * 글에 댓글이 달렸을 때 메시지 
 * @param {DailyDress Object ID} targetId 
 */
async function createReplyMessage(targetId, msgType) {
    var result = await ModelUser.findById(targetId).exec();

    var fcmToken = result.pushToken == null ? testToken: result.pushToken
    const pushInfos = {
        notification: {
            title: '스타일메이트',
            body: '내 스타일을 좋아하는 분이 있나봐요. 뎃글이 달렸어요!!.'
        },
        data:{
            type: msgType
        },
        token: fcmToken
    }
    return pushInfos;
}

/**
 * 좋아요 알림. 
 * @param {DailyDress Object ID} targetId 
 */
async function createLikeMessage(targetId, msgType) {
    var result = await ModelUser.findById(targetId);

    var fcmToken = result.pushToken == null?  testToken: result.pushToken
    const pushInfos = {
        notification: {
            title: '스타일메이트',
            body: '내 스일을 좋아하는 분이 있나봐요. 하트하트!'
        },
        data:{
            type: msgType
        },
        token: fcmToken
    }

    return pushInfos;

}

/**
 * 사용자가 옷 등록 시 참고하는 사람들에게 알림을 보낸다. 
 * @param {사용자 ID} targetId 
 */
function createPostingMessage(targetId, msgType) {
       
}

module.exports = {
    MessageType: MessageType,
    createMessage: createMessage,
}
