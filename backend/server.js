const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Servidor de teste está no ar!');
});

app.listen(PORT, () => console.log(`Servidor de TESTE rodando na porta ${PORT}`));