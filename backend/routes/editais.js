const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const Edital = require('../models/Edital');

// ROTA GET: Listar todos os editais
router.get('/', authMiddleware, async (req, res) => {
    try {
        const editais = await Edital.find({ criador: req.usuario.id }).sort({ data_publicacao: -1 });
        res.json(editais);
    } catch (err) { res.status(500).send('Erro no servidor.'); }
});

// ROTA POST: Criar um novo edital
router.post('/', authMiddleware, async (req, res) => {
    // Usando os campos simplificados: titulo, conteudo, data_publicacao
    const { titulo, conteudo, data_publicacao } = req.body;
    
    if (!titulo || !conteudo) {
        return res.status(400).json({ msg: 'Título e conteúdo são obrigatórios.' });
    }
    try {
        const novoEdital = new Edital({
            titulo,
            conteudo,
            data_publicacao,
            criador: req.usuario.id
        });
        const editalSalvo = await novoEdital.save();
        res.status(201).json(editalSalvo);
    } catch (err) { res.status(500).send('Erro no servidor.'); }
});

module.exports = router;