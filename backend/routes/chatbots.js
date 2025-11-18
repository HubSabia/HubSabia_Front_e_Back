const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const authMiddleware = require('../middlewares/auth');
const Chatbot = require('../models/Chatbot');
const HistoricoConversa = require('../models/HistoricoConversa');
const Edital = require('../models/Edital');
const Campanha = require('../models/Campanha');
const Usuario = require('../models/Usuario');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { validateObjectId } = require('../utils/validation');
const rateLimit = require('express-rate-limit');

const chatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: { msg: 'Você está enviando mensagens muito rápido. Aguarde um minuto.' },
    standardHeaders: true,
    legacyHeaders: false,
});

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
    if (nome.trim().length < 3) {
        return res.status(400).json({ msg: 'O nome do chatbot deve ter pelo menos 3 caracteres.' });
    }
    if (nome.trim().length > 50) {
        return res.status(400).json({ msg: 'O nome do chatbot deve ter no máximo 50 caracteres.' });
    }
    try {
        const campanhaExiste = await Campanha.findOne({ _id: campanha, criador: req.usuario.id });
        if (!campanhaExiste) {
            return res.status(404).json({ msg: 'Campanha não encontrada ou não autorizada.' });
        }
        const novoChatbot = new Chatbot({ nome, status, campanha, criador: req.usuario.id });
        const chatbotSalvo = await novoChatbot.save();
        campanhaExiste.chatbot = chatbotSalvo._id;
        await campanhaExiste.save();
        const chatbotPopulado = await Chatbot.findById(chatbotSalvo._id).populate('campanha', 'nome');
        res.status(201).json(chatbotPopulado);
    } catch (err) {
        console.error("Erro ao criar chatbot:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// POST /api/chatbots/:id/interagir -> Interagir com o chatbot (ROTA PRIVADA)
router.post('/:id/interagir', authMiddleware, validateObjectId, chatLimiter, async (req, res) => {
    const { mensagemUsuario, sessaoId: sessaoIdRecebida } = req.body;

    if (!mensagemUsuario) {
        return res.status(400).json({ msg: 'A mensagem do usuário é obrigatória.' });
    }
    
    try {
        const usuario = await Usuario.findById(req.usuario.id);
        if (!usuario || !usuario.geminiApiKey) {
            return res.status(400).json({ msg: 'Nenhuma chave de API do Google AI foi configurada. Por favor, adicione sua chave na sua página de perfil.' });
        }
        
        const genAI = new GoogleGenerativeAI(usuario.geminiApiKey);
        const chatbot = await Chatbot.findById(req.params.id).populate({
            path: 'campanha',
            populate: { path: 'editais', model: 'Edital' }
        });
        
        if (!chatbot || !chatbot.campanha) {
            return res.status(404).json({ msg: 'Configuração do chatbot ou campanha associada não encontrada.' });
        }

        const contexto = chatbot.campanha.editais.map(e => `Título: ${e.titulo}\nConteúdo: ${e.conteudo}`).join('\n\n---\n\n');
        const hoje = new Date();
        const dataFormatada = hoje.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        
        const dataFim = new Date(chatbot.campanha.periodo_fim);
        let infoDeData = "";
        if (hoje > dataFim) {
            infoDeData = `Atenção: As inscrições para esta campanha já foram encerradas em ${dataFim.toLocaleDateString('pt-BR')}.`;
        }
        
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
        
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const respostaDaIA = response.text();

            const sessaoId = sessaoIdRecebida || crypto.randomBytes(16).toString('hex');

            const novoHistorico = new HistoricoConversa({
                chatbot: chatbot._id,
                usuario: req.usuario.id,
                sessaoId: sessaoId,               
                pergunta: mensagemUsuario,      
                resposta: respostaDaIA
            });
            await novoHistorico.save();

            res.json({ resposta: respostaDaIA, sessaoId: sessaoId });

        } catch (iaError) {
            console.error("Erro da API do Google AI:", iaError);

            if (iaError.status === 503) {
                return res.status(503).json({ msg: 'O assistente de IA está sobrecarregado no momento. Por favor, tente novamente em alguns instantes.' });
            }
            res.status(500).json({ msg: 'Ocorreu um erro ao se comunicar com o serviço de IA. Verifique se sua chave de API é válida ou se o serviço está online.' });
        }

    } catch (err) {
        console.error("Erro na interação com o chatbot:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// GET /api/chatbots/:id/historico-usuario -> Listar o histórico de conversas do usuário logado
router.get('/:id/historico-usuario', authMiddleware, async (req, res) => {
    try {
        const chatbot = await Chatbot.findById(req.params.id);
        if (!chatbot) { 
            return res.status(404).json({ msg: 'Chatbot não encontrado.' }); 
        }
        
        const historico = await HistoricoConversa.find({ 
            chatbot: req.params.id,
            usuario: req.usuario.id
        })
        .sort({ createdAt: 'asc' })
        .select('pergunta resposta sessaoId createdAt');

        res.json(historico);
    } catch (err) {
        console.error("Erro ao buscar histórico do usuário:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// GET /api/chatbots/:id -> Buscar um chatbot específico
router.get('/:id', authMiddleware, validateObjectId, async (req, res) => {
    try {
        const chatbot = await Chatbot.findById(req.params.id).populate('campanha', 'nome');
        if (!chatbot) { 
            return res.status(404).json({ msg: 'Chatbot não encontrado.' }); 
        }
        if (chatbot.criador.toString() !== req.usuario.id && req.usuario.role !== 'admin') { 
            return res.status(401).json({ msg: 'Ação não autorizada.' }); 
        }
        res.json(chatbot);
    } catch (err) {
        console.error("Erro ao buscar chatbot:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// PUT /api/chatbots/:id -> Editar um chatbot
router.put('/:id', authMiddleware, validateObjectId, async (req, res) => {
    const { nome, status, campanha } = req.body;
    const camposAtualizados = { nome, status, campanha };
    Object.keys(camposAtualizados).forEach(key => camposAtualizados[key] === undefined && delete camposAtualizados[key]);
    
    try {
        let chatbot = await Chatbot.findById(req.params.id);
        if (!chatbot) { 
            return res.status(404).json({ msg: 'Chatbot não encontrado.' }); 
        }
        if (chatbot.criador.toString() !== req.usuario.id && req.usuario.role !== 'admin') { 
            return res.status(401).json({ msg: 'Ação não autorizada.' }); 
        }
        
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
router.delete('/:id', authMiddleware, validateObjectId, async (req, res) => {
    try {
        const chatbot = await Chatbot.findById(req.params.id);
        if (!chatbot) { 
            return res.status(404).json({ msg: 'Chatbot não encontrado.' }); 
        }
        if (chatbot.criador.toString() !== req.usuario.id && req.usuario.role !== 'admin') { 
            return res.status(401).json({ msg: 'Ação não autorizada.' }); 
        }
        
        await HistoricoConversa.deleteMany({ chatbot: req.params.id });
        await Chatbot.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Chatbot e seu histórico foram removidos com sucesso.' });
    } catch (err) {
        console.error("Erro ao excluir chatbot:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

module.exports = router;