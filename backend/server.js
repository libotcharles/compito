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

const PORT = 3000;
app.listen(PORT, () => console.log(`Server pronto su http://localhost:${PORT}`));