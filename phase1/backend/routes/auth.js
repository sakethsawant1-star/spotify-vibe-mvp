const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
  res.status(200).json({ message: 'Auth login endpoint placeholder' });
});

router.get('/callback', (req, res) => {
  res.status(200).json({ message: 'Auth callback endpoint placeholder' });
});

module.exports = router;
