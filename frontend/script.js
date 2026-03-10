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
        
        if (data.profilo) {
            document.getElementById('userName').innerText = data.profilo.username;
            document.getElementById('userCredits').innerText = data.profilo.crediti;
        }

        const app = document.getElementById('app');
        app.innerHTML = "";

        // Sezione Admin per i Crediti
        if (isAdmin) {
            const headerAdmin = document.createElement('div');
            headerAdmin.className = 'admin-box';
            headerAdmin.style.border = "2px solid #ff4444";
            headerAdmin.style.padding = "15px";
            headerAdmin.style.marginBottom = "20px";
            headerAdmin.style.borderRadius = "8px";
            headerAdmin.innerHTML = `
                <h3>🛠 Pannello Admin - Gestione Utente</h3>
                <div style="display: flex; gap: 10px;">
                    <input type="number" id="new-cred" placeholder="Nuovo Saldo Totale">
                    <button onclick="update('crediti')" class="btn-admin">Aggiorna Saldo</button>
                </div>
            `;
            app.appendChild(headerAdmin);
        }

        // Ciclo Prodotti
        data.prodotti.forEach(p => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${p.nome}</h3>
                <p>Prezzo: <strong>${p.prezzo}</strong> crediti</p>
                <p>Disponibilità: ${p.stock}</p>
                ${!isAdmin ? 
                    `<button onclick="compra(${p.id})" ${p.stock <= 0 ? 'disabled' : ''} class="btn-buy">
                        ${p.stock <= 0 ? 'Esaurito' : 'Acquista Ora'}
                    </button>` :
                    `<div class="admin-controls">
                        <label>Stock:</label>
                        <input type="number" id="st-${p.id}" value="${p.stock}" style="width: 60px">
                        <button onclick="update('stock', ${p.id})" class="btn-save">Salva</button>
                    </div>`
                }
            `;
            app.appendChild(card);
        });
    } catch (error) {
        console.error("Errore nel caricamento dei dati:", error);
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
            alert("✅ Acquisto effettuato con successo!");
        } else {
            alert("❌ Errore: " + data.error);
        }
        caricaDati();
    } catch (error) {
        alert("⚠️ Errore di connessione al server");
    }
}

// 3. FUNZIONE AGGIORNAMENTO STOCK E CREDITI (Admin)
async function update(tipo, id = null) {
    let url = "";
    let bodyData = {};

    if (tipo === 'crediti') {
        const valore = document.getElementById('new-cred').value;
        if (!valore) return alert("Inserisci un importo");
        url = `${API_URL}/admin/users/1/credits`; 
        bodyData = { credits: Number(valore) };
    } 
    else if (tipo === 'stock') {
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

        if (res.ok) {
            alert("💾 Dati aggiornati nel database!");
            caricaDati();
        } else {
            const err = await res.json();
            alert("❌ Errore: " + (err.error || "Operazione fallita"));
        }
    } catch (error) {
        alert("⚠️ Errore di rete");
    }
}

// 4. NUOVA FUNZIONE: AGGIUNGI PRODOTTO (Admin)
async function aggiungiProdotto() {
    const nome = document.getElementById('add-nome').value;
    const prezzo = document.getElementById('add-prezzo').value;
    const stock = document.getElementById('add-stock').value;

    if(!nome || !prezzo || !stock) return alert("⚠️ Compila tutti i campi del nuovo prodotto!");

    try {
        const res = await fetch(`${API_URL}/admin/products`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                nome, 
                prezzo: Number(prezzo), 
                stock: Number(stock) 
            })
        });
        
        if(res.ok) {
            alert("✨ Nuovo prodotto inserito a catalogo!");
            // Reset campi
            document.getElementById('add-nome').value = "";
            document.getElementById('add-prezzo').value = "";
            document.getElementById('add-stock').value = "";
            caricaDati();
        } else {
            alert("❌ Errore nella creazione del prodotto");
        }
    } catch (e) {
        alert("⚠️ Errore durante l'invio");
    }
}

// 5. SWITCH VISTA
function switchView(v) {
    isAdmin = (v === 'admin');
    
    // Gestione visibilità modulo aggiunta prodotto (presente nel tuo HTML)
    const adminPanel = document.getElementById('admin-add-product');
    if (adminPanel) {
        adminPanel.style.display = isAdmin ? 'block' : 'none';
    }

    // Cambia stile bottoni navbar per feedback visivo
    document.getElementById('btn-user').style.opacity = isAdmin ? "0.5" : "1";
    document.getElementById('btn-admin').style.opacity = isAdmin ? "1" : "0.5";

    caricaDati();
}

// Avvio iniziale
caricaDati();