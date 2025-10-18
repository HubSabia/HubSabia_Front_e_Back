// Arquivo: backend/routes/dashboard.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');

// Importa todos os modelos necessários
const Campanha = require('../models/Campanha');
const Edital = require('../models/Edital');
const Chatbot = require('../models/Chatbot');
const Usuario = require('../models/Usuario');

// ROTA GET: Buscar estatísticas para o dashboard
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        // Conta os documentos pertencentes ao usuário logado
        const contagemEditais = Edital.countDocuments({ criador: req.usuario.id });
        const contagemCampanhas = Campanha.countDocuments({ criador: req.usuario.id, deletadoEm: null });
        const contagemChatbots = Chatbot.countDocuments({ criador: req.usuario.id });
        
        // Busca a campanha ativa mais recente do usuário
        const atividadeRecente = Campanha.findOne({ criador: req.usuario.id, status: 'Ativa', deletadoEm: null })
                                         .sort({ createdAt: -1 });

        // A contagem total de usuários só deve ser feita se o usuário for admin
        let contagemUsuarios = Promise.resolve(0);
        if (req.usuario.role === 'admin') {
            contagemUsuarios = Usuario.countDocuments();
        }

        // Executa todas as buscas no banco de dados em paralelo
        const [
            editais,
            campanhas,
            chatbots,
            usuarios,
            recente
        ] = await Promise.all([
            contagemEditais,
            contagemCampanhas,
            contagemChatbots,
            contagemUsuarios,
            atividadeRecente
        ]);

        res.json({
            editais,
            campanhas,
            chatbots,
            usuarios,
            atividadeRecente: recente
        });

    } catch (err) {
        console.error("Erro ao buscar estatísticas do dashboard:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

module.exports = router;