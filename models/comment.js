const mongoose = require('mongoose');

const Schema = mongoose.Schema

var commentSchema = new Schema({
    _id: Schema.Types.ObjectId,
    name: { type: String },
    body: { type: String },
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    date: { type: Date, default: Date.now() },
});

var Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment