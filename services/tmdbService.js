const axios = require('axios');

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

async function getRandomMovie(usedMovies) {

    const eras = [
        { gte: '1950-01-01', lte: '1969-12-31' },
        { gte: '1970-01-01', lte: '1989-12-31' },
        { gte: '1990-01-01', lte: '2009-12-31' },
        { gte: '2010-01-01', lte: '2019-12-31' },
        { gte: '2020-01-01', lte: '2026-12-31' }
    ];

    const chosen = eras[Math.floor(Math.random() * eras.length)];

    const response = await axios.get(`${BASE_URL}/discover/movie`, {
        params: {
            api_key: API_KEY,
            sort_by: "popularity.desc",
            vote_count_gte: 300,
            with_original_language: "en",

            "primary_release_date.gte": chosen.gte,
            "primary_release_date.lte": chosen.lte,

            page: Math.floor(Math.random() * 10) + 1
        }
    });

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
        id: movie.id,
        title: movie.title,
        synopsis: details.data.overview,
        poster_path: details.data.poster_path || null,
        release_date: details.data.release_date || null,
        hints: [
            `Release Year: ${year}`,
            director ? `Director: ${director.name}` : "Director: Unknown",
            mainActor ? `Starring: ${mainActor.name}` : "Main Actor: Unknown"
        ]
    };
}

async function searchMovies(query) {
    if (!query || !query.trim()) return [];
    try {
        const res = await axios.get(`${BASE_URL}/search/movie`, {
            params: {
                api_key: API_KEY,
                query,
                include_adult: false,
                page: 1
            }
        });

        return (res.data.results || []).map(m => ({
            id: m.id,
            title: m.title,
            year: m.release_date ? m.release_date.split('-')[0] : ''
        }));
    } catch (e) {
        return [];
    }
}

module.exports = {
    getRandomMovie,
    searchMovies
};