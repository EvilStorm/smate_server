var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const schema = new Schema({
    dress: {type: Schema.Types.ObjectId, ref: 'Dress'},
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    tag: {type: Schema.Types.ObjectId, ref: 'Tag'},
    createdAt: {type: Date, default: Date.now, select: false},
}, {
    versionKey: false 
});


module.exports = mongoose.model('TagUseMap', schema);
