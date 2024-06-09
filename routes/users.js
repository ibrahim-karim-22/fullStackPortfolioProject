const express = require('express');
const bcrypt = require('bcrypt');
const passport = require("passport");
const User = require('../models/userSchema');
const authenticate = require('../authenticate');

const userRouter = express.Router();

userRouter
  .route('/')
  .get((req, res, next) => {
    User.find()
      .then(users => res.status(200).json(users))
      .catch(err => next(err));
  })

userRouter.route('/signup').post(async (req, res, next) => {
  try {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      firstname: req.body.firstname,
      lastname: req.body.lastname
    });
    await User.register(newUser, req.body.password);
    console.log('User registered successfully:', newUser);
    res.status(201).json({ success: true, status: 'Registration Successful!' });
  } catch (err) {
    if (err.name === 'UserExistsError') {
      res.status(409).json({ success: false, message: 'Username already exists!' });
    } else {
      res.status(500).json({ success: false, message: 'Registration failed!' });
    }
  }
});

userRouter
  .route('/login')
  .post(passport.authenticate('local', { session: false }), async (req, res) => {
    console.log('req.user:', req.user);
    const token = authenticate.getToken({ _id: req.user._id });
    try {
      const user = await User.findById(req.user._id);
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found!' });
        }
        console.log('user found:', user);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({
          success: true,
          token: token,
          user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname
          },
          status: 'You are successfully logged in!',
        });
    } catch (err) {
        console.error('error fetching user:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: false, message: 'error getting user info' })
      }
  });

userRouter
  .route('/logout')
  .post((req, res, next) => {
    if (req.session) {
      req.session.destroy();
      res.clearCookie('session-id');
      res.redirect('/');
    } else {
      const err = new Error('You are not logged in!');
      err.status = 403;
      next(err);
    }
  })


userRouter
  .route('/:userId')
  .get(authenticate.verifyUser, (req, res, next) => {
    User.findById(req.params.userId)
      .then(user => res.status(200).json(user))
      .catch(err => next(err));
  })

  .delete(authenticate.verifyUser, (req, res, next) => {
    User.findByIdAndDelete(req.params.userId)
      .then(user => res.status(200).json(user))
      .catch(err => next(err));
  });


module.exports = userRouter;