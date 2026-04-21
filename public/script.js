async function startGame() {
    const res = await fetch("/game/start");
    const data = await res.json();

    document.getElementById("synopsis").innerText = data.synopsis;
    document.getElementById("attempts").innerText = "Attempts: " + data.attempts;

    document.getElementById("result").innerText = "";
    document.getElementById("guessInput").value = "";
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
        document.getElementById("result").innerText =
            data.message + "\nHint: " + data.hint;
    } else {
        document.getElementById("result").innerText = data.message;
    }

    if (data.attempts !== undefined) {
        document.getElementById("attempts").innerText = "Attempts: " + data.attempts;
    }
}