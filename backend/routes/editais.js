const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const Edital = require('../models/Edital');

// ROTA GET: Lista TODOS os editais criados pelo usuário logado
router.get('/', authMiddleware, async (req, res) => {
    try {
        const editais = await Edital.find({ criador: req.usuario.id }).sort({ createdAt: -1 });
        res.json(editais);
    } catch (err) { res.status(500).send('Erro no servidor.'); }
});

// ROTA POST: Cria um novo edital na "biblioteca" do usuário
router.post('/', authMiddleware, async (req, res) => {
    const { titulo, conteudo } = req.body;
    if (!titulo || !conteudo) {
        return res.status(400).json({ msg: 'Título e conteúdo são obrigatórios.' });
    }
    try {
        const novoEdital = new Edital({
            titulo,
            conteudo,
            criador: req.usuario.id
        });
        const editalSalvo = await novoEdital.save();
        res.status(201).json(editalSalvo);
    } catch (err) { res.status(500).send('Erro no servidor.'); }
});

// Implementaremos PUT e DELETE depois.

module.exports = router;