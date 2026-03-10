const URL = "https://compito-f5ex.onrender.com";

function caricaMessaggi() {
    fetch(URL_API)
        .then(response => response.json()) // Trasforma la risposta in oggetto JS
        .then(data => {
            console.log(data); // Qui vedrai l'array di messaggi
            // Esempio: mostrali in un div
            const contenitore = document.getElementById('lista');
            contenitore.innerHTML = data.map(m => `<p>${m.text}</p>`).join('');
        });
}

function inviaMessaggio(testoInserito) {
    fetch(URL_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: testoInserito }) // Trasforma l'oggetto in stringa JSON
    })
    .then(response => response.json())
    .then(conferma => {
        console.log("Inviato!", conferma);
        caricaMessaggi(); // Ricarica la lista per vedere il nuovo messaggio
    });
}