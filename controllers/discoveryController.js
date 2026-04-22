function _readListFromCookie(req) {
    const raw = req.cookies && req.cookies.discoveries;
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
}

function _writeListToCookie(res, list) {
    try {
        res.cookie('discoveries', JSON.stringify(list), { httpOnly: false, maxAge: 10*365*24*60*60*1000 });
    } catch (e) {}
}

function listDiscoveries(req, res) {
    const items = _readListFromCookie(req);
    res.json(items);
}

function addDiscovery(req, res) {
    const movie = req.body;
    if (!movie || !movie.id || !movie.title) {
        return res.status(400).json({ error: 'Invalid movie payload' });
    }

    const list = _readListFromCookie(req);
    if (list.find(m => Number(m.id) === Number(movie.id))) {
        return res.status(409).json({ error: 'Movie already saved' });
    }

    const item = {
        id: movie.id,
        title: movie.title,
        year: movie.year || '',
        poster_path: movie.poster_path || null,
        tmdb_url: movie.tmdb_url || (movie.id ? `https://www.themoviedb.org/movie/${movie.id}` : null)
    };

    list.unshift(item);
    _writeListToCookie(res, list);
    res.status(201).json({ success: true });
}

function removeDiscovery(req, res) {
    const id = req.params && req.params.id;
    if (!id) return res.status(400).json({ error: 'Missing id' });

    const list = _readListFromCookie(req);
    const idx = list.findIndex(m => String(m.id) === String(id));
    if (idx === -1) return res.status(404).json({ error: 'Not found' });

    list.splice(idx, 1);
    _writeListToCookie(res, list);
    res.json({ success: true });
}

module.exports = { listDiscoveries, addDiscovery, removeDiscovery };
