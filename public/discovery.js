(function(){
    const listEl = document.getElementById('discoveriesList');
    const IMG_BASE = 'https://image.tmdb.org/t/p/w154';

    async function load() {
        try {
            const res = await fetch('/game/discoveries');
            if (!res.ok) { listEl.textContent = 'Failed to load.'; return; }
            const items = await res.json();
            if (!items.length) { listEl.innerHTML = '<p>No saved movies yet.</p>'; return; }

            const html = items.map(it => {
                const img = it.poster_path ? `<img class="poster" loading="lazy" src="${IMG_BASE}${it.poster_path}" alt="${escapeHTML(it.title)} poster" />` : '';
                const tmdb = it.tmdb_url ? `<div class="link"><a href="${it.tmdb_url}" target="_blank" rel="noreferrer">View on TMDB</a></div>` : '';
                const removeBtn = `<button class="remove-btn" data-id="${escapeHTML(it.id)}" aria-label="Remove ${escapeHTML(it.title)}">✕</button>`;
                return `<div class="discovery-item">${img}<div class="meta"><strong>${escapeHTML(it.title)}</strong><div class="year">${escapeHTML(it.year||'')}</div>${tmdb}</div>${removeBtn}</div>`;
            }).join('');

            listEl.innerHTML = html;

            listEl.addEventListener('click', async function handleClick(e) {
                const btn = e.target.closest && e.target.closest('.remove-btn');
                if (!btn) return;
                const id = btn.getAttribute('data-id');
                if (!id) return;
                btn.disabled = true;
                try {
                    const res = await fetch(`/game/discoveries/${encodeURIComponent(id)}`, { method: 'DELETE' });
                    if (!res.ok) {
                        btn.disabled = false;
                        return;
                    }
                    const item = btn.closest('.discovery-item');
                    if (item) item.remove();
                } catch (err) {
                    btn.disabled = false;
                }
            }, { once: false });
        } catch (e) {
            listEl.textContent = 'Failed to load.';
        }
    }

    document.addEventListener('DOMContentLoaded', load);
})();
