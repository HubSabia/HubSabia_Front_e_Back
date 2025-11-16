const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const Campanha = require('../models/Campanha');
const { validateObjectId } = require('../utils/validation');
const dataInicio = new Date(periodo_inicio);
const dataFim = new Date(periodo_fim);

// ROTA PARA LISTAR (GET) - Sem alterações
router.get('/', authMiddleware, async (req, res) => {
    try {
        const campanhas = await Campanha.find({ criador: req.usuario.id })
            .populate('editais', 'titulo') // Traz os títulos dos editais junto
            .populate('chatbot', 'nome status') // Traz info do chatbot se existir
            .sort({ createdAt: -1 })
            .lean(); // Melhora performance transformando em objeto JS puro
        
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
    if (nome.trim().length < 3) {
        return res.status(400).json({ msg: 'O nome da campanha deve ter pelo menos 3 caracteres.' });
    }
    
    if (nome.trim().length > 100) {
        return res.status(400).json({ msg: 'O nome da campanha deve ter no máximo 100 caracteres.' });
    }
    
    if (descricao && descricao.length > 500) {
        return res.status(400).json({ msg: 'A descrição deve ter no máximo 500 caracteres.' });
    }
    if (isNaN(dataInicio.getTime()) || isNaN(dataFim.getTime())) {
    return res.status(400).json({ msg: 'Datas inválidas fornecidas.' });
}

if (dataInicio >= dataFim) {
    return res.status(400).json({ msg: 'A data de início deve ser anterior à data de fim.' });
}
    try {
        const novaCampanha = new Campanha({
            nome, descricao, periodo_inicio, periodo_fim, status, publico_alvo, editais,
            criador: req.usuario.id
        });
        const campanhaSalva = await novaCampanha.save();
        res.status(201).json(campanhaSalva);
        const cincAnos = new Date();
        cincAnos.setFullYear(cincAnos.getFullYear() + 5);
        if (dataInicio > cincAnos) {
        return res.status(400).json({ msg: 'A data de início não pode ser mais de 5 anos no futuro.' });
}
    } catch (err) {
        console.error("Erro ao criar campanha:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// ==========================================================
// ROTA PARA EXCLUIR (DELETE)
// ==========================================================
router.delete('/:id', authMiddleware, validateObjectId, async (req, res) => {
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
router.put('/:id', authMiddleware, validateObjectId, async (req, res) => {
    const { nome, descricao, periodo_inicio, periodo_fim, status, publico_alvo, editais } = req.body;

    if (periodo_inicio && periodo_fim) {
        const dataInicio = new Date(periodo_inicio);
        const dataFim = new Date(periodo_fim);

        if (isNaN(dataInicio.getTime()) || isNaN(dataFim.getTime())) {
            return res.status(400).json({ msg: 'Datas inválidas fornecidas.' });
        }

        if (dataInicio >= dataFim) {
            return res.status(400).json({ msg: 'A data de início deve ser anterior à data de fim.' });
        }
        const cincAnos = new Date();
        cincAnos.setFullYear(cincAnos.getFullYear() + 5);
        if (dataInicio > cincAnos) {
            return res.status(400).json({ msg: 'A data de início não pode ser mais de 5 anos no futuro.' });
        }
    }

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