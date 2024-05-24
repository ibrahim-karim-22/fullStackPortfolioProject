const express = require('express');
const locationRouter = express.Router();
const { Location } = require('../models/Schema')

locationRouter
  .route('/')
  .get((req, res, next) => {
    Location.find()
      .then(locations => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(locations);
      })
      .catch(err => next(err));
  })
  .post((req, res, next) => {
    Location.create(req.body)
      .then(location => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(location)
      })
      .catch(err => next(err));
  })

locationRouter
  .route('/:userId')
  .get((req, res, next) => {
    Location.find({ userId: req.params.userId })
      .then(locations => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(locations)
      })
      .catch(err => next(err));
  })

  .delete((req, res, next) => {
    Location.deleteMany({ userId: req.params.userId })
      .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
      })
      .catch(err => next(err));
  });

module.exports = locationRouter;
