/*
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let messaggi = [
    { text: "ciao mondo" },
    { text: "test API" }
];

// 1. GET: Legge i dati
app.get('/api/messages', (req, res) => {
    res.json(messaggi);
});

// 2. POST: Aggiunge dati
app.post('/api/messages', (req, res) => {
    const nuovoMessaggio = req.body; 
    messaggi.push(nuovoMessaggio);   
    res.json({ status: "successo", aggiunto: nuovoMessaggio });
});

// 3. DELETE: Rimuove dati tramite indice (:id)
app.delete('/api/messages/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (id >= 0 && id < messaggi.length) {
        messaggi.splice(id, 1);
        res.json({ status: "successo", rimosso: id });
    } else {
        res.status(404).json({ error: "Messaggio non trovato" });
    }
});

// 4. AVVIO DEL SERVER (Sempre alla fine del file!)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server in esecuzione sulla porta ${PORT}`);
});

*/


const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Inserisci qui le tue chiavi di Supabase
const supabase = createClient('URL_SUPABASE', 'ANON_KEY_SUPABASE');

// --- ROTTE UTENTE ---

// 1. Ottieni prodotti e crediti
app.get('/api/data', async (req, res) => {
    const { data: prodotti } = await supabase.from('prodotti').select('*');
    const { data: profilo } = await supabase.from('profilo').select('*').single();
    res.json({ prodotti, profilo });
});

// 2. Acquisto prodotto (LOGICA DI SICUREZZA LATO SERVER)
app.post('/api/buy', async (req, res) => {
    const { prodottoId } = req.body;

    // Recupero dati attuali
    const { data: prod } = await supabase.from('prodotti').select('*').eq('id', prodottoId).single();
    const { data: user } = await supabase.from('profilo').select('*').eq('id', 1).single();

    // CONTROLLI DI SICUREZZA
    if (prod.stock <= 0) return res.status(400).json({ error: "Stock esaurito!" });
    if (user.crediti < prod.prezzo) return res.status(400).json({ error: "Crediti insufficienti!" });

    // Transazione finta: scala crediti e riduci stock
    await supabase.from('prodotti').update({ stock: prod.stock - 1 }).eq('id', prodottoId);
    await supabase.from('profilo').update({ crediti: user.crediti - prod.prezzo }).eq('id', 1);

    res.json({ success: true });
});

// --- ROTTE ADMIN ---

// Aggiorna stock o crediti
app.post('/api/admin/update', async (req, res) => {
    const { tipo, valore, id } = req.body; 
    if (tipo === 'stock') {
        await supabase.from('prodotti').update({ stock: valore }).eq('id', id);
    } else if (tipo === 'crediti') {
        await supabase.from('profilo').update({ crediti: valore }).eq('id', 1);
    }
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));