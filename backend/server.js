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

// 1. CONFIGURAZIONE SUPABASE
// Sostituisci queste stringhe con i tuoi dati reali presi da Settings -> API
const supabaseUrl = 'https://tuo-id.supabase.co'; 
const supabaseKey = 'tua-chiave-anon-public'; 
const supabase = createClient(supabaseUrl, supabaseKey);

// --- ROTTE UTENTE ---

// GET: Ottieni catalogo prodotti e profilo utente (saldo crediti)
app.get('/api/data', async (req, res) => {
    try {
        const { data: prodotti, error: err1 } = await supabase.from('prodotti').select('*').order('id');
        const { data: profilo, error: err2 } = await supabase.from('profilo').select('*').eq('id', 1).single();

        if (err1 || err2) throw new Error("Errore nel recupero dati");
        
        res.json({ prodotti, profilo });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: Acquisto prodotto con controlli di sicurezza lato server
app.post('/api/buy', async (req, res) => {
    const { prodottoId } = req.body;

    try {
        // Recupero dati aggiornati dal DB
        const { data: prod } = await supabase.from('prodotti').select('*').eq('id', prodottoId).single();
        const { data: user } = await supabase.from('profilo').select('*').eq('id', 1).single();

        // --- CONTROLLI DI SICUREZZA (Fondamentali per il voto alto) ---
        if (!prod || prod.stock <= 0) {
            return res.status(400).json({ error: "Prodotto esaurito o non trovato!" });
        }
        if (user.crediti < prod.prezzo) {
            return res.status(400).json({ error: "Crediti insufficienti per l'acquisto!" });
        }

        // Esecuzione transazione
        const newStock = prod.stock - 1;
        const newCredits = user.crediti - prod.prezzo;

        await supabase.from('prodotti').update({ stock: newStock }).eq('id', prodottoId);
        await supabase.from('profilo').update({ crediti: newCredits }).eq('id', 1);

        res.json({ success: true, messaggio: "Acquisto completato!" });
    } catch (error) {
        res.status(500).json({ error: "Errore durante la transazione" });
    }
});

// --- ROTTE ADMIN ---

// Aggiorna stock o assegna crediti bonus
app.post('/api/admin/update', async (req, res) => {
    const { tipo, valore, id } = req.body; 
    try {
        if (tipo === 'stock') {
            await supabase.from('prodotti').update({ stock: parseInt(valore) }).eq('id', id);
        } else if (tipo === 'crediti') {
            await supabase.from('profilo').update({ crediti: parseInt(valore) }).eq('id', 1);
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Errore aggiornamento admin" });
    }
});

// AVVIO
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server E-Commerce attivo sulla porta ${PORT}`));