const API_URL = "https://compito-f5ex.onrender.com/api"; 
let isAdmin = false;
let currentUserId = null; // Partiamo senza ID, lo prenderemo dal database

// 1. CARICA I DATI (Prodotti + Lista Profili)
async function caricaDati() {
    try {
        console.log("Tentativo di recupero dati da:", `${API_URL}/data`);
        const res = await fetch(`${API_URL}/data`);
        
        if (!res.ok) throw new Error(`Errore Server: ${res.status}`);

        const data = await res.json();
        const profili = data.profili || [];
        const prodotti = data.prodotti || [];

        // --- Gestione Utente Corrente ---
        if (profili.length > 0) {
            // Se non abbiamo un ID selezionato, prendiamo il primo della lista
            if (!currentUserId) currentUserId = profili[0].id;
            
            const utenteAttivo = profili.find(u => u.id == currentUserId) || profili[0];
            document.getElementById('userName').innerText = utenteAttivo.username;
            document.getElementById('userCredits').innerText = utenteAttivo.crediti;
        } else {
            document.getElementById('userName').innerText = "Nessun Utente (Crea uno in Admin)";
            document.getElementById('userCredits').innerText = "0";
        }

        popolaSelettoreUtenti(profili);

        // --- Griglia Prodotti ---
        const app = document.getElementById('app');
        app.innerHTML = "";
        prodotti.forEach(p => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${p.nome}</h3>
                <p>Prezzo: <strong>${p.prezzo}</strong> cr.</p>
                <p>Stock: ${p.stock}</p>
                ${!isAdmin ? 
                    `<button onclick="compra(${p.id})" ${p.stock <= 0 ? 'disabled' : ''} class="btn-buy">
                        ${p.stock <= 0 ? 'Esaurito' : 'Acquista'}
                    </button>` :
                    `<div class="admin-controls">
                        <input type="number" id="st-${p.id}" value="${p.stock}" style="width:50px">
                        <button onclick="update('stock', ${p.id})" class="btn-save">Salva</button>
                    </div>`
                }
            `;
            app.appendChild(card);
        });

        // --- Visibilità Pannelli ---
        document.getElementById('admin-add-product').style.display = isAdmin ? 'block' : 'none';
        document.getElementById('admin-manage-users').style.display = isAdmin ? 'block' : 'none';

        if (isAdmin) renderListaUtentiAdmin(profili);

    } catch (error) {
        console.error("Errore:", error);
        document.getElementById('userName').innerText = "Errore Connessione";
    }
}

// 2. LOGICA UTENTE
function popolaSelettoreUtenti(profili) {
    const selector = document.getElementById('userSelector');
    if (!selector) return;
    selector.style.display = isAdmin ? 'none' : 'inline-block';
    selector.innerHTML = profili.map(u => 
        `<option value="${u.id}" ${u.id == currentUserId ? 'selected' : ''}>${u.username}</option>`
    ).join('');
}

function cambiaUtente(id) {
    currentUserId = id;
    caricaDati();
}

async function compra(id) {
    if (!currentUserId) return alert("Crea prima un utente in Vista Admin!");
    try {
        const res = await fetch(`${API_URL}/buy`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ prodottoId: id, userId: currentUserId })
        });
        const data = await res.json();
        if (res.ok) alert("✅ Acquisto riuscito!");
        else alert("❌ Errore: " + data.error);
        caricaDati();
    } catch (e) { alert("Errore server"); }
}

// 3. LOGICA ADMIN (Registrazione e Modifiche)
async function creaUtente() {
    const input = document.getElementById('new-username');
    const nome = input.value.trim();
    if (!nome) return alert("Inserisci un nome!");

    try {
        const res = await fetch(`${API_URL}/admin/users`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username: nome })
        });
        if (res.ok) {
            alert(`✨ Utente ${nome} creato!`);
            input.value = "";
            caricaDati();
        } else {
            const err = await res.json();
            alert("Errore: " + err.error);
        }
    } catch (e) { alert("Errore di connessione"); }
}

function renderListaUtentiAdmin(profili) {
    const container = document.getElementById('users-list-container');
    container.innerHTML = profili.map(u => `
        <div style="display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid #ddd; padding:5px;">
            <span><strong>${u.username}</strong></span>
            <span>Saldo: ${u.crediti} cr. 
                <button onclick="update('crediti', ${u.id})" class="btn-save" style="background:#3498db; margin-left:10px;">✏️ Modifica</button>
            </span>
        </div>
    `).join('');
}

async function update(tipo, id) {
    let url = "";
    let bodyData = {};

    if (tipo === 'crediti') {
        const nuovoSaldo = prompt("Inserisci il nuovo saldo totale:");
        if (nuovoSaldo === null) return;
        url = `${API_URL}/admin/users/${id}/credits`;
        bodyData = { credits: Number(nuovoSaldo) };
    } else {
        const nuovoStock = document.getElementById(`st-${id}`).value;
        url = `${API_URL}/admin/products/${id}/stock`;
        bodyData = { stock: Number(nuovoStock) };
    }

    try {
        const res = await fetch(url, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(bodyData)
        });
        if (res.ok) caricaDati();
        else alert("Errore durante l'aggiornamento");
    } catch (e) { alert("Errore connessione"); }
}

async function aggiungiProdotto() {
    const nome = document.getElementById('add-nome').value;
    const prezzo = Number(document.getElementById('add-prezzo').value);
    const stock = Number(document.getElementById('add-stock').value);

    try {
        const res = await fetch(`${API_URL}/admin/products`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ nome, prezzo, stock })
        });
        if (res.ok) {
            alert("Prodotto aggiunto!");
            caricaDati();
        }
    } catch (e) { alert("Errore server"); }
}

// 4. NAVIGAZIONE
function switchView(v) {
    isAdmin = (v === 'admin');
    document.getElementById('btn-user').style.opacity = isAdmin ? "0.5" : "1";
    document.getElementById('btn-admin').style.opacity = isAdmin ? "1" : "0.5";
    caricaDati();
}

// Start
caricaDati();