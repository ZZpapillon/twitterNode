const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
  content: {
    type: String,
    
    maxlength: 280 // Twitter's maximum tweet length
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String
  },
  videoUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  retweets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet'
  }],
  // If this tweet is a reply to another tweet
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet'
  },
  // If this tweet is a retweet of another tweet
  retweetedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet'
  }
  // You can add more fields as needed, such as images, videos, hashtags, etc.
});

const Tweet = mongoose.model('Tweet', tweetSchema);

module.exports = Tweet;