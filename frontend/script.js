const API_URL = "https://tuo-backend-render.onrender.com/api";
let currentView = 'user';

async function loadData() {
    const res = await fetch(`${API_URL}/data`);
    const data = await res.json();
    renderUI(data);
}

function renderUI(data) {
    document.getElementById('userName').innerText = data.profilo.username;
    document.getElementById('userCredits').innerText = data.profilo.crediti;

    const container = document.getElementById('app');
    if (currentView === 'user') {
        container.innerHTML = data.prodotti.map(p => `
            <div class="card">
                <h3>${p.nome} (${p.stock} pz)</h3>
                <p>Prezzo: ${p.prezzo} crediti</p>
                <button onclick="buyProduct(${p.id})" ${p.stock <= 0 ? 'disabled' : ''}>Acquista</button>
            </div>
        `).join('');
    } else {
        container.innerHTML = `
            <h3>Admin Dashboard</h3>
            <input type="number" id="newCredits" placeholder="Set Crediti">
            <button onclick="adminUpdate('crediti', document.getElementById('newCredits').value)">Assegna Crediti</button>
            <hr>
            ${data.prodotti.map(p => `
                <div class="card">
                    <h4>${p.nome}</h4>
                    <input type="number" id="st-${p.id}" value="${p.stock}">
                    <button onclick="adminUpdate('stock', document.getElementById('st-${p.id}').value, ${p.id})">Aggiorna Stock</button>
                </div>
            `).join('')}
        `;
    }
}

async function buyProduct(id) {
    const res = await fetch(`${API_URL}/buy`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ prodottoId: id })
    });
    if (!res.ok) {
        const err = await res.json();
        alert(err.error);
    }
    loadData();
}

async function adminUpdate(campo, valore, id = null) {
    await fetch(`${API_URL}/admin/update`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ campo, valore: parseInt(valore), id })
    });
    loadData();
}

function switchView(view) {
    currentView = view;
    loadData();
}

loadData();