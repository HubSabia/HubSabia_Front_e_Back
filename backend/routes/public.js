const express = require('express');
const router = express.Router();
const Chatbot = require('../models/Chatbot');
const Usuario = require('../models/Usuario');

const { GoogleGenerativeAI } = require('@google/generative-ai');

// ROTA GET PÚBLICA: Buscar informações básicas de um chatbot.
router.get('/chatbots/:id', async (req, res) => {
    try {
        const chatbot = await Chatbot.findById(req.params.id).select('nome');
        if (!chatbot) {
            return res.status(404).json({ msg: 'Chatbot não encontrado.' });
        }
        res.json(chatbot);
    } catch (err) {
        res.status(500).send('Erro no servidor.');
    }
});

// ROTA POST PÚBLICA: Interagir com o chatbot.
router.post('/chatbots/:id/interagir', async (req, res) => {
    const { mensagemUsuario } = req.body;
    if (!mensagemUsuario) {
        return res.status(400).json({ msg: 'A mensagem do usuário é obrigatória.' });
    }
    try {
        const chatbot = await Chatbot.findById(req.params.id).populate({
            path: 'campanha',
            populate: { path: 'editais', model: 'Edital' }
        });

        if (!chatbot || !chatbot.campanha || chatbot.status !== 'Ativo') {
            return res.status(403).json({ msg: 'Este chatbot não está disponível para conversa no momento.' });
        }
        
        // MUDANÇA CRUCIAL: Busca o criador do chatbot para pegar a chave de API.
        const criador = await Usuario.findById(chatbot.criador);
        if (!criador || !criador.geminiApiKey) {
            return res.status(500).json({ msg: 'O proprietário deste chatbot não configurou uma chave de API válida.' });
        }
        
        // Inicializa a IA com a chave do CRIADOR do bot
        const genAI = new GoogleGenerativeAI(criador.geminiApiKey);

        // A lógica de data, contexto e prompt continua a mesma
        const hoje = new Date();
        const dataFim = new Date(chatbot.campanha.periodo_fim);
        let infoDeData = ""; // Adapte sua lógica de data aqui
        const contexto = chatbot.campanha.editais.map(e => `Título: ${e.titulo}\nConteúdo: ${e.conteudo}`).join('\n\n');
        const dataFormatada = hoje.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        
        const prompt = `INSTRUÇÕES... PERGUNTA DO USUÁRIO: ${mensagemUsuario}`; // Seu prompt completo
        
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const respostaDaIA = result.response.text();
        
        res.json({ resposta: respostaDaIA });

    } catch (err) {
        console.error("Erro na interação pública:", err.message);
        // Verifica se o erro é da API do Google para dar uma resposta melhor
        if (err.name === 'GoogleGenerativeAIFetchError') {
            return res.status(503).json({ msg: 'O serviço de IA está indisponível ou a chave de API é inválida.' });
        }
        res.status(500).send('Erro no servidor.');
    }
});

module.exports = router;
