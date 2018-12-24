const mongoose = require('mongoose');

const Schema = mongoose.Schema

var userSchema = new Schema({
    _id: Schema.Types.ObjectId,
    name: { type: String, required: true },
    email: { type: String, index: true, required: true, unique: true },
    password: { type: String, required: true },
    blogs: [{ type: Schema.Types.ObjectId, ref: 'Blog' }]
});

var User = mongoose.model('User', userSchema)

module.exports = User