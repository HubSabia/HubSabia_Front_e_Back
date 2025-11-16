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
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 10, // 10 requisições
    message: { msg: 'Você está enviando mensagens muito rápido. Aguarde um minuto.' },
    standardHeaders: true,
    legacyHeaders: false,
});

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


// --- ROTAS ESPECÍFICAS (por ID) ---

// POST /api/chatbots/:id/interagir (ATUALIZADO PARA USAR A CHAVE DO USUÁRIO)
router.post('/:id/interagir', authMiddleware, validateObjectId, chatLimiter, async (req, res) => {
    const { mensagemUsuario } = req.body;
    if (!mensagemUsuario) {
        return res.status(400).json({ msg: 'A mensagem do usuário é obrigatória.' });
    }
    try {
        // 1. Busca o usuário logado para obter sua chave de API
        const usuario = await Usuario.findById(req.usuario.id);
        if (!usuario || !usuario.geminiApiKey) {
            return res.status(400).json({ msg: 'Nenhuma chave de API do Google AI foi configurada. Por favor, adicione sua chave na sua página de perfil.' });
        }
        
        // 2. Inicializa a IA com a CHAVE DO USUÁRIO
        const genAI = new GoogleGenerativeAI(usuario.geminiApiKey);
        
        const chatbot = await Chatbot.findById(req.params.id).populate({
                 path: 'campanha',
                 populate: { path: 'editais', model: 'Edital' }
            });

        if (!chatbot || !chatbot.campanha) {
            return res.status(404).json({ msg: 'Configuração do chatbot ou campanha associada não encontrada.' });
        }
        
        const hoje = new Date();
        const dataFim = new Date(chatbot.campanha.periodo_fim);
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

        const contexto = chatbot.campanha.editais.map(e => `Título: ${e.titulo}\nConteúdo: ${e.conteudo}`).join('\n\n---\n\n');
        const dataFormatada = hoje.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        
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
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const respostaDaIA = response.text();

            // Salvar no histórico de conversas
            const sessaoId = crypto.randomBytes(16).toString('hex');

            const novoHistorico = new HistoricoConversa({
                chatbot: chatbot._id,
                usuario: req.usuario.id,
                sessaoId: sessaoId,               
                pergunta: mensagemUsuario,      
                resposta: respostaDaIA
            });
            await novoHistorico.save();

            res.json({ resposta: respostaDaIA });
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

// GET /api/chatbots/:id/historico -> Listar o histórico de conversas
router.get('/:id/historico', authMiddleware, async (req, res) => {
    try {
        const chatbot = await Chatbot.findById(req.params.id);
        if (!chatbot) { return res.status(404).json({ msg: 'Chatbot não encontrado.' }); }
        // Verifica se o usuário logado é o criador do chatbot
        if (chatbot.criador.toString() !== req.usuario.id) { return res.status(401).json({ msg: 'Ação não autorizada.' }); }

        const historico = await HistoricoConversa.find({ chatbot: req.params.id })
            .sort({ dataInteracao: 1 }) // Ordena da mais antiga para a mais recente
            .select('pergunta resposta dataInteracao usuario');

        res.json(historico);
    } catch (err) {
        console.error("Erro ao buscar histórico do chatbot:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// GET /api/chatbots/:id/historico-usuario -> Listar o histórico de conversas do usuário logado com este chatbot
router.get('/:id/historico-usuario', authMiddleware, async (req, res) => {
    try {
        const chatbot = await Chatbot.findById(req.params.id);
        if (!chatbot) { return res.status(404).json({ msg: 'Chatbot não encontrado.' }); }
        
        // O histórico é filtrado pelo chatbot e pelo usuário logado
        const historico = await HistoricoConversa.find({ 
            chatbot: req.params.id,
            usuario: req.usuario.id // Filtra pelo usuário logado
        })
            .sort({ dataInteracao: 1 }) // Ordena da mais antiga para a mais recente
             .select('pergunta resposta dataInteracao');

        res.json(historico);
    } catch (err) {
        console.error("Erro ao buscar histórico do usuário:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// GET /api/chatbots/:id -> Buscar um chatbot específico
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const chatbot = await Chatbot.findById(req.params.id).populate('campanha', 'nome');
        if (!chatbot) { 
            return res.status(404).json({ msg: 'Chatbot não encontrado.' }); 
        }
        // Se o usuário NÃO for o criador E também NÃO for um admin, bloqueie.
        if (chatbot.criador.toString() !== req.usuario.id && req.usuario.role !== 'admin') { 
            return res.status(401).json({ msg: 'Ação não autorizada.' }); 
        }
        res.json(chatbot);
    } catch (err) {
        console.error("Erro ao buscar chatbot:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});
// ==========================================================
// PUT /api/chatbots/:id -> Editar um chatbot
// ==========================================================
router.put('/:id', authMiddleware, validateObjectId, async (req, res) => {
    const { nome, status, campanha } = req.body;
    const camposAtualizados = { nome, status, campanha };
    Object.keys(camposAtualizados).forEach(key => camposAtualizados[key] === undefined && delete camposAtualizados[key]);
    
    try {
        let chatbot = await Chatbot.findById(req.params.id);
        if (!chatbot) { 
            return res.status(404).json({ msg: 'Chatbot não encontrado.' }); 
        }
        // Se o usuário NÃO for o criador E também NÃO for um admin, bloqueie.
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

// ==========================================================
// DELETE /api/chatbots/:id -> Excluir um chatbot
// ==========================================================
router.delete('/:id', authMiddleware, validateObjectId, async (req, res) => {
    try {
        const chatbot = await Chatbot.findById(req.params.id);
        if (!chatbot) { 
            return res.status(404).json({ msg: 'Chatbot não encontrado.' }); 
        }
        // Se o usuário NÃO for o criador E também NÃO for um admin, bloqueie.
        if (chatbot.criador.toString() !== req.usuario.id && req.usuario.role !== 'admin') { 
            return res.status(401).json({ msg: 'Ação não autorizada.' }); 
        }
        
        // Adicional: Excluir o histórico de conversas associado
        await HistoricoConversa.deleteMany({ chatbot: req.params.id });

        await Chatbot.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Chatbot e seu histórico foram removidos com sucesso.' });
    } catch (err) {
        console.error("Erro ao excluir chatbot:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

module.exports = router;

