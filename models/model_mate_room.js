var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const schema = new Schema({
    owner: {type: Schema.Types.ObjectId, ref: 'User', index: true,},
    mate: {type: Schema.Types.ObjectId, ref: 'Mate', index: true,},
    member: [{type: Schema.Types.ObjectId, ref: 'User'}],
    memberMessage: [{type: String}],
    isShow: {type:Boolean, default:true},
    createdAt: {type: Date, default: Date.now}
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

module.exports = mongoose.model('MateRoom', schema);
