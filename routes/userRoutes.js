const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinaryConfig');

const upload = multer({ storage });
// const upload = multer({
//   storage: multer.diskStorage({
//     destination: 'uploads/pictures',
//     filename: (req, file, cb) => {
//       cb(null, Date.now() + '-' + file.originalname);
//     },
//   }),
// });
//da


const { login, register, getAllUsers, getUser, updateUser, followUser, unfollowUser } = require('../controllers/userController');
const verifyToken = require('../middlewares/verifyToken');

// POST route for user login
router.post('/login', login);
// POST route for user registration
router.post('/register', register);
// GET route for fetching all users
router.get('/allUsers', verifyToken, getAllUsers);
router.get('/user/:id', verifyToken, getUser);
router.put('/user/:id', verifyToken, upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'backgroundPicture', maxCount: 1 }
]), updateUser);
router.post('/user/:id/follow', verifyToken, followUser);
router.post('/user/:id/unfollow', verifyToken, unfollowUser);
// POST route for user sign-out

module.exports = router;

