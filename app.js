var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const cron = require('node-cron');




const verifyToken = require('./middlewares/verifyToken')
const User = require('./models/user');
const Tweet = require('./models/tweet');
const Message = require('./models/message');
const Conversation = require('./models/conversation');



const userRouter = require('./routes/userRoutes');
const tweetRouter = require('./routes/tweetRoutes');
const messageRouter = require('./routes/messageRoutes');
const conversationRouter = require('./routes/conversationRoutes');


const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
    const mongoDB = process.env.MONGODB_URI;
    

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// Socket.IO setup




var app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
        cors: {
            origin: process.env.ORIGIN_URL, // Adjust the port to match your frontend's
            methods: ["GET", "POST"]
        }
    });



io.on('connection', (socket) => {
  console.log('New client connected');

  // When a user joins a conversation
  socket.on('joinConversation', (conversationId) => {
    console.log(`Joining conversation: ${conversationId}`);
    socket.join(conversationId);
  });

  // When a user sends a message
  socket.on('sendMessage', async (data) => {
    try {
      const { content, conversationId, senderId } = data;
      // Create and save the message to the database
      const message = new Message({
        content,
        conversation: conversationId,
        sender: senderId,
      });
      await message.save();

      // Emit the message to all users in the conversation
      io.to(conversationId).emit('newMessage', message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});


app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/uploads/pictures', express.static('uploads/pictures'));

app.use('/api', userRouter);
app.use('/api', tweetRouter);
app.use('/api', messageRouter);
app.use('/api', conversationRouter);

// Keep-Alive Route
app.get('/keep-alive', (req, res) => {
  res.status(200).send('OK');
});

// Schedule a cron job to ping the keep-alive route every 14 minutes
cron.schedule('*/14 * * * *', function() {
  console.log('Sending keep-alive ping');
  // Replace 'http://localhost:3000' with your actual server URL
  axios.get('https://twitternode.onrender.com')
    .then(response => console.log(`Keep-alive ping status: ${response.status}`))
    .catch(error => console.error('Error sending keep-alive ping:', error));
});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json('error');
});

module.exports = { app, server };
