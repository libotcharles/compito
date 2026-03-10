const URL_API = "https://compito-f5ex.onrender.com/api/messages";

// 1. Funzione per caricare i messaggi
function caricaMessaggi() {
    console.log("Chiamata a:", URL_API);
    fetch(URL_API)
        .then(response => {
            if (!response.ok) throw new Error("Errore nel server");
            return response.json();
        })
        .then(data => {
            console.log("Dati ricevuti:", data);
            
            const statusSpan = document.getElementById('status');
            if(statusSpan) statusSpan.innerText = "Connesso ✅";

            const contenitore = document.getElementById('lista');
            if (contenitore) {
                if (data.length === 0) {
                    contenitore.innerHTML = "<p>Nessun messaggio presente.</p>";
                } else {
                    // Aggiunta dell'indice e del pulsante X per ogni messaggio
                    contenitore.innerHTML = data.map((m, index) => `
                        <div class="msg">
                            <span>${m.text}</span>
                            <button class="btn-delete" onclick="cancellaMessaggio(${index})">x</button>
                        </div>
                    `).join('');
                }
            }
        })
        .catch(err => {
            console.error("Errore Fetch:", err);
            const statusSpan = document.getElementById('status');
            if(statusSpan) statusSpan.innerText = "Errore di connessione ❌";
        });
}

// 2. Funzione per inviare un messaggio (POST)
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

// 3. Funzione per cancellare un messaggio (DELETE)
function cancellaMessaggio(index) {
    // Chiede conferma all'utente prima di cancellare
    if (!confirm("Vuoi eliminare questo messaggio?")) return;

    fetch(`${URL_API}/${index}`, {
        method: "DELETE"
    })
    .then(response => {
        if (!response.ok) throw new Error("Impossibile cancellare");
        return response.json();
    })
    .then(risultato => {
        console.log("Eliminato:", risultato);
        caricaMessaggi(); // Ricarica la lista aggiornata
    })
    .catch(err => console.error("Errore DELETE:", err));
}

// 4. Gestione click pulsante Invia
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

// Avvio automatico al caricamento della pagina
caricaMessaggi();