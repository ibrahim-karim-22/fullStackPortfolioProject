const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const createError = require('http-errors');
const path = require('path')
const logger = require('morgan');
const cookieParser = require('cookie-parser')

const userRouter = require('./routes/users');
const locationRouter = require('./routes/locations');
const communicationRouter = require('./routes/communication');

const hostname = 'localhost';
const port = 3000;

const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.use(express.static(__dirname + '/public'));

const url = 'mongodb+srv://ib2ra2heem:iIgcgNvNscGlbEeE@locationapp.zdepmos.mongodb.net/?retryWrites=true&w=majority&appName=LocationApp';
mongoose.connect(url, { useNewUrlParser: true, })
  .then(() => console.log('Connected to server'))
  .catch(err => console.log(err));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


//middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Routes
app.use('/users', userRouter);
app.use('/locations', locationRouter);
app.use('/communication', communicationRouter);

// catch 404 and forward to error handler
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

// Start the server
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})
