const express = require('express');
const path = require('path');
const welcomeRouter = express.Router();

welcomeRouter.route('/').get((req, res) => {
  const welcomeFilePath = path.join(__dirname, './screens/WelcomeScreen.js');
  res.sendFile(welcomeFilePath);
});

module.exports = welcomeRouter;
