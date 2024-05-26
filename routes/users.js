const express = require('express');
const User = require('../models/userSchema');
const userRouter = express.Router();

userRouter
  .route('/')
  .get((req, res, next) => {
    User.find()
      .then(users => res.status(200).json(users))
      .catch(err => next(err));
  })

  .post((req, res, next) => {
    User.create(req.body) 
      .then(user => res.status(200).json(user))
      .catch(err => next(err));
  })

userRouter
  .route('/:userId')
  .get((req, res, next) => {
    User.findById(req.params.userId)
      .then(user => res.status(200).json(user))
      .catch(err => next(err));
  })

  .delete((req, res, next) => {
    User.findByIdAndDelete(req.params.userId)
      .then(user => res.status(200).json(user))
      .catch(err => next(err));
  });



  module.exports = userRouter;