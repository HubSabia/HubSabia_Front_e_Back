const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const Edital = require('../models/Edital');
const { validateObjectId } = require('../utils/validation');

// ROTA GET: Listar todos os editais do usuário - Sem alterações
router.get('/', authMiddleware, async (req, res) => {
    try {
        const editais = await Edital.find({ criador: req.usuario.id }).sort({ data_publicacao: -1 });
        res.json(editais);
    } catch (err) { res.status(500).send('Erro no servidor.'); }
});

// ROTA POST: Criar um novo edital - Sem alterações
router.post('/', authMiddleware, async (req, res) => {
    const { titulo, conteudo, data_publicacao } = req.body;
    if (!titulo || !conteudo) {
        return res.status(400).json({ msg: 'Título e conteúdo são obrigatórios.' });
    }
    if (titulo.trim().length < 5) {
        return res.status(400).json({ msg: 'O título deve ter pelo menos 5 caracteres.' });
    }
    
    if (titulo.trim().length > 200) {
        return res.status(400).json({ msg: 'O título deve ter no máximo 200 caracteres.' });
    }
    
    if (conteudo.trim().length < 20) {
        return res.status(400).json({ msg: 'O conteúdo deve ter pelo menos 20 caracteres.' });
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

// ==========================================================
// ROTA PARA EXCLUIR (DELETE)
// ==========================================================
router.delete('/:id', authMiddleware, validateObjectId, async (req, res) => {
    try {
        const edital = await Edital.findById(req.params.id);
        if (!edital) {
            return res.status(404).json({ msg: 'Edital não encontrado.' });
        }
        
        // Se o usuário NÃO for o criador E também NÃO for um admin, bloqueie.
        if (edital.criador.toString() !== req.usuario.id && req.usuario.role !== 'admin') {
            return res.status(401).json({ msg: 'Ação não autorizada.' });
        }
        
        await Edital.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Edital removido com sucesso.' });
    } catch (err) {
        console.error("Erro ao excluir edital:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// ==========================================================
// ROTA PARA EDITAR (PUT)
// ==========================================================
router.put('/:id', authMiddleware, validateObjectId, async (req, res) => {
    const { titulo, conteudo } = req.body;
    const camposAtualizados = {};
    if (titulo) camposAtualizados.titulo = titulo;
    if (conteudo) camposAtualizados.conteudo = conteudo;

    try {
        let edital = await Edital.findById(req.params.id);
        if (!edital) { 
            return res.status(404).json({ msg: 'Edital não encontrado.' }); 
        }

        // Se o usuário NÃO for o criador E também NÃO for um admin, bloqueie.
        if (edital.criador.toString() !== req.usuario.id && req.usuario.role !== 'admin') { 
            return res.status(401).json({ msg: 'Ação não autorizada.' }); 
        }
        
        edital = await Edital.findByIdAndUpdate(
            req.params.id,
            { $set: camposAtualizados },
            { new: true }
        );
        res.json(edital);
    } catch (err) {
        console.error("Erro ao editar edital:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

module.exports = router;