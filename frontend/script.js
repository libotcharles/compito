const API_URL = "https://compito-f5ex.onrender.com/api"; // CAMBIA CON IL TUO URL RENDER
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

caricaDati();