const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const Edital = require('../models/Edital');

// ROTA GET: Lista TODOS os editais criados pelo usuário logado
router.get('/', authMiddleware, async (req, res) => {
    try {
        const editais = await Edital.find({ criador: req.usuario.id }).sort({ data_publicacao: -1, createdAt: -1 });
        res.json(editais);
    } catch (err) { 
        console.error("Erro ao listar editais:", err.message);
        res.status(500).send('Erro no servidor.'); 
    }
});

// ROTA POST: Cria um novo edital na "biblioteca" do usuário
router.post('/', authMiddleware, async (req, res) => {
    // CORREÇÃO: Usamos os campos que estão no nosso modelo Edital.js
    const { titulo, numero, orgao_publicador, link_documento, data_publicacao } = req.body;
    
    // A validação agora checa apenas o 'titulo'
    if (!titulo) {
        return res.status(400).json({ msg: 'O título do edital é obrigatório.' });
    }

    try {
        const novoEdital = new Edital({
            titulo,
            numero,
            orgao_publicador,
            link_documento,
            data_publicacao,
            criador: req.usuario.id
        });
        const editalSalvo = await novoEdital.save();
        res.status(201).json(editalSalvo);
    } catch (err) { 
        console.error("Erro ao criar edital:", err.message);
        res.status(500).send('Erro no servidor.'); 
    }
});

// Adicionaremos PUT e DELETE depois, se necessário.

module.exports = router;