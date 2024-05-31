const express = require('express');
const locationRouter = express.Router();
const Location = require('../models/locationSchema')
const authenticate = require('../authenticate');

locationRouter
  .route('/')
  .get((req, res, next) => {
    Location.find()
      .then(locations => res.status(200).json(locations))
      .catch(err => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    Location.create(req.body)
      .then(location => res.status(200).json(location))
      .catch(err => next(err));
  })

locationRouter
  .route('/:userId')
  .get((req, res, next) => {
    Location.find({ userId: req.params.userId })
      .then(locations => res.status(200).json(locations))
      .catch(err => next(err));
  })

  .delete(authenticate.verifyUser, (req, res, next) => {
    Location.deleteMany({ userId: req.params.userId })
      .then(result => res.status(200).json(result))
      .catch(err => next(err));
  });

module.exports = locationRouter;
