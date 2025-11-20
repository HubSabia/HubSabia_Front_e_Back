const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const Campanha = require('../models/Campanha');
const { validateObjectId } = require('../utils/validation');

// ROTA PARA LISTAR (GET)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const campanhas = await Campanha.find({ criador: req.usuario.id })
            .populate('editais', 'titulo')
            .populate('chatbot', 'nome status')
            .sort({ createdAt: -1 })
            .lean();
        
        res.json(campanhas);
    } catch (err) {
        console.error("Erro ao listar campanhas:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// ROTA POST: Criar
router.post('/', authMiddleware, async (req, res) => {
    const { nome, descricao, periodo_inicio, periodo_fim, status, publico_alvo, editais, imagemUrl} = req.body;
    
    
    // Validação de campos obrigatórios
    if (!nome || !periodo_inicio || !periodo_fim) {
        return res.status(400).json({ msg: 'Por favor, inclua nome e período da campanha.' });
    }
    
    // Validação de comprimento do nome
    if (nome.trim().length < 3) {
        return res.status(400).json({ msg: 'O nome da campanha deve ter pelo menos 3 caracteres.' });
    }
    
    if (nome.trim().length > 100) {
        return res.status(400).json({ msg: 'O nome da campanha deve ter no máximo 100 caracteres.' });
    }
    
    // Validação de descrição
    if (descricao && descricao.length > 500) {
        return res.status(400).json({ msg: 'A descrição deve ter no máximo 500 caracteres.' });
    }
    
    // Validação de datas
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
    
    try {
        const novaCampanha = new Campanha({
            nome, descricao, periodo_inicio, periodo_fim, status, publico_alvo, editais, imagemUrl,
            criador: req.usuario.id
        });
        const campanhaSalva = await novaCampanha.save();
        res.status(201).json(campanhaSalva);
    } catch (err) {
        console.error("Erro ao criar campanha:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// ROTA PARA EXCLUIR (DELETE)
router.delete('/:id', authMiddleware, validateObjectId, async (req, res) => {
    try {
        const campanha = await Campanha.findById(req.params.id);
        if (!campanha) {
            return res.status(404).json({ msg: 'Campanha não encontrada.' });
        }

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

// ROTA PUT: Editar
router.put('/:id', authMiddleware, validateObjectId, async (req, res) => {
    const { nome, descricao, periodo_inicio, periodo_fim, status, publico_alvo, editais, imagemUrl } = req.body;

    if (imagemUrl) camposAtualizados.imagemUrl = imagemUrl;

    // Validação de comprimento (se nome foi enviado)
    if (nome && nome.trim().length < 3) {
        return res.status(400).json({ msg: 'O nome da campanha deve ter pelo menos 3 caracteres.' });
    }
    
    if (nome && nome.trim().length > 100) {
        return res.status(400).json({ msg: 'O nome da campanha deve ter no máximo 100 caracteres.' });
    }
    
    // Validação de descrição (se foi enviada)
    if (descricao && descricao.length > 500) {
        return res.status(400).json({ msg: 'A descrição deve ter no máximo 500 caracteres.' });
    }
    
    // Validação de datas (se AMBAS foram enviadas)
    if (periodo_inicio && periodo_fim) {
        const dataInicio = new Date(periodo_inicio);
        const dataFim = new Date(periodo_fim);

        if (isNaN(dataInicio.getTime()) || isNaN(dataFim.getTime())) {
            return res.status(400).json({ msg: 'Datas inválidas fornecidas.' });
        }

        if (dataInicio >= dataFim) {
            return res.status(400).json({ msg: 'A data de início deve ser anterior à data de fim.' });
        }
    }

    const camposAtualizados = { nome, descricao, periodo_inicio, periodo_fim, status, publico_alvo, editais };
    Object.keys(camposAtualizados).forEach(key => camposAtualizados[key] === undefined && delete camposAtualizados[key]);

    try {
        let campanha = await Campanha.findById(req.params.id);
        if (!campanha) { 
            return res.status(404).json({ msg: 'Campanha não encontrada.' }); 
        }

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