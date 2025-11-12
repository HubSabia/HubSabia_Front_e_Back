const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const Campanha = require('../models/Campanha');

// ROTA PARA LISTAR (GET) - Sem alterações
router.get('/', authMiddleware, async (req, res) => {
    try {
        const campanhas = await Campanha.find({ criador: req.usuario.id }).sort({ createdAt: -1 });
        res.json(campanhas);
    } catch (err) {
        console.error("Erro ao listar campanhas:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// ROTA POST: Criar - Sem alterações
router.post('/', authMiddleware, async (req, res) => {
    const { nome, descricao, periodo_inicio, periodo_fim, status, publico_alvo, editais} = req.body;
    if (!nome || !periodo_inicio || !periodo_fim) {
        return res.status(400).json({ msg: 'Por favor, inclua nome e período da campanha.' });
    }
    try {
        const novaCampanha = new Campanha({
            nome, descricao, periodo_inicio, periodo_fim, status, publico_alvo, editais,
            criador: req.usuario.id
        });
        const campanhaSalva = await novaCampanha.save();
        res.status(201).json(campanhaSalva);
    } catch (err) {
        console.error("Erro ao criar campanha:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// ==========================================================
// ROTA PARA EXCLUIR (DELETE)
// ==========================================================
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const campanha = await Campanha.findById(req.params.id);
        if (!campanha) {
            return res.status(404).json({ msg: 'Campanha não encontrada.' });
        }

        // Se o usuário NÃO for o criador E também NÃO for um admin, bloqueie.
        if (campanha.criador.toString() !== req.usuario.id && req.usuario.role !== 'admin') {
            return res.status(401).json({ msg: 'Ação não autorizada.' });
        }

        await Campanha.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Campanha removida com sucesso.' });

    } catch (err) {
        console.error("Erro ao excluir campanha:", err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Campanha não encontrada (ID inválido).' });
        }
        res.status(500).send('Erro no servidor.');
    }
});

// ==========================================================
// ROTA PUT: Editar (ATUALIZADA)
// ==========================================================
router.put('/:id', authMiddleware, async (req, res) => {
    const { nome, descricao, periodo_inicio, periodo_fim, status, publico_alvo, editais } = req.body;

    const camposAtualizados = { nome, descricao, periodo_inicio, periodo_fim, status, publico_alvo, editais };
    // Remove campos undefined para não sobrescrever com null
    Object.keys(camposAtualizados).forEach(key => camposAtualizados[key] === undefined && delete camposAtualizados[key]);

    try {
        let campanha = await Campanha.findById(req.params.id);
        if (!campanha) { 
            return res.status(404).json({ msg: 'Campanha não encontrada.' }); 
        }

        // Se o usuário NÃO for o criador E também NÃO for um admin, bloqueie.
        if (campanha.criador.toString() !== req.usuario.id && req.usuario.role !== 'admin') { 
            return res.status(401).json({ msg: 'Ação não autorizada.' }); 
        }
        
        campanha = await Campanha.findByIdAndUpdate(
            req.params.id,
            { $set: camposAtualizados },
            { new: true }
        );
        res.json(campanha);
    } catch (err) {
        console.error("Erro ao editar campanha:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

module.exports = router;