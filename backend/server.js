const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let messaggi = [{ text: "Benvenuto dal backend!" }];

app.get('/api/messages', (req, res) => {
    res.json(messaggi);
});

app.post('/api/messages', (req, res) => {
    messaggi.push(req.body);
    res.json({ message: "Dato ricevuto!" });
});

const PORT = process.env.PORT || 3000; // Prende la porta di Render o usa 3000 in locale
app.listen(PORT, () => {
    console.log(`Server in esecuzione sulla porta ${PORT}`);
});