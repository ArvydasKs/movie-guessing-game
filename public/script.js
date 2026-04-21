async function startGame() {
    const res = await fetch("/game/start");
    const data = await res.json();
    document.getElementById("synopsis").innerText = data.synopsis;
    document.getElementById("attempts").innerText = data.attempts;

    const attemptsContainer = document.getElementById('attemptsContainer');
    if (attemptsContainer) attemptsContainer.classList.remove('hidden');

        document.getElementById("result").innerText = "";
        window._hintsShown = [];
    document.getElementById("guessInput").value = "";

    setControlsEnabled(true);
    document.getElementById("guessInput").focus();
}

async function makeGuess() {
    const guess = document.getElementById("guessInput").value.trim();

    if (!guess) {
        document.getElementById("result").innerText = "Please enter a guess.";
        return;
    }

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
    }
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
    if (attemptsContainer) attemptsContainer.classList.add('hidden');
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