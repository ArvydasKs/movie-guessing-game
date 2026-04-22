const express = require('express');
const router = express.Router();

const gameController = require('../controllers/gameController');
const tmdbService = require('../services/tmdbService');

router.get('/start', gameController.startGame);
router.post('/guess', gameController.makeGuess);

router.get('/tmdb/search', async (req, res) => {
	const q = String(req.query.q || '');
	if (q.length < 2) return res.json([]);
	try {
		const results = await tmdbService.searchMovies(q);
			res.json(results);
	} catch (e) {
		res.status(500).json([]);
	}
});

module.exports = router;