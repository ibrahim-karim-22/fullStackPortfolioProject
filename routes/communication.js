const express = require('express');
const communicationRouter = express.Router();
const { Communication } = require('../models/Schema')

 
communicationRouter.route('/')
.get((req, res, next) => {
  Communication.find()
    .then(communications => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(communications);
    })
    .catch(err => next(err));
})
.post((req, res, next) => {
  Communication.create(req.body)
    .then(communication => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(communication);
    })
    .catch(err => next(err));
});

communicationRouter.route('/:userId')
.get((req, res, next) => {
  Communication.find({ $or: [{ senderId: req.params.userId }, { receiverId: req.params.userId }] })
    .then(communications => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(communications);
    })
    .catch(err => next(err));
})
.delete((req, res, next) => {
  Communication.deleteMany({ $or: [{ senderId: req.params.userId }, { receiverId: req.params.userId }] })
    .then(response => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(response);
    })
    .catch(err => next(err));
});

  module.exports = communicationRouter;
