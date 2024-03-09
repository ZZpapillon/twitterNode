const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinaryConfig');


const upload = multer({ storage });

// const upload = multer({
//   storage: multer.diskStorage({
//     destination: 'uploads/pictures', // Use the same directory for tweet media
//     filename: (req, file, cb) => {
//       cb(null, Date.now() + '-' + file.originalname); // Naming convention for files
//     },
//   }),
// });

const { createTweet, getAllTweets, getTweetById, deleteTweet, likeTweet, retweet, unretweet, postReply, getReplies } = require('../controllers/tweetController');
const verifyToken = require('../middlewares/verifyToken');

// POST route for creating a new tweet
router.post('/tweet', verifyToken, upload.single('media'), createTweet);

// GET route for fetching all tweets
router.get('/tweets', verifyToken, getAllTweets);

// GET route for fetching a single tweet
router.get('/tweet/:id', verifyToken, getTweetById);



// DELETE route for deleting a tweet
router.delete('/tweet/:id', verifyToken, deleteTweet);

router.post('/tweet/:id/like', verifyToken, likeTweet);

router.post('/tweet/:id/retweet', verifyToken, retweet);

router.post('/tweet/:id/unretweet', verifyToken, unretweet);

router.post('/tweet/:id/reply', verifyToken, upload.single('media'), postReply);

router.get('/tweet/:id/replies', verifyToken, getReplies);

module.exports = router;

