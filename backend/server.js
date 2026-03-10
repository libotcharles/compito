const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURAZIONE SUPABASE - INSERISCI I TUOI DATI QUI
const supabaseUrl = 'https://tuo-progetto.supabase.co'; 
const supabaseKey = 'tua-chiave-anon-public'; 
const supabase = createClient(supabaseUrl, supabaseKey);

// GET: Legge Prodotti e Crediti
app.get('/api/data', async (req, res) => {
    try {
        const { data: prodotti } = await supabase.from('prodotti').select('*').order('id');
        const { data: profilo } = await supabase.from('profilo').select('*').eq('id', 1).single();
        res.json({ prodotti, profilo });
    } catch (error) {
        res.status(500).json({ error: "Errore caricamento dati" });
    }
});

// POST: Acquisto (Logica di sicurezza lato server)
app.post('/api/buy', async (req, res) => {
    const { prodottoId } = req.body;
    try {
        const { data: prod } = await supabase.from('prodotti').select('*').eq('id', prodottoId).single();
        const { data: user } = await supabase.from('profilo').select('*').eq('id', 1).single();

        if (prod.stock <= 0) return res.status(400).json({ error: "Prodotto esaurito!" });
        if (user.crediti < prod.prezzo) return res.status(400).json({ error: "Crediti insufficienti!" });

        await supabase.from('prodotti').update({ stock: prod.stock - 1 }).eq('id', prodottoId);
        await supabase.from('profilo').update({ crediti: user.crediti - prod.prezzo }).eq('id', 1);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Errore transazione" });
    }
});

// POST: Admin Update
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
        res.status(500).json({ error: "Errore admin" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server acceso sulla porta ${PORT}`));