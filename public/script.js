async function startGame() {
    const res = await fetch("/game/start");
    const data = await res.json();
    document.getElementById("synopsis").innerText = data.synopsis;
    document.getElementById("attempts").innerText = data.attempts;

    const attemptsContainer = document.getElementById('attemptsContainer');
    if (attemptsContainer) attemptsContainer.classList.remove('invisible');

        document.getElementById("result").innerText = "";
        window._hintsShown = [];
    document.getElementById("guessInput").value = "";

    setControlsEnabled(true);
    document.getElementById("guessInput").focus();
    const saveBtn = document.getElementById('saveDiscoveryBtn');
    if (saveBtn) {
        saveBtn.style.display = 'none';
        saveBtn.disabled = true;
    }
    window._lastMovie = null;
}

async function makeGuess() {
    const guess = document.getElementById("guessInput").value.trim();

    const res = await fetch("/game/guess", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ guess })
    });

    const data = await res.json();
        if (data.hint) {
            window._hintsShown = window._hintsShown || [];
            window._hintsShown.push(data.hint);
            const resultEl = document.getElementById('result');
            if (resultEl) {
                const escaped = window._hintsShown.map(h => escapeHTML(h)).join('<br>');
                resultEl.innerHTML = '<strong>Hints:</strong><br>' + escaped;
            }
        } else {
            const resultEl = document.getElementById('result');
            const msg = (data.message || '').trim();
            if (!resultEl) return;

            if (/^game over/i.test(msg)) {
                resultEl.innerHTML = '<strong>Game over!</strong>' + (msg.replace(/game over!?/i, '').trim() ? '<br>' + msg.replace(/game over!?/i, '').trim() : '');
            } else if (/^congratulations/i.test(msg)) {
                resultEl.innerHTML = '<strong>Congratulations!</strong>' + (msg.replace(/congratulations!?/i, '').trim() ? '<br>' + msg.replace(/congratulations!?/i, '').trim() : '');
            } else {
                resultEl.textContent = msg || '';
            }
        }

    if (data.attempts !== undefined) {
        document.getElementById("attempts").innerText = data.attempts;
    }
    
    const msg = (data.message || "").toLowerCase();
    const isWin = msg.includes("congratulations");
    const isGameOver = msg.startsWith("game over") || data.attempts === 0;

    if (isWin || isGameOver) {
        setControlsEnabled(false);
        fetchStats();

        if (data.movie) {
            window._lastMovie = data.movie;
            const saveBtn = document.getElementById('saveDiscoveryBtn');
            if (saveBtn) {
                saveBtn.style.display = '';
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save to Discoveries';
            }
        }
    }
}

async function fetchStats() {
    try {
        const res = await fetch('/game/stats');
        if (!res.ok) return;
        const stats = await res.json();
        const element = document.getElementById('stats');
        if (element) element.textContent = `Wins: ${stats.wins || 0} - Losses: ${stats.losses || 0}`;
    } catch (e) {}
}

function setControlsEnabled(enabled) {
    const input = document.getElementById("guessInput");
    const guessBtn = document.getElementById("guessBtn");
    if (input) input.disabled = !enabled;
    if (guessBtn) guessBtn.disabled = !enabled;
}

document.addEventListener('DOMContentLoaded', () => {
    setControlsEnabled(false);
    const attemptsContainer = document.getElementById('attemptsContainer');
    if (attemptsContainer) attemptsContainer.classList.add('invisible');
    initAutocomplete();
    fetchStats();

    const resetBtn = document.getElementById('resetProgress');
    if (resetBtn) resetBtn.addEventListener('click', async () => {
        if (!confirm('Reset wins and losses to zero?')) return;
        try {
            const res = await fetch('/game/stats', { method: 'DELETE' });
            if (!res.ok) return;
            const stats = await res.json();
            const el = document.getElementById('stats');
            if (el) el.textContent = `Wins: ${stats.wins || 0} - Losses: ${stats.losses || 0}`;
        } catch (e) {}
    });

    const saveBtn = document.getElementById('saveDiscoveryBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            if (!window._lastMovie) return alert('No movie to save.');
            saveBtn.disabled = true;
            try {
                const res = await fetch('/game/discoveries', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(window._lastMovie)
                });
                if (res.status === 201) {
                    saveBtn.textContent = 'Saved';
                } else if (res.status === 409) {
                    saveBtn.textContent = 'Already saved';
                } else {
                    saveBtn.textContent = 'Save failed';
                }
            } catch (e) {
                saveBtn.textContent = 'Save failed';
            }
        });
    }
});

function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function debounce(fn, wait) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
    };
}

function initAutocomplete() {
    const input = document.getElementById('guessInput');
    const box = document.getElementById('suggestions');
    if (!input || !box) return;

    let items = [];
    let active = -1;

    const originalParent = box.parentElement;
    const originalNext = box.nextSibling;

    const render = () => {
        console.log('autocomplete.render, items:', items.length, 'active:', active);
        if (!items.length) {
            box.classList.add('hidden');
            box.innerHTML = '';
            
            if (box.parentElement !== originalParent) {
                if (originalNext) originalParent.insertBefore(box, originalNext);
                else originalParent.appendChild(box);
                box.style.position = '';
                box.style.left = '';
                box.style.top = '';
                box.style.width = '';
                box.style.zIndex = '';
            }
            return;
        }

        box.classList.remove('hidden');
        const header = `<div class="header"><span class="count">${items.length} Results:</span></div>`;
        const list = items.map((it, i) => `\n            <div class="item${i===active? ' active' : ''}" data-index="${i}">` +
            `${escapeHTML(it.title)}${it.year ? ' (' + escapeHTML(it.year) + ')' : ''}` +
            `</div>`).join('');
        box.innerHTML = header + `<div class="list">${list}</div>`;

        try {
            const r = input.getBoundingClientRect();
            if (box.parentElement !== document.body) document.body.appendChild(box);
            box.style.position = 'absolute';
            box.style.left = (r.left + window.scrollX) + 'px';
            box.style.top = (r.bottom + window.scrollY + 8) + 'px';
            box.style.width = r.width + 'px';
            box.style.zIndex = 9999;
        } catch (e) {
            console.warn('autocomplete: positioning failed', e);
        }
    };

    const fetchSuggestions = debounce(async (q) => {
        if (!q || q.length < 3) { items = []; render(); return; }
        try {
            const res = await fetch('/game/tmdb/search?q=' + encodeURIComponent(q));
            let results = await res.json();

            const max = Math.max(3, Math.min(10, 13 - q.length));
            items = results.slice(0, max);
            active = -1;
            render();
        } catch (e) { items = []; render(); }
    }, 250);

    input.addEventListener('input', (e) => {
        fetchSuggestions(e.target.value.trim());
    });

    input.addEventListener('keydown', (e) => {
        if (!items.length) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, items.length - 1); render(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); render(); }
        else if (e.key === 'Enter') {
            if (active >= 0 && items[active]) {
                e.preventDefault(); select(items[active]);
            }
        }
        else if (e.key === 'Escape') { items = []; render(); }
    });

    box.addEventListener('click', (e) => {
        const el = e.target.closest('.item');
        if (!el) return;
        const idx = Number(el.dataset.index);
        if (!Number.isNaN(idx) && items[idx]) select(items[idx]);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#suggestions') && e.target !== input) {
            items = []; render();
        }
    });

    function select(item) {
        input.value = item.title;
        items = [];
        render();
        input.focus();
    }
}