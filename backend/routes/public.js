const express = require('express');
const router = express.Router();
const Chatbot = require('../models/Chatbot');
const Usuario = require('../models/Usuario');
const Edital = require('../models/Edital');
const Campanha = require('../models/Campanha');

const { GoogleGenerativeAI } = require('@google/generative-ai');

router.get('/chatbots/:id', async (req, res) => {
    try {
        console.log(`Buscando chatbot público com ID: ${req.params.id}`); // Adiciona log
        const chatbot = await Chatbot.findById(req.params.id).select('nome');
        if (!chatbot) {
            console.log(`Chatbot com ID ${req.params.id} não encontrado.`);
            return res.status(404).json({ msg: 'Chatbot não encontrado.' });
        }
        res.json(chatbot);
    } catch (err) {
        console.error("Erro ao buscar chatbot público:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// ==========================================================
// --- NOVA ROTA PARA A VITRINE DE CAMPANHAS ---
// ==========================================================
// ROTA GET PÚBLICA: Listar campanhas ativas para a vitrine
router.get('/campanhas', async (req, res) => {
    try {
        // 1. Busca no banco de dados apenas os documentos que têm status: 'Ativa'.
        const campanhasAtivas = await Campanha.find({ status: 'Ativa' })
            // 2. Ordena os resultados para mostrar os mais recentes primeiro.
            .sort({ createdAt: -1 })
            // 3. O .populate() é muito poderoso. Ele usa a referência 'criador' 
            //    para buscar o documento do usuário correspondente e incluir
            //    APENAS o campo 'nome' dele no resultado.
            .populate('criador', 'nome'); 
        
        // 4. Envia a lista de campanhas como resposta JSON.
        res.json(campanhasAtivas);
    } catch (err) {
        console.error("Erro ao buscar campanhas públicas:", err.message);
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
        
        const criador = await Usuario.findById(chatbot.criador);
        if (!criador || !criador.geminiApiKey) {
            return res.status(500).json({ msg: 'O proprietário deste chatbot não configurou uma chave de API válida.' });
        }
        
        const genAI = new GoogleGenerativeAI(criador.geminiApiKey);

        const hoje = new Date();
        const dataFim = new Date(chatbot.campanha.periodo_fim);
        let infoDeData = "";
        const contexto = chatbot.campanha.editais.map(e => `Título: ${e.titulo}\nConteúdo: ${e.conteudo}`).join('\n\n');
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
    PERGUNTA DO USUÁRIO:${mensagemUsuario}`; // Seu prompt completo
        
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
        const result = await model.generateContent(prompt);
        const respostaDaIA = result.response.text();
        
        res.json({ resposta: respostaDaIA });

    } catch (err) {
        console.error("Erro na interação pública:", err.message);
        if (err.name === 'GoogleGenerativeAIFetchError') {
            return res.status(503).json({ msg: 'O serviço de IA está indisponível ou a chave de API é inválida.' });
        }
        res.status(500).send('Erro no servidor.');
    }
});

module.exports = router;
