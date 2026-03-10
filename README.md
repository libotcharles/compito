# Progetto E-Commerce - Architetture Distribuite

### 1. Architettura
Il client sviluppato è un **Thin Client**. La logica di business (controllo crediti, gestione stock) risiede interamente sul server. Il frontend si occupa solo di visualizzare i dati e inviare richieste.

### 2. Endpoint API
- **GET /api/data**: Restituisce il catalogo prodotti e il profilo utente (crediti).
- **POST /api/buy**: Effettua l'acquisto (decrementa stock e crediti). Richiede `{ "prodottoId": numero }`.
- **POST /api/admin/products**: Aggiunge un nuovo prodotto.
- **PATCH /api/admin/products/:id/stock**: Aggiorna lo stock di un prodotto.
- **PATCH /api/admin/users/:id/credits**: Assegna crediti bonus a un utente.

### 3. Sicurezza Lato Server
Il server esegue i seguenti controlli prima di ogni transazione:
- Verifica che il prodotto esista.
- Verifica che lo stock sia maggiore di 0.
- Verifica che i crediti dell'utente siano sufficienti per coprire il prezzo.
Se uno di questi controlli fallisce, il server restituisce un errore 409 (Conflict) o 404.

### 4. Uso dell'IA
L'IA è stata utilizzata per il debug della connessione a Supabase, la gestione delle variabili d'ambiente su Render e la generazione dello schema SQL iniziale.

### 5. Link
- **Backend (Render):** https://compito-f5ex.onrender.com
- **Frontend (Vercel/GitHub):** (https://compito-theta.vercel.app/)


postgresql://postgres:icJYoIsCyGmxIhYK@db.hqsqjwgelyoqnkrfhngi.supabase.co:5432/postgres