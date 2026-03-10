const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

const PORT = process.env.PORT || 3000;
const USER_ID = 1;

// Usa variabili d'ambiente su Render / locale
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Errore: SUPABASE_URL o SUPABASE_ANON_KEY mancanti.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors({
  origin: '*', // per compito scolastico va bene; per deploy finale puoi restringerlo
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Il server è vivo e risponde alla root!');
});

// GET: catalogo + profilo utente
app.get('/api/data', async (req, res) => {
  try {
    const { data: prodotti, error: prodottiError } = await supabase
      .from('prodotti')
      .select('*')
      .order('id', { ascending: true });

    if (prodottiError) {
      console.error('Errore prodotti:', prodottiError);
      return res.status(500).json({ error: 'Errore caricamento prodotti' });
    }

    const { data: profilo, error: profiloError } = await supabase
      .from('profilo')
      .select('*')
      .eq('id', USER_ID)
      .single();

    if (profiloError) {
      console.error('Errore profilo:', profiloError);
      return res.status(500).json({ error: 'Errore caricamento profilo' });
    }

    return res.json({ prodotti, profilo });
  } catch (error) {
    console.error('Errore /api/data:', error);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
});

// POST: acquisto prodotto
app.post('/api/buy', async (req, res) => {
  try {
    const { prodottoId } = req.body;

    if (!prodottoId || Number.isNaN(Number(prodottoId))) {
      return res.status(400).json({ error: 'prodottoId mancante o non valido' });
    }

    const productIdNum = Number(prodottoId);

    const { data: prod, error: prodError } = await supabase
      .from('prodotti')
      .select('*')
      .eq('id', productIdNum)
      .single();

    if (prodError || !prod) {
      console.error('Errore prodotto:', prodError);
      return res.status(404).json({ error: 'Prodotto non trovato' });
    }

    const { data: user, error: userError } = await supabase
      .from('profilo')
      .select('*')
      .eq('id', USER_ID)
      .single();

    if (userError || !user) {
      console.error('Errore utente:', userError);
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    if (prod.stock <= 0) {
      return res.status(409).json({ error: 'Prodotto esaurito' });
    }

    if (user.crediti < prod.prezzo) {
      return res.status(409).json({ error: 'Crediti insufficienti' });
    }

    const nuovoStock = prod.stock - 1;
    const nuoviCrediti = user.crediti - prod.prezzo;

    const { error: stockUpdateError } = await supabase
      .from('prodotti')
      .update({ stock: nuovoStock })
      .eq('id', productIdNum);

    if (stockUpdateError) {
      console.error('Errore update stock:', stockUpdateError);
      return res.status(500).json({ error: 'Errore aggiornamento stock' });
    }

    const { error: creditiUpdateError } = await supabase
      .from('profilo')
      .update({ crediti: nuoviCrediti })
      .eq('id', USER_ID);

    if (creditiUpdateError) {
      console.error('Errore update crediti:', creditiUpdateError);
      return res.status(500).json({ error: 'Errore aggiornamento crediti' });
    }

    return res.json({
      success: true,
      message: 'Acquisto completato',
      profilo: {
        ...user,
        crediti: nuoviCrediti,
      },
      prodotto: {
        ...prod,
        stock: nuovoStock,
      },
    });
  } catch (error) {
    console.error('Errore /api/buy:', error);
    return res.status(500).json({ error: 'Errore transazione' });
  }
});

// POST: admin aggiunge nuovo prodotto
app.post('/api/admin/products', async (req, res) => {
  try {
    const { nome, prezzo, stock } = req.body;

    if (!nome || Number.isNaN(Number(prezzo)) || Number.isNaN(Number(stock))) {
      return res.status(400).json({ error: 'Dati prodotto non validi' });
    }

    const prezzoNum = Number(prezzo);
    const stockNum = Number(stock);

    if (prezzoNum < 0 || stockNum < 0) {
      return res.status(400).json({ error: 'Prezzo e stock devono essere >= 0' });
    }

    const { data, error } = await supabase
      .from('prodotti')
      .insert([{ nome, prezzo: prezzoNum, stock: stockNum }])
      .select()
      .single();

    if (error) {
      console.error('Errore insert prodotto:', error);
      return res.status(500).json({ error: 'Errore creazione prodotto' });
    }

    return res.status(201).json({
      success: true,
      message: 'Prodotto aggiunto',
      prodotto: data,
    });
  } catch (error) {
    console.error('Errore /api/admin/products:', error);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
});

// PATCH: admin modifica stock prodotto
app.patch('/api/admin/products/:id/stock', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { stock } = req.body;

    if (Number.isNaN(id) || Number.isNaN(Number(stock))) {
      return res.status(400).json({ error: 'ID o stock non validi' });
    }

    const stockNum = Number(stock);

    if (stockNum < 0) {
      return res.status(400).json({ error: 'Lo stock non può essere negativo' });
    }

    const { data, error } = await supabase
      .from('prodotti')
      .update({ stock: stockNum })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Errore update stock:', error);
      return res.status(404).json({ error: 'Prodotto non trovato o update fallito' });
    }

    return res.json({
      success: true,
      message: 'Stock aggiornato',
      prodotto: data,
    });
  } catch (error) {
    console.error('Errore PATCH stock:', error);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
});

// PATCH: admin assegna crediti bonus all'utente
app.patch('/api/admin/users/:id/credits', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { credits } = req.body;

    if (Number.isNaN(id) || Number.isNaN(Number(credits))) {
      return res.status(400).json({ error: 'ID o credits non validi' });
    }

    const creditsNum = Number(credits);

    if (creditsNum < 0) {
      return res.status(400).json({ error: 'I crediti non possono essere negativi' });
    }

    const { data, error } = await supabase
      .from('profilo')
      .update({ crediti: creditsNum })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Errore update crediti:', error);
      return res.status(404).json({ error: 'Utente non trovato o update fallito' });
    }

    return res.json({
      success: true,
      message: 'Crediti aggiornati',
      profilo: data,
    });
  } catch (error) {
    console.error('Errore PATCH credits:', error);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
});

app.listen(PORT, () => {
  console.log(`Server acceso sulla porta ${PORT}`);
});