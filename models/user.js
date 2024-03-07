const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true },
  bio: { type: String, required: false },
  profilePicture: { type: String, required: false },
  backgroundPicture: { type: String, required: false },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});



const User = mongoose.model('User', userSchema);

module.exports = User;