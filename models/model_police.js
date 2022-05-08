var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const schema = new Schema({
    owner: {type: Schema.Types.ObjectId, ref: 'User'},
    type: {type: Number, default: 0},
    reaseon: {type: Number, default: 0},
    message: {type: Number, default: 0},
    userId: {type: String},
    mateId: {type: String},
    createdAt: {type: Date, default: Date.now, select: false},
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

module.exports = mongoose.model('Police', schema);
