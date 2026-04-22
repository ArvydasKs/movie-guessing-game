const express = require('express');
const router = express.Router();

const gameController = require('../controllers/gameController');
const discoveryController = require('../controllers/discoveryController');
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

router.get('/stats', (req, res) => {
	const raw = req.cookies && req.cookies.stats;
	let stats = { wins : 0, losses : 0};
	try { if (raw) stats = JSON.parse(raw); } catch (e) {}
	res.json(stats);
});

router.delete('/stats', (req, res) => {
    const stats = { wins: 0, losses: 0 };

    res.cookie('stats', JSON.stringify(stats), { httpOnly: true, maxAge: 10*365*24*60*60*1000 });
    res.json(stats);
});

router.get('/discoveries', discoveryController.listDiscoveries);
router.post('/discoveries', discoveryController.addDiscovery);
router.delete('/discoveries/:id', discoveryController.removeDiscovery);

module.exports = router;