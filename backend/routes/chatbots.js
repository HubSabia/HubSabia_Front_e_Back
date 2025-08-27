const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const Chatbot = require('../models/Chatbot');
const Edital = require('../models/Edital');
const Campanha = require('../models/Campanha');


// ==========================================================
// ROTA GET: Listar todos os chatbots do usuário
// ==========================================================
router.get('/', authMiddleware, async (req, res) => {
    try {
        // Popula o campo 'campanha' para que possamos ver o nome da campanha associada
        const chatbots = await Chatbot.find({ criador: req.usuario.id })
            .populate('campanha', 'nome')
            .sort({ createdAt: -1 });
        res.json(chatbots);
    } catch (err) {
        console.error("Erro ao listar chatbots:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// ==========================================================
// ROTA POST: Criar um novo chatbot
// ==========================================================
router.post('/', authMiddleware, async (req, res) => {
    const { nome, status, campanha } = req.body;
    if (!nome || !campanha) {
        return res.status(400).json({ msg: 'Nome e campanha associada são obrigatórios.' });
    }
    try {
        // Validação: Garante que a campanha existe e pertence ao usuário
        const campanhaExiste = await Campanha.findOne({ _id: campanha, criador: req.usuario.id });
        if (!campanhaExiste) {
            return res.status(404).json({ msg: 'Campanha não encontrada ou não autorizada.' });
        }
        
        const novoChatbot = new Chatbot({
            nome,
            status,
            campanha, // Salva o ID da campanha
            criador: req.usuario.id
        });
        
        const chatbotSalvo = await novoChatbot.save();
        // Popula o chatbot recém-criado para enviar de volta ao frontend
        const chatbotPopulado = await Chatbot.findById(chatbotSalvo._id).populate('campanha', 'nome');
        res.status(201).json(chatbotPopulado);
    } catch (err) {
        console.error("Erro ao criar chatbot:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// ==========================================================
// ROTA PUT: Editar um chatbot existente
// ==========================================================
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

// ==========================================================
// ROTA DELETE: Excluir um chatbot
// ==========================================================
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

// ==========================================================
// ROTA POST: Interagir com um chatbot específico
// ==========================================================
router.post('/:chatbotId/interagir', authMiddleware, async (req, res) => {
    const { mensagemUsuario } = req.body;
    
    if (!mensagemUsuario) {
        return res.status(400).json({ msg: 'A mensagem do usuário é obrigatória.' });
    }

    try {
        // 1. Encontra o chatbot e popula TODA a informação necessária em cadeia
        const chatbot = await Chatbot.findById(req.params.chatbotId)
            .populate({
                 path: 'campanha',
                 populate: {
                     path: 'editais', // Aninha a população para pegar os editais dentro da campanha
                     model: 'Edital'
                 }
            });

        if (!chatbot || !chatbot.campanha) {
            return res.status(404).json({ msg: 'Configuração do chatbot ou campanha associada não encontrada.' });
        }

        // 2. Constrói o contexto para a IA a partir do conteúdo dos editais
        const contexto = chatbot.campanha.editais.map(e => e.conteudo).join('\n\n---\n\n');

        // 3. LÓGICA DA IA (POR ENQUANTO, SIMULADA)
        //    Aqui você faria a chamada para a API da OpenAI, Google AI, etc.
        //    Ex: const respostaDaIA = await servicoDeIA.gerarResposta(mensagemUsuario, contexto);
        
        const respostaSimulada = `(Resposta Simulada) Baseado no contexto dos editais, a resposta para sua pergunta sobre "${mensagemUsuario}" é... [O conteúdo dos editais seria usado aqui para gerar uma resposta real].`;

        // 4. Retorna a resposta para o frontend
        res.json({ resposta: respostaSimulada });

    } catch (err) {
        console.error("Erro na interação com o chatbot:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// ==========================================================
// ROTA GET: Buscar um chatbot específico pelo ID
// ==========================================================
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const chatbot = await Chatbot.findById(req.params.id)
            .populate('campanha', 'nome'); // Popula o nome da campanha

        if (!chatbot) {
            return res.status(404).json({ msg: 'Chatbot não encontrado.' });
        }

        // Segurança: Garante que o usuário logado é o criador do chatbot
        if (chatbot.criador.toString() !== req.usuario.id) {
            return res.status(401).json({ msg: 'Ação não autorizada.' });
        }

        res.json(chatbot);
    } catch (err) {
        console.error("Erro ao buscar chatbot:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});
module.exports = router;