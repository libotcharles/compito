// 1. Definisci l'URL corretto (assicurati che finisca con /api/messages)
const URL_API = "https://compito-f5ex.onrender.com/api/messages";

// 2. Funzione per caricare
function caricaMessaggi() {
    console.log("Chiamata a:", URL_API); // Debug per vedere se la funzione parte
    fetch(URL_API)
        .then(response => {
            if (!response.ok) throw new Error("Errore nel server");
            return response.json();
        })
        .then(data => {
            console.log("Dati ricevuti:", data);
            const contenitore = document.getElementById('lista');
            if (contenitore) {
                contenitore.innerHTML = data.map(m => `<p>${m.text}</p>`).join('');
            }
        })
        .catch(err => console.error("Errore Fetch:", err));
}

// 3. ESEGUI LA FUNZIONE (Altrimenti la pagina resta vuota!)
caricaMessaggi();

// 4. Funzione per inviare
function inviaMessaggio(testoInserito) {
    fetch(URL_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: testoInserito })
    })
    .then(response => response.json())
    .then(conferma => {
        console.log("Inviato!", conferma);
        caricaMessaggi(); 
    })
    .catch(err => console.error("Errore Invio:", err));
}