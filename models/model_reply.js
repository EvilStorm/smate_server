var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const schema = new Schema({
    owner: {type: Schema.Types.ObjectId, ref: 'User', index: true,},
    parent: {type: Schema.Types.ObjectId, ref: 'Dress', index: true,},
    say: {type: String},
    isShow: {type:Boolean, default:true},
    createdAt: {type: Date, default: Date.now}
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

module.exports = mongoose.model('Reply', schema);
