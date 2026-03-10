const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let messaggi = [
    { text: "ciao mondo" },
    { text: "test API" }
];

// Endpoint GET: Serve per LEGGERE i dati
app.get('/api/messages', (req, res) => {
    res.json(messaggi); // Invia l'array in formato JSON
});

// Endpoint POST: Serve per AGGIUNGERE dati
app.post('/api/messages', (req, res) => {
    const nuovoMessaggio = req.body; // Legge il JSON inviato dal frontend
    messaggi.push(nuovoMessaggio);   // Lo aggiunge alla lista
    res.json({ status: "successo", aggiunto: nuovoMessaggio });
});
const PORT = process.env.PORT || 3000; // Prende la porta di Render o usa 3000 in locale
app.listen(PORT, () => {
    console.log(`Server in esecuzione sulla porta ${PORT}`);
});


// AGGIUNGI QUESTO NEL TUO server.js
app.delete('/api/messages/:id', (req, res) => {
    const id = parseInt(req.params.id); // Legge l'indice inviato dal JS
    if (id >= 0 && id < messaggi.length) {
        messaggi.splice(id, 1); // Rimuove il messaggio dall'array
        res.json({ status: "successo", rimosso: id });
    } else {
        res.status(404).json({ error: "Messaggio non trovato" });
    }
});