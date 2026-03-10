const URL_API = "https://compito-f5ex.onrender.com/api/messages";

function caricaMessaggi() {
    console.log("Chiamata a:", URL_API);
    fetch(URL_API)
        .then(response => {
            if (!response.ok) throw new Error("Errore nel server");
            return response.json();
        })
        .then(data => {
            console.log("Dati ricevuti:", data);
            
            // Aggiorna lo status in alto
            const statusSpan = document.getElementById('status');
            if(statusSpan) statusSpan.innerText = "Connesso ✅";

            const contenitore = document.getElementById('lista');
            if (contenitore) {
                // Se l'array è vuoto mostra un messaggio, altrimenti mostra i dati
                if (data.length === 0) {
                    contenitore.innerHTML = "<p>Nessun messaggio presente.</p>";
                } else {
                    contenitore.innerHTML = data.map(m => `<p class="msg">${m.text}</p>`).join('');
                }
            }
        })
        .catch(err => {
            console.error("Errore Fetch:", err);
            const statusSpan = document.getElementById('status');
            if(statusSpan) statusSpan.innerText = "Errore di connessione ❌";
        });
}

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

// Gestione click pulsante
const btn = document.getElementById('btnInvia');
if (btn) {
    btn.addEventListener('click', () => {
        const input = document.getElementById('nuovoMessaggio');
        const testo = input.value;
        if (testo.trim() !== "") {
            inviaMessaggio(testo);
            input.value = ""; 
        }
    });
}

// Avvio automatico
caricaMessaggi();