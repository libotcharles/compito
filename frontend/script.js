/*const API_URL = "https://compito-f5ex.onrender.com/api"; // CAMBIA CON IL TUO URL RENDER
let isAdmin = false;

async function caricaDati() {
    const res = await fetch(`${API_URL}/data`);
    const data = await res.json();
    
    document.getElementById('userName').innerText = data.profilo.username;
    document.getElementById('userCredits').innerText = data.profilo.crediti;

    const app = document.getElementById('app');
    app.innerHTML = "";

    if (isAdmin) {
        const headerAdmin = document.createElement('div');
        headerAdmin.className = 'admin-box';
        headerAdmin.innerHTML = `<h3>Pannello Admin</h3>
            <input type="number" id="new-cred" placeholder="Nuovi crediti">
            <button onclick="update('crediti')">Aggiorna Saldo</button>`;
        app.appendChild(headerAdmin);
    }

    data.prodotti.forEach(p => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${p.nome}</h3>
            <p>Prezzo: ${p.prezzo} | Stock: ${p.stock}</p>
            ${!isAdmin ? 
                `<button onclick="compra(${p.id})" ${p.stock <= 0 ? 'disabled' : ''}>Acquista</button>` :
                `<input type="number" id="st-${p.id}" value="${p.stock}">
                 <button onclick="update('stock', ${p.id})" class="btn-admin">Salva Stock</button>`
            }
        `;
        app.appendChild(card);
    });
}

async function compra(id) {
    const res = await fetch(`${API_URL}/buy`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ prodottoId: id })
    });
    const data = await res.json();
    if (res.ok) alert("OK!"); else alert("Errore: " + data.error);
    caricaDati();
}

async function update(tipo, id = null) {
    const valore = tipo === 'stock' ? document.getElementById(`st-${id}`).value : document.getElementById('new-cred').value;
    await fetch(`${API_URL}/admin/update`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ tipo, valore, id })
    });
    caricaDati();
}

function switchView(v) {
    isAdmin = (v === 'admin');
    caricaDati();
}

caricaDati(); */


const API_URL = "https://compito-f5ex.onrender.com/api"; 
let isAdmin = false;
let currentUserId = 1; // Default iniziale

// 1. CARICA I DATI (Catalogo + Lista Profili)
async function caricaDati() {
    try {
        const res = await fetch(`${API_URL}/data`);
        const data = await res.json();
        
        const profili = data.profili || [];
        const prodotti = data.prodotti || [];

        // Aggiorna il Selettore Utenti nell'header (solo se cambia la lista)
        popolaSelettoreUtenti(profili);

        // Trova l'utente attivo per mostrare saldo e nome
        const utenteAttivo = profili.find(u => u.id == currentUserId) || profili[0];
        if (utenteAttivo) {
            currentUserId = utenteAttivo.id;
            document.getElementById('userName').innerText = utenteAttivo.username;
            document.getElementById('userCredits').innerText = utenteAttivo.crediti;
        }

        const app = document.getElementById('app');
        app.innerHTML = "";

        // Mostra la lista utenti solo se siamo Admin
        const adminUserPanel = document.getElementById('admin-manage-users');
        if (adminUserPanel) adminUserPanel.style.display = isAdmin ? 'block' : 'none';
        
        if (isAdmin) {
            renderListaUtentiAdmin(profili);
        }

        // Ciclo Prodotti
        prodotti.forEach(p => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${p.nome}</h3>
                <p>Prezzo: <strong>${p.prezzo}</strong> crediti</p>
                <p>Stock: ${p.stock}</p>
                ${!isAdmin ? 
                    `<button onclick="compra(${p.id})" ${p.stock <= 0 ? 'disabled' : ''} class="btn-buy">
                        ${p.stock <= 0 ? 'Esaurito' : 'Acquista Ora'}
                    </button>` :
                    `<div class="admin-controls">
                        <input type="number" id="st-${p.id}" value="${p.stock}" style="width: 50px">
                        <button onclick="update('stock', ${p.id})" class="btn-save">Salva Stock</button>
                    </div>`
                }
            `;
            app.appendChild(card);
        });
    } catch (error) {
        console.error("Errore nel caricamento dei dati:", error);
    }
}

// 2. FUNZIONI DI SUPPORTO UI
function popolaSelettoreUtenti(profili) {
    const selector = document.getElementById('userSelector');
    if (!selector) return;
    const attuale = selector.value;
    selector.innerHTML = profili.map(u => 
        `<option value="${u.id}" ${u.id == currentUserId ? 'selected' : ''}>Account: ${u.username}</option>`
    ).join('');
}

function renderListaUtentiAdmin(profili) {
    const container = document.getElementById('users-list-container');
    if (!container) return;
    container.innerHTML = "<h4>Saldi Utenti:</h4>";
    profili.forEach(u => {
        const div = document.createElement('div');
        div.style.margin = "5px 0";
        div.innerHTML = `
            <span>${u.username} (ID:${u.id}): <strong>${u.crediti}</strong> cr.</span>
            <button onclick="update('crediti', ${u.id})" style="padding: 2px 5px; font-size: 12px;">Modifica Saldo</button>
        `;
        container.appendChild(div);
    });
}

// 3. LOGICA UTENTE (Cambio Account e Acquisto)
function cambiaUtente(id) {
    currentUserId = id;
    caricaDati();
}

async function compra(id) {
    try {
        const res = await fetch(`${API_URL}/buy`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ prodottoId: id, userId: currentUserId })
        });
        const data = await res.json();
        if (res.ok) alert("✅ Acquisto completato!");
        else alert("❌ Errore: " + data.error);
        caricaDati();
    } catch (e) { alert("Errore di connessione"); }
}

// 4. LOGICA ADMIN (Update, Crea Utente, Aggiungi Prodotto)
async function update(tipo, id) {
    let url = "";
    let bodyData = {};

    if (tipo === 'crediti') {
        const valore = prompt("Inserisci il nuovo saldo totale per l'utente:");
        if (valore === null) return;
        url = `${API_URL}/admin/users/${id}/credits`; 
        bodyData = { credits: Number(valore) };
    } else {
        const valore = document.getElementById(`st-${id}`).value;
        url = `${API_URL}/admin/products/${id}/stock`;
        bodyData = { stock: Number(valore) };
    }

    try {
        const res = await fetch(url, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(bodyData)
        });
        if (res.ok) caricaDati();
    } catch (e) { alert("Errore durante l'aggiornamento"); }
}

async function creaUtente() {
const nomeInput = document.getElementById('new-username');
    const nome = nomeInput.value;

    if (!nome) return alert("Inserisci un nome per il nuovo utente!");

    try {
        const res = await fetch(`${API_URL}/admin/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: nome }) // Inviamo SOLO il nome
        });

        if (res.ok) {
            alert(`✨ Utente ${nome} creato con successo!`);
            nomeInput.value = ""; // Pulisce il campo
            caricaDati(); // Ricarica la lista per vedere il nuovo utente
        } else {
            const err = await res.json();
            alert("Errore: " + err.error);
        }
    } catch (e) {
        alert("Errore di connessione al server");
    }
}

async function aggiungiProdotto() {
    const nome = document.getElementById('add-nome').value;
    const prezzo = document.getElementById('add-prezzo').value;
    const stock = document.getElementById('add-stock').value;

    if(!nome || !prezzo || !stock) return alert("⚠️ Compila tutti i campi!");

    try {
        const res = await fetch(`${API_URL}/admin/products`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ nome, prezzo: Number(prezzo), stock: Number(stock) })
        });
        if(res.ok) {
            alert("📦 Prodotto aggiunto!");
            caricaDati();
        }
    } catch (e) { alert("Errore invio"); }
}

// 5. NAVIGAZIONE
function switchView(v) {
    isAdmin = (v === 'admin');
    document.getElementById('admin-add-product').style.display = isAdmin ? 'block' : 'none';
    document.getElementById('btn-user').style.opacity = isAdmin ? "0.5" : "1";
    document.getElementById('btn-admin').style.opacity = isAdmin ? "1" : "0.5";
    caricaDati();
}

// Start
caricaDati();