const mongoose = require('mongoose');

const Schema = mongoose.Schema

var blogSchema = new Schema({
  _id: Schema.Types.ObjectId,
  title: { type: String, required: true },
  description: String,
  name: { type: String, unique: true, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }]
});

var Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog