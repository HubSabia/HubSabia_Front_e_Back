const express = require('express');
const router = express.Router();
const Chatbot = require('../models/Chatbot');
const Usuario = require('../models/Usuario');
const Edital = require('../models/Edital');
const Campanha = require('../models/Campanha');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ==========================================================
// --- MÓDULOS NECESSÁRIOS ADICIONADOS AQUI ---
// ==========================================================
const crypto = require('crypto');
const HistoricoConversa = require('../models/HistoricoConversa');
// ==========================================================


// ROTA 1: Buscar informações de UM chatbot específico (continua igual)
router.get('/chatbots/:id', async (req, res) => {
    // ... seu código existente aqui ...
});

// ROTA 2: Listar campanhas ativas (continua igual)
router.get('/campanhas', async (req, res) => {
    // ... seu código existente aqui ...
});

// ==========================================================
// --- ROTA 3: Interagir com um chatbot (CÓDIGO CORRIGIDO) ---
// ==========================================================
router.post('/chatbots/:id/interagir', async (req, res) => {
    // Agora aceita tanto a mensagem quanto o ID da sessão
    const { mensagemUsuario, sessaoId: sessaoIdRecebida } = req.body;
    
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
        const contexto = chatbot.campanha.editais.map(e => `Título: ${e.titulo}\nConteúdo: ${e.conteudo}`).join('\n\n');
        const hoje = new Date();
        const dataFormatada = hoje.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        
        // Lógica de data que estava faltando na rota pública
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
PERGUNTA DO USUÁRIO:${mensagemUsuario}`;
        
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
        const result = await model.generateContent(prompt);
        const respostaDaIA = result.response.text();
        
        // --- LÓGICA DE SESSÃO E HISTÓRICO ADICIONADA ---
        const sessaoId = sessaoIdRecebida || crypto.randomBytes(16).toString('hex');

        // Salva a conversa no histórico, mas sem ID de usuário (pois é público)
        const novoHistorico = new HistoricoConversa({
            chatbot: chatbot._id,
            usuario: null, // Importante: usuário anônimo
            sessaoId: sessaoId,               
            pergunta: mensagemUsuario,      
            resposta: respostaDaIA
        });
        await novoHistorico.save();
        // --- FIM DA LÓGICA DE SESSÃO E HISTÓRICO ---

        // Retorna a resposta E o ID da sessão, exatamente como a rota privada faz
        res.json({ resposta: respostaDaIA, sessaoId: sessaoId });

    } catch (err) {
        console.error("Erro na interação pública:", err.message);
        if (err.name === 'GoogleGenerativeAIFetchError' || err.status === 503) {
            return res.status(503).json({ msg: 'O serviço de IA está indisponível ou a chave de API do criador é inválida/excedeu o limite. Tente novamente mais tarde.' });
        }
        res.status(500).send('Erro no servidor.');
    }
});

module.exports = router;
