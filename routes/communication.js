const express = require('express');
const communicationRouter = express.Router();


  communicationRouter.route('/')
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
  })

  .get((req, res) => {
    res.end('here is the list for all the users messages');
  })

  .post((req, res) => {
    res.end('new message is created by user');
  });

communicationRouter
  .route('/:userId')
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
  })

  .get((req, res) => {
    res.end('messages from a specific user');
  })

  .delete((req, res) => {
    res.end('user message has been deleted');
  });

  module.exports = communicationRouter;
