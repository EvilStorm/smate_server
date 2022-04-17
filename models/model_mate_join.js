var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const schema = new Schema({
    owner: {type: Schema.Types.ObjectId, ref: 'User', index: true,},
    mate: {type: Schema.Types.ObjectId, ref: 'Mate', index: true,},
    memberLimit: {type: Number, default: 4},
    member: [{type: Schema.Types.ObjectId, ref: 'User'}],
    joinMember: [{type: Schema.Types.ObjectId, ref: 'User'}],
    deniedMember: [{type: Schema.Types.ObjectId, ref: 'User'}],
    isShow: {type:Boolean, default:true},
    createdAt: {type: Date, default: Date.now}
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

module.exports = mongoose.model('MateJoin', schema);
