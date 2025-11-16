const mongoose = require('mongoose');

const HistoricoConversaSchema = new mongoose.Schema({
    chatbot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chatbot',
        required: true
    },
    // Opcional: para saber quem fez a pergunta
    usuario: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    // Opcional: um ID de sessão para agrupar mensagens da mesma conversa
    sessaoId: { 
        type: String,
        required: true
    },
    pergunta: {
        type: String,
        required: true
    },
    resposta: {
        type: String,
        required: true
    }
}, { timestamps: true });

HistoricoConversaSchema.index({ chatbot: 1, sessaoId: 1 });
HistoricoConversaSchema.index({ createdAt: -1 });

module.exports = mongoose.model('HistoricoConversa', HistoricoConversaSchema);