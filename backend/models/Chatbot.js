const mongoose = require('mongoose');

const ChatbotSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    criador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Chatbot', ChatbotSchema);