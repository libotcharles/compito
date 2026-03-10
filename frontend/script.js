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

// 1. CARICA I DATI (Catalogo + Profilo)
async function caricaDati() {
    try {
        const res = await fetch(`${API_URL}/data`);
        const data = await res.json();
        
        // Aggiorna Header (Assicurati che questi ID esistano nel tuo HTML)
        if (data.profilo) {
            document.getElementById('userName').innerText = data.profilo.username;
            document.getElementById('userCredits').innerText = data.profilo.crediti;
        }

        const app = document.getElementById('app');
        app.innerHTML = "";

        // Se siamo in modalità Admin, mostriamo il box per i crediti
        if (isAdmin) {
            const headerAdmin = document.createElement('div');
            headerAdmin.className = 'admin-box';
            headerAdmin.style.border = "2px solid red";
            headerAdmin.style.padding = "10px";
            headerAdmin.style.marginBottom = "20px";
            headerAdmin.innerHTML = `
                <h3>Pannello Admin - Gestione Crediti</h3>
                <input type="number" id="new-cred" placeholder="Inserisci saldo totale">
                <button onclick="update('crediti')">Imposta Saldo Utente</button>
            `;
            app.appendChild(headerAdmin);
        }

        // Ciclo Prodotti
        data.prodotti.forEach(p => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${p.nome}</h3>
                <p>Prezzo: ${p.prezzo} | Stock: ${p.stock}</p>
                ${!isAdmin ? 
                    `<button onclick="compra(${p.id})" ${p.stock <= 0 ? 'disabled' : ''}>
                        ${p.stock <= 0 ? 'Esaurito' : 'Acquista'}
                    </button>` :
                    `<div>
                        <input type="number" id="st-${p.id}" value="${p.stock}" style="width: 50px">
                        <button onclick="update('stock', ${p.id})" class="btn-admin">Salva Stock</button>
                    </div>`
                }
            `;
            app.appendChild(card);
        });
    } catch (error) {
        console.error("Errore caricamento dati:", error);
    }
}

// 2. FUNZIONE ACQUISTO (User)
async function compra(id) {
    try {
        const res = await fetch(`${API_URL}/buy`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ prodottoId: id })
        });
        const data = await res.json();
        
        if (res.ok) {
            alert("Acquisto completato!");
        } else {
            alert("Errore: " + data.error);
        }
        caricaDati(); // Ricarica per aggiornare crediti e stock
    } catch (error) {
        alert("Errore di connessione");
    }
}

// 3. FUNZIONE AGGIORNAMENTO (Admin)
async function update(tipo, id = null) {
    let url = "";
    let bodyData = {};

    if (tipo === 'crediti') {
        const valore = document.getElementById('new-cred').value;
        if (!valore) return alert("Inserisci un valore");
        
        // Il tuo backend: PATCH /api/admin/users/:id/credits
        url = `${API_URL}/admin/users/1/credits`; 
        bodyData = { credits: Number(valore) };
    } 
    else if (tipo === 'stock') {
        const valore = document.getElementById(`st-${id}`).value;
        
        // Il tuo backend: PATCH /api/admin/products/:id/stock
        url = `${API_URL}/admin/products/${id}/stock`;
        bodyData = { stock: Number(valore) };
    }

    try {
        const res = await fetch(url, {
            method: 'PATCH', // Importante: il tuo server usa PATCH
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(bodyData)
        });

        if (res.ok) {
            alert("Aggiornato con successo!");
            caricaDati();
        } else {
            const err = await res.json();
            alert("Errore: " + (err.error || "Fallito"));
        }
    } catch (error) {
        alert("Errore di rete");
    }
}

// 4. SWITCH VISTA
function switchView(v) {
    isAdmin = (v === 'admin');
    caricaDati();
}

// Avvio iniziale
caricaDati();