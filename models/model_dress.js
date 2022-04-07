var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const schema = new Schema({
    owner: {type: Schema.Types.ObjectId, ref: 'User', index: true,},
    images: {type: Object},
    say: {type: String},
    isAward: {type: Boolean, default: false},
    tags: [{type: Schema.Types.ObjectId, ref: 'Tag', index: true}],
    reply: [{type: Schema.Types.ObjectId, ref: 'Reply'}],
    like: [{type: Schema.Types.ObjectId, ref: 'User'}],
    cutByManager: {type: Number, default: -1},
    police: [{type: Schema.Types.ObjectId, ref: 'User'}],
    isShow: {type:Boolean, default:true},
    createdAt: {type: Date, default: Date.now}
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

module.exports = mongoose.model('Dress', schema);
