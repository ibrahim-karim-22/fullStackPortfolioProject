const express = require('express');
const communicationRouter = express.Router();
const Communication  = require('../models/communicationSchema')

const authenticate = require('../authenticate');

 
communicationRouter.route('/')
.get((req, res, next) => {
  Communication.find()
    .then(communications => res.status(200).json(communications))
    .catch(err => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
  Communication.create(req.body)
    .then(communication => res.status(200).json(communication))
    .catch(err => next(err));
});

communicationRouter.route('/:userId')
.get((req, res, next) => {
  Communication.find({ $or: [{ senderId: req.params.userId }, { receiverId: req.params.userId }] })
    .then(communications => res.status(200).json(communications))
    .catch(err => next(err));
})
.delete(authenticate.verifyUser, (req, res, next) => {
  Communication.deleteMany({ $or: [{ senderId: req.params.userId }, { receiverId: req.params.userId }] })
    .then(communication => res.status(200).json(communication))
    .catch(err => next(err));
});

  module.exports = communicationRouter;
