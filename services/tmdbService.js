const axios = require('axios');

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

async function getRandomMovie(usedMovies) {
    const response = await axios.get(`${BASE_URL}/discover/movie`,
        {
            params: {
                api_key: API_KEY,
                sort_by: "popularity.desc",
                vote_count_gte: 1000,
                with_original_language: "en",

                "primary_release_date.gte": "1970-01-01",
                "primary_release_date.lte": "2026-12-31",

                page: Math.floor(Math.random() * 10) + 1
            }
        }
    );

    const movies = response.data.results;
    const availableMovies = movies.filter(m => !usedMovies.includes(m.id));

    const pool = availableMovies.length > 0 ? availableMovies : movies;
    const movie = pool[Math.floor(Math.random() * pool.length)];

    const [details, credits] = await Promise.all([
        axios.get(`${BASE_URL}/movie/${movie.id}`, {
            params: { api_key: API_KEY }
        }),
        axios.get(`${BASE_URL}/movie/${movie.id}/credits`, {
            params: { api_key: API_KEY }
        })
    ]);

    const year = details.data.release_date ? details.data.release_date.split("-")[0] : "Unknown";
    const director = credits.data.crew?.find(person => person.job === "Director");
    const mainActor = credits.data.cast?.[0];

    return {
        title: movie.title,
        synopsis: details.data.overview,

        hints: [
            `Release Year: ${year}`,
            director ? `Director: ${director.name}` : "Director: Unknown",
            mainActor ? `Starring: ${mainActor.name}` : "Main Actor: Unknown"
        ]
    };
}

module.exports = {
    getRandomMovie
};