const express = require('express');
const mongoose = require('mongoose');
const createError = require('http-errors');
const path = require('path');
const logger = require('morgan');
const passport = require('passport');
const config = require('./config');
const session = require('express-session');
const http = require('http');
const socketio = require('socket.io');
const Location = require('./models/locationSchema');
const Group = require('./models/groupSchema');
const Communication = require('./models/communicationSchema');
const User = require('./models/userSchema');
const welcomeRouter = require('./routes/home');
const userRouter = require('./routes/users');
const locationRouter = require('./routes/locations');
const communicationRouter = require('./routes/communication');
const {v4: uuidv4} = require('uuid');

const url = config.MONGO_KEY;
mongoose.set('strictQuery', false);
const connect = mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

connect.then(
  () => console.log('Connected correctly to server'),
  err => console.log(err),
);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(
  session({
    secret: config.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24},
  }),
);

app.use(passport.initialize());

app.use('/', welcomeRouter);
app.use('/users', userRouter);
app.use('/locations', locationRouter);
app.use('/communication', communicationRouter);

app.use(express.static(path.join(__dirname + '/public')));

app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  const title = 'Error';
  res.status(err.status || 500);
  res.render('error', {title: title});
});

const port = process.env.PORT || 8081;
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const io = socketio(server);

io.on('connection', socket => {
  console.log('a user connected');

  socket.on('createGroup', async ({groupName, userId, username}) => {
    try {
      const accessKey = uuidv4().substring(0, 8);
      const group = new Group({
        accessKey,
        groupName: groupName || 'My Group',
        members: [userId],
      });
      await group.save();
      socket.join(accessKey);
      socket.emit('groupCreated', {accessKey, userId, username});
    } catch (err) {
      console.error('Error creating group:', err);
      socket.emit('error', {
        message: 'Failed to create group',
        error: err.message,
      });
    }
  });

  socket.on('joinGroup', async ({accessKey, userId, username}) => {
    try {
      const group = await Group.findOne({accessKey});
      if (group) {
        if (!group.members.includes(userId)) {
          group.members.push(userId);
          await group.save();
        }
        socket.join(accessKey);
        socket.emit('groupJoined', {
          accessKey,
          userId,
          username,
          groupName: group.groupName,
        });
        io.to(accessKey).emit('userJoined', {userId, username});
        console.log(
          `User ${userId} joined group ${group.groupName} with access key ${accessKey}`,
        );
      } else {
        socket.emit('error', {message: 'Group not found'});
      }
    } catch (err) {
      console.error('Error joining group:', err);
      socket.emit('error', {
        message: 'An error occurred while processing your request',
        error: err.message,
      });
    }
  });

  socket.on('updateLocation', async data => {
    try {
      const {userId, coordinates, accessKey} = data;
      if (!userId || !coordinates || !accessKey) {
        socket.emit('error', {message: 'Invalid data'});
        return;
      }
      const location = new Location({
        userId,
        coordinates: {type: 'Point', coordinates},
        timestamp: new Date(),
      });
      await location.save();
      io.to(accessKey).emit('locationUpdated', {
        userId,
        coordinates,
        username: data.username,
      });
      console.log(`Location update from user ${userId}: ${coordinates}`);
    } catch (err) {
      console.error('Error updating location:', err);
      socket.emit('error', {
        message: 'Failed to update location',
        error: err.message,
      });
    }
  });

  socket.on('sendMessage', async data => {
    try {
      const {senderId, message, accessKey, timestamp} = data;
      if (!senderId || !message || !accessKey || !timestamp) {
        socket.emit('error', {message: 'Invalid data'});
        return;
      }
      const user = await User.findById(senderId);
      if (!user) {
        socket.emit('error', {message: 'User not found'});
        return;
      }
      const newMessage = new Communication({
        senderId,
        username: user.username,
        message,
        timestamp,
      });
      await newMessage.save();
      io.to(accessKey).emit('newMessage', {
        ...newMessage.toObject(),
        username: user.username,
      });
      console.log(`Message from ${user.username}: ${message}`);
    } catch (err) {
      console.error('Error sending message:', err);
      socket.emit('error', {
        message: 'Failed to send message',
        error: err.message,
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

module.exports = app;
