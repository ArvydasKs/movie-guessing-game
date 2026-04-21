const express = require('express');
const router = express.Router();

const gameController = require('../controllers/gameController');

router.get('/start', gameController.startGame);
router.post('/guess', gameController.makeGuess);

module.exports = router;