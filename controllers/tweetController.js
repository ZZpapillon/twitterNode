const Tweet = require('../models/tweet');
const User = require('../models/user');
// Helper function to add full name to the author object
const addAuthorFullName = (author) => {
  return {
    ...author.toObject(),
    fullName: `${author.firstName} ${author.lastName}`
  };
};

// Create a new tweet
exports.createTweet = async (req, res) => {
  try {
    console.log("Request body:", req.body); // Log the request body for debugging
    const { content, authorId } = req.body;

    let mediaUrl = '';
     if (req.file) {
      // Use the URL provided by Cloudinary
      mediaUrl = req.file.path;
    }

    // Determine if the file is an image or a video based on the mimetype
    // This is a simplistic approach; adjust according to your needs
    const isImage = req.file && req.file.mimetype.startsWith('image/');
    const isVideo = req.file && req.file.mimetype.startsWith('video/');

    const newTweetData = {
      content,
      author: authorId,
      ...(isImage && { imageUrl: mediaUrl }),
      ...(isVideo && { videoUrl: mediaUrl }),
    };

    const newTweet = new Tweet(newTweetData);
    await newTweet.save();

    const author = await User.findById(authorId);
    const tweetWithFullName = {
      ...newTweet.toObject(),
      author: addAuthorFullName(author)
    };

    res.status(201).json(tweetWithFullName);
  } catch (error) {
    console.error("Error creating tweet:", error); // Log any errors
    res.status(400).json({ message: error.message });
  }
};
// Get a list of tweets
exports.getAllTweets = async (req, res) => {
  try {
    const tweets = await Tweet.find().populate('author');
    const tweetsWithFullName = tweets.map(tweet => ({
      ...tweet.toObject(),
      author: addAuthorFullName(tweet.author)
    }));
    res.status(200).json(tweetsWithFullName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single tweet by id
exports.getTweetById = async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id).populate('author');
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }
    const tweetWithFullName = {
      ...tweet.toObject(),
      author: addAuthorFullName(tweet.author)
    };
    res.status(200).json(tweetWithFullName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Delete a tweet
exports.deleteTweet = async (req, res) => {
  try {
    const tweet = await Tweet.findByIdAndDelete(req.params.id);
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }
    // No need to add full name for deletion confirmation
    res.status(200).json({ message: 'Tweet deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.likeTweet = async (req, res) => {
  const tweetId = req.params.id;
  const userId = req.user.id; // Assuming you have user information in req.user

  try {
    // Find the tweet by ID and check if the user has already liked it
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    // Check if the user has already liked the tweet
    const isLiked = tweet.likes.includes(userId);
    if (isLiked) {
      // User has already liked the tweet, so we'll remove the like
      tweet.likes.pull(userId);
    } else {
      // User hasn't liked the tweet yet, so we add their ID to the likes array
      tweet.likes.push(userId);
    }

    await tweet.save(); // Save the updated tweet document

    res.json({ message: isLiked ? 'Like removed' : 'Tweet liked', tweet });
  } catch (error) {
    console.error('Error liking tweet:', error);
    res.status(500).json({ message: 'Error liking tweet' });
  }
};
exports.retweet = async (req, res) => {
  const  tweetId  = req.params.id;
  const userId = req.user.id; // Assuming you have the user's ID from session/authentication middleware

  try {
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
      return res.status(404).send({ message: 'Tweet not found' });
    }

    // Check if the user has already retweeted the tweet
    if (tweet.retweets.includes(userId)) {
      return res.status(400).send({ message: 'You have already retweeted this post' });
    }

    // Add the user's ID to the retweets array
    tweet.retweets.push(userId);
    await tweet.save();

    res.status(200).send({ message: 'Tweet retweeted successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Failed to retweet', error: error.message });
  }
};


exports.unretweet = async (req, res) => {
   const  tweetId  = req.params.id;
  const userId = req.user.id; // Or however you're getting the user's ID, e.g., from a session

  try {
    const updatedTweet = await Tweet.findByIdAndUpdate(
      tweetId,
      { $pull: { retweets: userId } }, // Remove the user's ID from the retweets array
      { new: true } // Return the updated document
    );

    res.json(updatedTweet);
  } catch (error) {
    res.status(500).json({ message: 'Failed to unretweet' });
  }
};

exports.postReply = async (req, res) => {
  try {
    const { content } = req.body;
    const tweetId = req.params.id;

      let mediaUrl = '';
    if (req.file) {
      // Use the URL provided by Cloudinary
      mediaUrl = req.file.path;
    }

    // Determine if the file is an image or a video based on the mimetype
    const isImage = req.file && req.file.mimetype.startsWith('image/');
    const isVideo = req.file && req.file.mimetype.startsWith('video/');

    let reply = new Tweet({
      content: content,
      author: req.user.id,
      replyTo: tweetId,
      ...(isImage && { imageUrl: mediaUrl }),
      ...(isVideo && { videoUrl: mediaUrl }),
    });

    await reply.save();

    // Re-fetch the reply with author populated
    reply = await Tweet.findById(reply._id).populate('author');
    // Assuming addAuthorFullName is adjusted to work as needed or using virtuals
    const replyWithAuthorDetails = {
      ...reply.toObject(),
      author: {
        ...reply.author.toObject(),
        fullName: `${reply.author.firstName} ${reply.author.lastName}`, // Manually constructing fullName
        profilePicture: reply.author.profilePicture, // Assuming profilePicture is a field in your User model
      },
      ...(reply.imageUrl && { imageUrl: reply.imageUrl }),
      ...(reply.videoUrl && { videoUrl: reply.videoUrl }),
    };

    res.status(201).json(replyWithAuthorDetails);
  } catch (error) {
    res.status(500).json({ message: 'Failed to post reply', error: error.message });
  }
};

// Get replies for a tweet
exports.getReplies = async (req, res) => {
  try {
    const tweetId = req.params.id;
    const replies = await Tweet.find({ replyTo: tweetId })
      .populate('author')
      .exec();

    const repliesWithAuthorDetails = replies.map(reply => ({
      ...reply.toObject(),
      author: {
        ...reply.author.toObject(),
        fullName: `${reply.author.firstName} ${reply.author.lastName}`, // Manually constructing fullName
        profilePicture: reply.author.profilePicture
      }
    }));

    res.json(repliesWithAuthorDetails);
  } catch (error) {
    res.status(500).send(error);
  }
};