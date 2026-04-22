const tmdbService = require("../services/tmdbService");
const gameState = require("../data/gameState");

async function startGame(req, res) {
    const movie = await tmdbService.getRandomMovie(gameState.usedMovies);

    gameState.movie = movie;
    gameState.attempts = 4;
    gameState.hintIndex = 0;
    gameState.gameOver = false;
    gameState.usedMovies.push(movie.id);

    if (!req.cookies || !req.cookies.stats) {
        res.cookie('stats', JSON.stringify({ wins: 0, losses: 0}), { httpOnly: true, maxAge: 10*365*24*60*60*1000 });
    }

    res.json({
        synopsis: movie.synopsis,
        attempts: gameState.attempts
    });
}

function makeGuess(req, res) {
    const userGuess = req.body.guess;

    if (!gameState.movie) {
        return res.json({ message: "Please start a new game first." });
    }

    if (gameState.gameOver) {
        return res.json({ message: "Game over! Please start a new game." });
    }

    if (userGuess.toLowerCase() === gameState.movie.title.toLowerCase()) {
        gameState.gameOver = true;

        const raw = req.cookies && req.cookies.stats;
        let stats = { wins : 0, losses : 0};
        try { if (raw) stats = JSON.parse(raw); } catch (e) {}
        stats.wins = (stats.wins || 0) + 1;
        res.cookie('stats', JSON.stringify(stats), { httpOnly: true, maxAge: 10*365*24*60*60*1000 });

        return res.json({
            message: `Congratulations!\nYou've guessed the movie "${gameState.movie.title}"!`,
            attempts: gameState.attempts,
            stats,
            movie: {
                id: gameState.movie.id,
                title: gameState.movie.title,
                year: gameState.movie.release_date ? gameState.movie.release_date.split('-')[0] : '',
                poster_path: gameState.movie.poster_path || null,
                tmdb_url: gameState.movie.id ? `https://www.themoviedb.org/movie/${gameState.movie.id}` : null
            }
        });
    }

    gameState.attempts--;

    let hint = null;

    if (gameState.attempts > 0 && gameState.hintIndex < gameState.movie.hints.length) {
        hint = gameState.movie.hints[gameState.hintIndex];
        gameState.hintIndex++;
    }

    if (gameState.attempts <= 0) {
        gameState.gameOver = true;

        const raw = req.cookies && req.cookies.stats;
        let stats = { wins : 0, losses : 0};
        try { if (raw) stats = JSON.parse(raw); } catch (e) {}
        stats.losses = (stats.losses || 0) + 1;
        res.cookie('stats', JSON.stringify(stats), { httpOnly: true, maxAge: 10*365*24*60*60*1000 });

        return res.json({
            message: `Game over!\nThe correct answer was "${gameState.movie.title}"`,
            attempts: 0,
            hint: null,
            movie: {
                id: gameState.movie.id,
                title: gameState.movie.title,
                year: gameState.movie.release_date ? gameState.movie.release_date.split('-')[0] : '',
                poster_path: gameState.movie.poster_path || null,
                tmdb_url: gameState.movie.id ? `https://www.themoviedb.org/movie/${gameState.movie.id}` : null
            }
        });
    }

    res.json({
        attempts: gameState.attempts,
        hint
    });
}

module.exports = {
    startGame,
    makeGuess
};