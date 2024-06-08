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
const welcomeRouter = require('./routes/home');
const userRouter = require('./routes/users');
const locationRouter = require('./routes/locations');
const communicationRouter = require('./routes/communication');
const { v4: uuidv4 } = require('uuid');



const url = config.MONGO_KEY;
mongoose.set('strictQuery', false);
const connect = mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});

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
const accessKey = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const length = 8; // Adjust the length as needed
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

io.on ('connection', (socket) => {
  console.log('a user connected');
// console.log('Socket URL:', socket.handshake.url);
  socket.on('createGroup', async(data) => {
    try {
      const newAccessKey = accessKey();
      const group = new Group({ accessKey: newAccessKey });
      await group.save();
      socket.broadcast.emit('groupCreated', data);
    } catch (err) {
      console.error('Error creating group: ', err);
    }
  });

  socket.on('joinGroup', async(data) => {
    try {
      const { accessKey } = data;
      const group = await Group.findOne({ accessKey });
      if (group) {
        socket.join(accessKey);
        socket.emit('groupJoined', { groupId: group._id });
      } else {
        socket.emit('error', {message: 'invalid access key'});
      }
    } catch (err) {
      console.error('Error joining group: ', err);
    }
  });

  socket.on('updateLocation', async(data) => {
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
    // socket.broadcast.emit('updateLocation', data);
    io.to(accessKey).emit('locationUpdated', { userId, coordinates });
   } catch (err) {
    console.error('Error updating location: ', err);
   }
  })

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});


module.exports = app;
