const express = require('express');
const router = express.Router();
const authMiddleware = require('../models/Chatbot');
// Vamos comentar a linha do modelo por enquanto, já que ele também pode não existir
// const Chatbot = require('../models/Chatbot'); 

// ROTA GET: Listar todos os chatbots (retorna uma lista vazia por enquanto)
router.get('/', authMiddleware, async (req, res) => {
    try {
        // Lógica para buscar chatbots do banco de dados virá aqui
        res.json([]); // Retorna uma lista vazia por enquanto
    } catch (err) {
        console.error("Erro ao listar chatbots:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

module.exports = router;