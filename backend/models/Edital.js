const mongoose = require('mongoose');

const EditalSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, 'O título do edital é obrigatório.'],
        trim: true
    },
    conteudo: {
        type: String,
        required: [true, 'O conteúdo do edital é obrigatório.']
    },
    // Chave estrangeira que conecta este edital a uma campanha
    campanha: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campanha', // Deve corresponder ao nome do modelo de Campanha
        required: true
    },
    data_publicacao: {
        type: Date,
        default: Date.now
    },
    // Chave estrangeira que conecta este edital a um usuário
    criador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario', // Deve corresponder ao nome do modelo de Usuário
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Edital', EditalSchema);