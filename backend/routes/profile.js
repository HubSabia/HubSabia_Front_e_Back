const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const Usuario = require('../models/Usuario');

// ROTA GET: Obter a chave de API do usuário logado
router.get('/apikey', authMiddleware, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuario.id).select('geminiApiKey');
        if (!usuario) {
            return res.status(404).json({ msg: 'Usuário não encontrado.' });
        }
        res.json({ apiKey: usuario.geminiApiKey || '' });
    } catch (err) {
        console.error("Erro ao buscar chave de API:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// ROTA PUT: Salvar/Atualizar a chave de API do usuário logado
router.put('/apikey', authMiddleware, async (req, res) => {
    const { apiKey } = req.body;
    // Validação simples para garantir que a chave não é vazia
    if (typeof apiKey !== 'string') {
        return res.status(400).json({ msg: 'Formato de chave de API inválido.' });
    }
    try {
        await Usuario.findByIdAndUpdate(req.usuario.id, { geminiApiKey: apiKey.trim() });
        res.json({ msg: 'Chave de API salva com sucesso!' });
    } catch (err) {
        console.error("Erro ao salvar chave de API:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

module.exports = router;