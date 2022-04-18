var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const schema = new Schema({
    email: {type: String, require: true, index: true},
    identifyId: {type: String, unique: true, require: true},
    nickName: {type: String, default: null},
    gender: {type: Boolean, default: null },
    age: {type: Number, default: null },
    height: {type: Number, default: null },
    weight: {type: Number, default: null },
    secureLevel: {type: Number, default: 0}, // 0: 일반유저, 10: Admin
    pictureMe: {type: String, default: null },
    aboutMe: {type: String, default: "." },
    // step: {type: Number, default: 0},
    // loginType: {type: Number, default: 0}, //0: 가입, 1: 구글로그인, 2: 페이스북, 3: 카카오톡, 4: 애플, 
    // useStop: {type: Boolean, default: false},
    // stopReason: {type: Number, default: -1}, //0: 이상한 사진 업로드, 1: 욕설, 비하, 폭언 등, 2:무분별한 신고, 3:버그 악용, 4:계정 도용
    pushToken: {type: String, default: null},
    // hasAward: {type: Number, default: 0},
    setting: {type: Schema.Types.ObjectId, ref: 'Setting', default:null},
    mate: [{type: Schema.Types.ObjectId, ref: 'Mate'}],
    mateJoin: [{type: Schema.Types.ObjectId, ref: 'MateJoin'}],
    mateRoom: [{type: Schema.Types.ObjectId, ref: 'MateRoom'}],
    // dress: [{type: Schema.Types.ObjectId, ref: 'Dress'}],
    // reportDress: [{type: Schema.Types.ObjectId, ref: 'Dress'}],
    // blockUser: [{type: Schema.Types.ObjectId, ref: 'User'}],
    // reply: [{type: Schema.Types.ObjectId, ref: 'Reply'}],
    // likeDress: [{type: Schema.Types.ObjectId, ref: 'Dress'}],
    createdAt: {type: Date, default: Date.now}
}, {
    versionKey: false 
});


module.exports = mongoose.model('User', schema);
