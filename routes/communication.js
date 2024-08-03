const express = require('express');
const communicationRouter = express.Router();
const Communication = require('../models/communicationSchema');
const authenticate = require('../authenticate');

communicationRouter
  .route('/')
  .get((req, res, next) => {
    Communication.find()
      .populate('senderId', 'username')
      .then(communications => res.status(200).json(communications))
      .catch(err => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    const {senderId, accessKey, message} = req.body;
    Communication.create({senderId, accessKey, message})
      .then(communication => res.status(200).json(communication))
      .catch(err => next(err));
  });

communicationRouter
  .route('/byUser/:userId')
  .get((req, res, next) => {
    Communication.find({senderId: req.params.userId})
      .populate('senderId', 'username')
      .then(communications => res.status(200).json(communications))
      .catch(err => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Communication.updateMany(
      {senderId: req.params.userId},
      {$set: {message: ''}},
    )
      .then(result => res.status(200).json(result))
      .catch(err => next(err));
  });

communicationRouter.route('/byAccessKey/:accessKey').get((req, res, next) => {
  Communication.find({accessKey: req.params.accessKey})
    .populate('senderId', 'username')
    .then(communications => res.status(200).json(communications))
    .catch(err => next(err));
});

module.exports = communicationRouter;
