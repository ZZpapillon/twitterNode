const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config()

exports.register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

       const defaultProfilePicture = 'https://res.cloudinary.com/duvnbonci/image/upload/YourFolderName/xnilgdvqynzukz5xo8m1';
       const defaultBackgroundPicture = 'https://res.cloudinary.com/duvnbonci/image/upload/YourFolderName/vhb68lagupw92rya1v0h';


       const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            profilePicture: defaultProfilePicture, 
            backgroundPicture: defaultBackgroundPicture 
        });
        await newUser.save();

        // Generate JWT token for the newly registered user
        const token = jwt.sign({ id: newUser._id, username: newUser.firstName }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Return the token along with success message
        res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        const token = jwt.sign({ id: user._id, username: user.firstName }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        next(error);
    }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    // Fetch all users from the database
    const users = await User.find({}, { password: 0 }); // Exclude password field from the response

    res.status(200).json(users); // Send the retrieved users as a JSON response
  } catch (error) {
    // Handle any errors that occur during the process
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId, { password: 0 }); // Exclude password from the result
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateUser = async (req, res, next) => {
    console.log(req.files); 
  try {
    const userId = req.params.id;
    const { firstName, lastName, bio } = req.body;
    const updateData = { firstName, lastName, bio };

    if (req.files['profilePicture']) {
      updateData.profilePicture = req.files['profilePicture'][0].path;
    }
    if (req.files['backgroundPicture']) {
      updateData.backgroundPicture = req.files['backgroundPicture'][0].path;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

exports.followUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { followId } = req.body;

    // Check if the user is trying to follow themselves
    if (userId === followId) {
      return res.status(400).json({ message: "You cannot follow yourself." });
    }

    // First, update the following list of the current user
    const user = await User.findByIdAndUpdate(userId, { $addToSet: { following: followId } }, { new: true }).populate('following followers', '-password');
    
    // Then, update the followers list of the user being followed
    const followedUser = await User.findByIdAndUpdate(followId, { $addToSet: { followers: userId } }, { new: true }).populate('following followers', '-password');

    if (!user || !followedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ user, followedUser });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.unfollowUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { followId } = req.body;

    // Check if the user is trying to unfollow themselves
    if (userId === followId) {
      return res.status(400).json({ message: "You cannot unfollow yourself." });
    }

    // First, update the following list of the current user
    const user = await User.findByIdAndUpdate(userId, { $pull: { following: followId } }, { new: true }).populate('following followers', '-password');
    
    // Then, update the followers list of the user being unfollowed
    const unfollowedUser = await User.findByIdAndUpdate(followId, { $pull: { followers: userId } }, { new: true }).populate('following followers', '-password');

    if (!user || !unfollowedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ user, unfollowedUser });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

