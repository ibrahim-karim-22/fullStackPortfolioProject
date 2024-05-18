const express = require('express');
const userRouter = express.Router();

userRouter
  .route('/')
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
  })

  .get((req, res) => {
    res.end('here is the list for all the users');
  })

  .post((req, res) => {
    res.end('user created successfully');
  });

userRouter
  .route('/:userId')
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
  })

  .get((req, res) => {
    res.end('here is the user info');
  })

  .put((req, res) => {
    res.write("updating...")
    res.end("updated user's details");
  })

  .delete((req, res) => {
    res.end('user has been deleted');
  });

  module.exports = userRouter;
