const express = require('express');
const locationRouter = express.Router();

locationRouter
  .route('/')
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/plain');
    next();
  })

  .get((req, res) => {
    res.end('list for all user locations');
  })

  .post((req, res) => {
    res.end('user id, latitude, longitude, and timestamp is updated to server');
  });

locationRouter
  .route('/:userId')
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
  })

  .get((req, res) => {
    res.end('user id, latitude, longitude, and timestamp from server');
  })

  .delete((req, res) => {
    res.end('user location record deleted');
  });

module.exports = locationRouter;
