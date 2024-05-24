const express = require('express');
const { User } = require('../models/Schema');
const userRouter = express.Router();

userRouter
  .route('/')
  .get((req, res, next) => {
    User.find()
      .then(users => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.json(users);
      })
      .catch(err => next(err));
  })

  .post((req, res, next) => {
    User.create(req.body) 
      .then(user => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(user);
      })
      .catch(err => next(err));
  })

userRouter
  .route('/:userId')
  .get((req, res, next) => {
    User.findById(req.params.userId)
      .then(user => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.json(user);
      })
      .catch(err => next(err));
  })

  .delete((req, res, next) => {
    User.findByIdAndDelete(req.params.userId)
      .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
      })
      .catch(err => next(err));
  });



  module.exports = userRouter;