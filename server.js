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
const welcomeRouter = require('./routes/home');
const userRouter = require('./routes/users');
const locationRouter = require('./routes/locations');
const communicationRouter = require('./routes/communication');
const { v4: uuidv4 } = require('uuid');

const url = config.MONGO_KEY;
mongoose.set('strictQuery', false);
const connect = mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

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
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: config.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  }),
);

app.use(passport.initialize());

app.use("/", welcomeRouter);
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
  res.render('error', { title: title });
});

const port = process.env.PORT || 8081;
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const io = socketio(server);


io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('createGroup', async ({ groupName }) => {
    try {
      const accessKey = uuidv4().substring(0, 8);
      const group = new Group({
        accessKey,
        groupName: groupName || 'My Group',
        members: [],
      });
      await group.save();
      socket.emit('groupCreated', { accessKey });
    } catch (err) {
      console.error('Error creating group:', err);
      socket.emit('error', { message: 'Failed to create group' });
    }
  });

  socket.on('joinGroup', async ({ accessKey, userId }) => {
    try {
      const group = await Group.findOne({ accessKey });
  
      if (group) {
        const existingMember = group.members.includes(userId);
        if (!existingMember) {
          group.members.push(userId);
          await group.save();
          socket.emit('groupJoined', { accessKey });
        } else {
          socket.emit('groupJoined', { accessKey });
        }
        socket.join(accessKey);
      } else {
        socket.emit('error', { message: 'Group not found' });
      }
    } catch (err) {
      console.error('Error joining group:', err.message);
      socket.emit('error', { message: 'An error occurred while processing your request' });
    }
  });

  socket.on('updateLocation', async (data) => {
    try {
      const { userId, coordinates, accessKey } = data;
      const location = new Location({
        userId: userId,
        coordinates: {
          type: 'Point',
          coordinates,
        },
        timestamp: new Date(),
      });
      await location.save();
      io.to(accessKey).emit('locationUpdated', { userId, coordinates });
    } catch (err) {
      console.error('Error updating location:', err);
      socket.emit('error', { message: 'Failed to update location', error: err });
    }
  });

  socket.on('sendMessage', async (data) => {
    try {
      const { senderId, message, accessKey, timestamp } = data;
      const newMessage = new Communication({ senderId, message, timestamp });
      await newMessage.save();
      io.to(accessKey).emit('newMessage', newMessage); // Broadcast the message to the group room
    } catch (err) {
      console.error('Error sending message:', err);
      socket.emit('error', { message: 'Failed to send message', error: err });
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

module.exports = app;