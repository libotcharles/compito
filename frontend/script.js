// 1. Configurazione: Sostituisci con il tuo URL di Render
const API_URL = "https://compito-f5ex.onrender.com";

let isAdmin = false; // Variabile di stato per gestire le due viste

// Funzione principale: recupera i dati dal backend (Render + Supabase)
async function caricaDati() {
    try {
        const res = await fetch(`${API_URL}/data`);
        if (!res.ok) throw new Error("Errore nel caricamento");
        
        const data = await res.json();
        
        // Aggiorna i testi fissi nell'HTML
        document.getElementById('userName').innerText = data.profilo.username;
        document.getElementById('userCredits').innerText = data.profilo.crediti;
        document.getElementById('server-status').innerText = "Online ✅";

        // Costruisce la griglia dei prodotti
        renderCatalogo(data.prodotti);
    } catch (err) {
        document.getElementById('server-status').innerText = "Errore ❌";
        console.error("Errore fetch:", err);
    }
}

// Funzione per generare l'HTML dei prodotti
function renderCatalogo(prodotti) {
    const app = document.getElementById('app');
    app.innerHTML = ""; // Svuota il contenitore

    prodotti.forEach(p => {
        const card = document.createElement('div');
        card.className = 'card';

        if (!isAdmin) {
            // VISTA UTENTE: Prezzo e Bottone Acquista
            card.innerHTML = `
                <h3>${p.nome}</h3>
                <p>Prezzo: <strong>${p.prezzo}</strong> crediti</p>
                <p>Stock: ${p.stock} pezzi</p>
                <button onclick="acquista(${p.id})" ${p.stock <= 0 ? 'disabled' : ''}>
                    ${p.stock > 0 ? 'Acquista' : 'Esaurito'}
                </button>
            `;
        } else {
            // VISTA ADMIN: Modifica Stock e Crediti
            card.innerHTML = `
                <h3>${p.nome}</h3>
                <label>Modifica Stock:</label>
                <input type="number" id="st-${p.id}" value="${p.stock}" min="0">
                <button class="btn-admin-action" onclick="aggiornaDati('stock', ${p.id})">Salva Stock</button>
            `;
        }
        app.appendChild(card);
    });

    // Se admin, aggiungi pulsante speciale per i crediti utente
    if (isAdmin) {
        const adminBox = document.createElement('div');
        adminBox.className = 'admin-controls';
        adminBox.innerHTML = `
            <h3>Dashboard Admin - Crediti</h3>
            <input type="number" id="nuovi-crediti" placeholder="Set Crediti Utente">
            <button onclick="aggiornaDati('crediti')">Aggiorna Saldo Utente</button>
        `;
        app.prepend(adminBox);
    }
}

// FUNZIONE ACQUISTO (POST)
async function acquista(id) {
    if (!confirm("Vuoi procedere con l'acquisto?")) return;

    const res = await fetch(`${API_URL}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prodottoId: id })
    });

    const result = await res.json();
    if (res.ok) {
        alert("Acquisto completato!");
    } else {
        alert("Errore: " + result.error);
    }
    caricaDati(); // Ricarica per aggiornare crediti e stock
}

// FUNZIONE ADMIN UPDATE (POST)
async function aggiornaDati(tipo, id = null) {
    let valore;
    if (tipo === 'stock') {
        valore = document.getElementById(`st-${id}`).value;
    } else {
        valore = document.getElementById('nuovi-crediti').value;
    }

    await fetch(`${API_URL}/admin/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, valore: parseInt(valore), id })
    });
    
    alert("Dati aggiornati correttamente");
    caricaDati();
}

// FUNZIONE SWITCH VISTA (Chiamata dall'HTML)
window.switchView = function(view) {
    isAdmin = (view === 'admin');
    
    // Feedback visivo sui pulsanti nav
    document.getElementById('viewUser').classList.toggle('active', !isAdmin);
    document.getElementById('viewAdmin').classList.toggle('active', isAdmin);
    
    caricaDati();
};

// Primo avvio
caricaDati();