var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const schema = new Schema({
    dressId: {type: Schema.Types.ObjectId, ref: 'Dress', index: true,},
    startDate: {type: Date, default: Date.now},
    endDate: {type: Date, default: Date.now},
    rank: {type: Number, default: -1},
    createdAt: {type: Date, default: Date.now}
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

module.exports = mongoose.model('AwardSnapshot', schema);
