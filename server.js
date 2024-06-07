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
import Location from './models/locationSchema';

const welcomeRouter = require('./routes/home');
const userRouter = require('./routes/users');
const locationRouter = require('./routes/locations');
const communicationRouter = require('./routes/communication');


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
    cookie: { maxAge: 3650 }
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

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const port = process.env.PORT || 8081;
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const io = socketio(server);

io.on ('connection', (socket) => {
  console.log('a user connected');
// console.log('Socket URL:', socket.handshake.url);
  socket.on('updateLocation', async(data) => {
   try {
    const { userId, coordinates } = data;
    const location = new Location({
      userId: userId,
      coordinates: {
        type: 'Point',
        coordinates,
      },
      timestamp: new Date(),
    });
    await location.save();
    socket.broadcast.emit('updateLocation', data);
   } catch (err) {
    console.error('Error updating location: ', err);
   }
  })

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});


module.exports = app;
