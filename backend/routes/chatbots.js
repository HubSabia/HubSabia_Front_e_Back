// Arquivo: backend/routes/chatbots.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const Chatbot = require('../models/Chatbot');
const Edital = require('../models/Edital');
const Campanha = require('../models/Campanha');

// MUDANÇA 1: Importa a biblioteca do Google AI
const { GoogleGenerativeAI } = require('@google/generative-ai');

// MUDANÇA 2: Configura a API com a sua chave do .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// --- ROTAS GERAIS (CRUD Básico) ---

// GET /api/chatbots -> Listar todos os chatbots do usuário
router.get('/', authMiddleware, async (req, res) => {
    try {
        const chatbots = await Chatbot.find({ criador: req.usuario.id })
            .populate('campanha', 'nome')
            .sort({ createdAt: -1 });
        res.json(chatbots);
    } catch (err) {
        console.error("Erro ao listar chatbots:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// POST /api/chatbots -> Criar um novo chatbot
router.post('/', authMiddleware, async (req, res) => {
    const { nome, status, campanha } = req.body;
    if (!nome || !campanha) {
        return res.status(400).json({ msg: 'Nome e campanha associada são obrigatórios.' });
    }
    try {
        const campanhaExiste = await Campanha.findOne({ _id: campanha, criador: req.usuario.id });
        if (!campanhaExiste) {
            return res.status(404).json({ msg: 'Campanha não encontrada ou não autorizada.' });
        }
        const novoChatbot = new Chatbot({ nome, status, campanha, criador: req.usuario.id });
        const chatbotSalvo = await novoChatbot.save();
        const chatbotPopulado = await Chatbot.findById(chatbotSalvo._id).populate('campanha', 'nome');
        res.status(201).json(chatbotPopulado);
    } catch (err) {
        console.error("Erro ao criar chatbot:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});


// --- ROTAS ESPECÍFICAS (por ID) ---

// POST /api/chatbots/:id/interagir -> Interagir com um chatbot (ATUALIZADO COM IA E LÓGICA DE DATA)
router.post('/:id/interagir', authMiddleware, async (req, res) => {
    const { mensagemUsuario } = req.body;
    if (!mensagemUsuario) {
        return res.status(400).json({ msg: 'A mensagem do usuário é obrigatória.' });
    }
    try {
        const chatbot = await Chatbot.findById(req.params.id).populate({
                 path: 'campanha',
                 populate: { path: 'editais', model: 'Edital' }
            });

        if (!chatbot || !chatbot.campanha) {
            return res.status(404).json({ msg: 'Configuração do chatbot ou campanha associada não encontrada.' });
        }
        
        // --- INÍCIO DA LÓGICA DE DATA ---
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const dataFim = new Date(chatbot.campanha.periodo_fim);
        dataFim.setHours(23, 59, 59, 999);

        let infoDeData = "";
        if (hoje > dataFim) {
            infoDeData = `Atenção: As inscrições para esta campanha já foram encerradas em ${dataFim.toLocaleDateString('pt-BR')}.`;
        } else {
            const diffTime = Math.abs(dataFim - hoje);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 7) {
                infoDeData = `Atenção: Faltam apenas ${diffDays} dia(s) para o encerramento das inscrições!`;
            }
        }
        // --- FIM DA LÓGICA DE DATA ---
        
        const contexto = chatbot.campanha.editais.map(e => `Título: ${e.titulo}\nConteúdo: ${e.conteudo}`).join('\n\n---\n\n');
        
        try {
            const safetySettings = [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            ];

            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySettings });

            const prompt = `INSTRUÇÕES PARA O ASSISTENTE:
            1. Você é um assistente virtual do IFPR.
            2. Sua ÚNICA fonte de conhecimento é o "Contexto dos Editais" fornecido abaixo.
            3. Responda à "Pergunta do Usuário" usando APENAS informações do contexto.
            4. Se a pergunta não pode ser respondida com o contexto, responda EXATAMENTE: "Desculpe, não tenho informações sobre isso. Minhas respostas são baseadas apenas nos editais da campanha atual."
            5. Não invente informações nem responda a perguntas sobre outros tópicos.
            6. A data de hoje é ${dataFormatada}. ${infoDeData} Use esta informação de data se for relevante para a pergunta.

            ---
            CONTEXTO DOS EDITAIS:
            ${contexto}
            ---
            PERGUNTA DO USUÁRIO:
            ${mensagemUsuario}
            `;

            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const respostaDaIA = response.text();

            res.json({ resposta: respostaDaIA });

        } catch (iaError) {
            console.error("Erro da API do Google AI:", iaError);
            res.status(500).json({ msg: 'Ocorreu um erro ao se comunicar com o serviço de IA.' });
        }

    } catch (err) {
        console.error("Erro na interação com o chatbot:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// GET /api/chatbots/:id -> Buscar um chatbot específico
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const chatbot = await Chatbot.findById(req.params.id).populate('campanha', 'nome');
        if (!chatbot) { return res.status(404).json({ msg: 'Chatbot não encontrado.' }); }
        if (chatbot.criador.toString() !== req.usuario.id) { return res.status(401).json({ msg: 'Ação não autorizada.' }); }
        res.json(chatbot);
    } catch (err) {
        console.error("Erro ao buscar chatbot:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// PUT /api/chatbots/:id -> Editar um chatbot
router.put('/:id', authMiddleware, async (req, res) => {
    const { nome, status, campanha } = req.body;
    const camposAtualizados = {};
    if (nome) camposAtualizados.nome = nome;
    if (status) camposAtualizados.status = status;
    if (campanha) camposAtualizados.campanha = campanha;
    
    try {
        let chatbot = await Chatbot.findById(req.params.id);
        if (!chatbot) { return res.status(404).json({ msg: 'Chatbot não encontrado.' }); }
        if (chatbot.criador.toString() !== req.usuario.id) { return res.status(401).json({ msg: 'Ação não autorizada.' }); }
        
        chatbot = await Chatbot.findByIdAndUpdate(
            req.params.id,
            { $set: camposAtualizados },
            { new: true }
        ).populate('campanha', 'nome');
        
        res.json(chatbot);
    } catch (err) {
        console.error("Erro ao editar chatbot:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// DELETE /api/chatbots/:id -> Excluir um chatbot
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const chatbot = await Chatbot.findById(req.params.id);
        if (!chatbot) { return res.status(404).json({ msg: 'Chatbot não encontrado.' }); }
        if (chatbot.criador.toString() !== req.usuario.id) { return res.status(401).json({ msg: 'Ação não autorizada.' }); }
        
        await Chatbot.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Chatbot removido com sucesso.' });
    } catch (err) {
        console.error("Erro ao excluir chatbot:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});


module.exports = router;