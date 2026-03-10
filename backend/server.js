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