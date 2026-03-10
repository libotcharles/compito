const URL_API = "https://compito-f5ex.onrender.com/api/messages";

// FUNZIONE PER CARICARE (GET)
function caricaMessaggi() {
    fetch(URL_API)
        .then(res => {
            if (!res.ok) throw new Error("Errore server");
            return res.json();
        })
        .then(data => {
            const statusSpan = document.getElementById('status');
            if(statusSpan) statusSpan.innerText = "Connesso ✅";

            const contenitore = document.getElementById('lista');
            if (contenitore) {
                // USIAMO I BACKTICK ` PER COSTRUIRE IL PULSANTE X
                contenitore.innerHTML = data.map((m, index) => `
                    <div class="msg">
                        <span>${m.text}</span>
                        <button class="btn-delete" onclick="cancellaMessaggio(${index})">x</button>
                    </div>
                `).join('');
            }
        })
        .catch(err => {
            console.error(err);
            document.getElementById('status').innerText = "Errore ❌";
        });
}

// FUNZIONE PER CANCELLARE (DELETE) - Deve essere "window." per essere vista dall'HTML
window.cancellaMessaggio = function(index) {
    if (!confirm("Vuoi davvero eliminare questo messaggio?")) return;

    fetch(`${URL_API}/${index}`, {
        method: "DELETE"
    })
    .then(res => {
        if (!res.ok) throw new Error("Cancellazione fallita");
        return res.json();
    })
    .then(() => {
        console.log("Eliminato!");
        caricaMessaggi(); // Ricarica la lista per far sparire il messaggio
    })
    .catch(err => alert("Errore durante la cancellazione: " + err.message));
};

// FUNZIONE PER INVIARE (POST)
const btn = document.getElementById('btnInvia');
if (btn) {
    btn.addEventListener('click', () => {
        const input = document.getElementById('nuovoMessaggio');
        const testo = input.value;
        if (testo.trim() !== "") {
            fetch(URL_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: testo })
            })
            .then(() => {
                input.value = "";
                caricaMessaggi();
            });
        }
    });
}

// Carica i messaggi all'avvio
caricaMessaggi();