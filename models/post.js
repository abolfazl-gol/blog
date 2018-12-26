const mongoose = require('mongoose');

const Schema = mongoose.Schema

var postSchema = new Schema({
    _id: Schema.Types.ObjectId,
    title: { type: String, required: true },
    body: String,
    slug: { type: String },
    likes: { type: Number },
    date: { type: Date, default: Date.now() },
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    blog: { type: Schema.Types.ObjectId, ref: 'Blog' },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
});

var Post = mongoose.model('Post', postSchema)

module.exports = Post