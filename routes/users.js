const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/userSchema');
const userRouter = express.Router();

userRouter
  .route('/')
  .get((req, res, next) => {
    User.find()
      .then(users => res.status(200).json(users))
      .catch(err => next(err));
  })

userRouter
.route('/signup')
.post(async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    next(error);
  } 
});
  
  

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