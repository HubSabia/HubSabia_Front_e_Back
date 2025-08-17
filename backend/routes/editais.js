const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const Edital = require('../models/Edital');
const Campanha = require('../models/Campanha'); // Importamos para validar a campanha

// ROTA POST: Criar um novo edital
router.post('/', authMiddleware, async (req, res) => {
    const { titulo, conteudo, campanhaId } = req.body;

    // Validação
    if (!titulo || !conteudo || !campanhaId) {
        return res.status(400).json({ msg: 'Por favor, forneça título, conteúdo e a campanha associada.' });
    }

    try {
        // Verifica se a campanha fornecida existe e pertence ao usuário
        const campanha = await Campanha.findById(campanhaId);
        if (!campanha || campanha.criador.toString() !== req.usuario.id) {
            return res.status(404).json({ msg: 'Campanha não encontrada ou não autorizada.' });
        }

        const novoEdital = new Edital({
            titulo,
            conteudo,
            campanha: campanhaId,
            criador: req.usuario.id
        });

        const editalSalvo = await novoEdital.save();
        res.status(201).json(editalSalvo);

    } catch (err) {
        console.error("Erro ao criar edital:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// ROTA GET: Listar todos os editais de uma CAMPANHA específica
// É mais útil listar por campanha do que todos os editais do usuário
router.get('/por-campanha/:campanhaId', authMiddleware, async (req, res) => {
    try {
        const { campanhaId } = req.params;
        
        // Validação de segurança: o usuário é dono da campanha?
        const campanha = await Campanha.findById(campanhaId);
        if (!campanha || campanha.criador.toString() !== req.usuario.id) {
            return res.status(404).json({ msg: 'Campanha não encontrada ou não autorizada.' });
        }

        const editais = await Edital.find({ campanha: campanhaId }).sort({ data_publicacao: -1 });
        res.json(editais);

    } catch (err) {
        console.error("Erro ao listar editais:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// As rotas PUT (Editar) e DELETE (Excluir) podem ser adicionadas depois,
// seguindo o mesmo padrão das rotas de Campanhas.

module.exports = router;