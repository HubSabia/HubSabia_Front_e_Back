const mongoose = require('mongoose');

const ChatbotSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Ativo', 'Inativo', 'Em Manutenção'],
        default: 'Inativo'
    },
    campanha: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campanha',
        required: true
    },
    criador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    geminiApiKey: {
        type: String,
        trim: true,
        default: ''
    }
}, { timestamps: true });

ChatbotSchema.index({ campanha: 1 });
ChatbotSchema.index({ criador: 1, status: 1 });

module.exports = mongoose.model('Chatbot', ChatbotSchema);