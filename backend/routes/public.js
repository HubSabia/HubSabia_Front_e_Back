const express = require('express');
const router = express.Router();
const Chatbot = require('../models/Chatbot');
const Usuario = require('../models/Usuario');
const Campanha = require('../models/Campanha');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ROTA 1: Buscar informações de UM chatbot específico
router.get('/chatbots/:id', async (req, res) => {
    try {
        console.log(`[PUBLIC] 🔍 Buscando chatbot com ID: ${req.params.id}`);
        const chatbot = await Chatbot.findById(req.params.id).select('nome status');
        
        if (!chatbot) {
            console.log(`[PUBLIC] ❌ Chatbot não encontrado`);
            return res.status(404).json({ msg: 'Chatbot não encontrado.' });
        }
        
        console.log(`[PUBLIC] ✅ Chatbot encontrado: ${chatbot.nome}, Status: ${chatbot.status}`);
        res.json(chatbot);
    } catch (err) {
        console.error("[PUBLIC] ❌ Erro:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// ROTA 2: Listar campanhas ativas
router.get('/campanhas', async (req, res) => {
    try {
        console.log('[PUBLIC] 📋 Buscando campanhas ativas...');
        
        const campanhasAtivas = await Campanha.find({ status: 'Ativa' })
            .sort({ createdAt: -1 })
            .populate('criador', 'nome')
            .populate('chatbot', '_id nome status')
            .lean();
        
        console.log(`[PUBLIC] 📊 ${campanhasAtivas.length} campanhas ativas encontradas`);
        
        const campanhasFormatadas = campanhasAtivas.map(campanha => {
            console.log(`\n[PUBLIC] 🔍 Processando: "${campanha.nome}"`);
            console.log(`  - Chatbot RAW:`, campanha.chatbot);
            
            if (campanha.chatbot) {
                console.log(`  - Chatbot Status: ${campanha.chatbot.status}`);
                
                if (campanha.chatbot.status === 'Ativo') {
                    const chatbotId = campanha.chatbot._id.toString();
                    console.log(`  - ✅ Chatbot ATIVO! Enviando ID: ${chatbotId}`);
                    
                    return {
                        ...campanha,
                        chatbot: chatbotId
                    };
                } else {
                    console.log(`  - ⚠️ Chatbot existe mas está ${campanha.chatbot.status}`);
                    return {
                        ...campanha,
                        chatbot: null
                    };
                }
            } else {
                console.log(`  - ❌ Sem chatbot associado`);
                return {
                    ...campanha,
                    chatbot: null
                };
            }
        });
        
        console.log('\n[PUBLIC] 📤 Enviando campanhas formatadas...');
        res.json(campanhasFormatadas);
        
    } catch (err) {
        console.error("[PUBLIC] ❌ Erro ao buscar campanhas:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// ROTA 3: Interagir com chatbot público (SEM HISTÓRICO)
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
        const contexto = chatbot.campanha.editais.map(e => `Título: ${e.titulo}\nConteúdo: ${e.conteudo}`).join('\n\n');
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
PERGUNTA DO USUÁRIO:${mensagemUsuario}`;
        
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
        const result = await model.generateContent(prompt);
        const respostaDaIA = result.response.text();
        
        res.json({ resposta: respostaDaIA });

    } catch (err) {
        console.error("Erro na interação pública:", err.message);
        if (err.name === 'GoogleGenerativeAIFetchError' || err.status === 503) {
            return res.status(503).json({ msg: 'O serviço de IA está indisponível ou a chave de API do criador é inválida/excedeu o limite. Tente novamente mais tarde.' });
        }
        res.status(500).send('Erro no servidor.');
    }
});

module.exports = router;