const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const Usuario = require('../models/Usuario');

// ROTA GET: Obter a chave de API do usuário logado (para exibir no frontend)
router.get('/apikey', authMiddleware, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuario.id).select('geminiApiKey');
        res.json({ apiKey: usuario.geminiApiKey || '' });
    } catch (err) { res.status(500).send('Erro no servidor.'); }
});

// ROTA PUT: Salvar/Atualizar a chave de API do usuário logado
router.put('/apikey', authMiddleware, async (req, res) => {
    const { apiKey } = req.body;
    try {
        await Usuario.findByIdAndUpdate(req.usuario.id, { geminiApiKey: apiKey });
        res.json({ msg: 'Chave de API salva com sucesso!' });
    } catch (err) { res.status(500).send('Erro no servidor.'); }
});

module.exports = router;