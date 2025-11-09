// backend/routes/auth.js (VERSÃO DE TESTE)
const express = require('express');
const router = express.Router();

console.log('Arquivo de rotas de autenticação (auth.js) está sendo lido.');

// Rota de teste simples para garantir que o arquivo funciona.
router.get('/test', (req, res) => {
    res.send('A rota de teste de autenticação está funcionando!');
});

module.exports = router;