const mongoose = require('mongoose');

const EditalSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true
    },
    conteudo: {
        type: String,
        required: true
    },
    data_publicacao: {
        type: Date,
        default: Date.now
    },
    criador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
}, { timestamps: true });

EditalSchema.index({ criador: 1 });
EditalSchema.index({ data_publicacao: -1 });

module.exports = mongoose.model('Edital', EditalSchema);