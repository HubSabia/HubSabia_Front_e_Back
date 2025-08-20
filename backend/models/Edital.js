const mongoose = require('mongoose');

const EditalSchema = new mongoose.Schema({
    // Campo para o "Nome" que você mencionou
    titulo: {
        type: String,
        required: true
    },
    // Campo para "colar o edital" (o conteúdo em texto)
    conteudo: {
        type: String,
        required: true
    },
    // Campo para a "data de publicação"
    data_publicacao: {
        type: Date
    },
    criador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Edital', EditalSchema);