// Arquivo: backend/models/Edital.js

const mongoose = require('mongoose');

// --- PASSO 2: DEFINIR A ESTRUTURA (SCHEMA) ---
// Aqui definimos todos os campos que um documento "Edital" terá no banco de dados.
const EditalSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true, // O título é obrigatório
        trim: true
    },
    numero: {
        type: String // Ex: "001/2025"
    },
    orgao_publicador: {
        type: String
    },
    link_documento: {
        type: String // URL para o PDF do edital
    },
    data_publicacao: {
        type: Date
    },
    // Este campo é crucial para a segurança, para sabermos quem criou o edital.
    criador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario', // Faz a ligação com o seu modelo de Usuário
        required: true
    }
}, { 
    // Opção que adiciona automaticamente os campos 'createdAt' e 'updatedAt'
    timestamps: true 
});

// --- PASSO 3: EXPORTAR O MODELO ---
// Criamos um modelo chamado 'Edital' usando o schema que definimos acima.
// É este modelo que será usado nas rotas para criar, buscar, editar e deletar editais.
module.exports = mongoose.model('Edital', EditalSchema);