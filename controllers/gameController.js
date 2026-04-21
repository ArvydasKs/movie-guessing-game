const tmdbService = require("../services/tmdbService");
const gameState = require("../data/gameState");

async function startGame(req, res) {
    const movie = await tmdbService.getRandomMovie(gameState.usedMovies);

    gameState.movie = movie;
    gameState.attempts = 4;
    gameState.hintIndex = 0;
    gameState.gameOver = false;
    gameState.usedMovies.push(movie.id);

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

    if (!userGuess || userGuess.trim() === "") {
        return res.json({ message: "Empty guess is not allowed." });
    }

    if (userGuess.toLowerCase() === gameState.movie.title.toLowerCase()) {
        gameState.gameOver = true;

        return res.json({
            message: "Congratulations!\nYou've guessed the movie!",
            attempts: gameState.attempts
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

        return res.json({
            message: `Game over!\nThe correct answer was "${gameState.movie.title}"`,
            attempts: 0,
            hint: null
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