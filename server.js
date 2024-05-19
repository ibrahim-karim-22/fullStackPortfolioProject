const express = require('express');
const morgan = require('morgan');
const userRouter = require('./routes/users');
const locationRouter = require('./routes/locations');
const communicationRouter = require('./routes/communication');

hostname = 'localhost';
const port = 3000;

const app = express();
app.use(morgan('dev'));
app.use(express.json());

app.use('/users', userRouter);
app.use('/locations', locationRouter);
app.use('/communication', communicationRouter);

app.use(express.static(__dirname + '/public'));

app.use((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end('<html><body><h1>Portfolio Project</h1></body></html>');
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
