// backend/routes/index.js (VERSÃO CORRIGIDA)

const express = require('express');
const router = express.Router();

// Rota de teste para a raiz da API
router.get('/', (req, res) => {
    res.send('API do HubSabia está funcionando!');
});

module.exports = router;