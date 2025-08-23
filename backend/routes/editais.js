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

// ==========================================================
// ROTA PARA EXCLUIR (DELETE)
// ==========================================================
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const edital = await Edital.findById(req.params.id);
        if (!edital) {
            return res.status(404).json({ msg: 'Edital não encontrado.' });
        }
        // Segurança: Apenas o criador pode excluir
        if (edital.criador.toString() !== req.usuario.id) {
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
router.put('/:id', authMiddleware, async (req, res) => {
    const { titulo, conteudo } = req.body;
    const camposAtualizados = {};
    if (titulo) camposAtualizados.titulo = titulo;
    if (conteudo) camposAtualizados.conteudo = conteudo;

    try {
        let edital = await Edital.findById(req.params.id);
        if (!edital) { return res.status(404).json({ msg: 'Edital não encontrado.' }); }
        if (edital.criador.toString() !== req.usuario.id) { return res.status(401).json({ msg: 'Ação não autorizada.' }); }
        
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