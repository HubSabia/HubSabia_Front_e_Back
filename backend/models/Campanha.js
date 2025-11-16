const mongoose = require('mongoose');

const CampanhaSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    descricao: { type: String, default: '' },
    periodo_inicio: { type: Date, required: true },
    periodo_fim: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['Planejada', 'Ativa', 'Concluída', 'Cancelada'], 
        default: 'Planejada' 
    },
    publico_alvo: { type: String },
    editais: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Edital' 
    }],
    criador: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },

    chatbot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chatbot'
    },
}, { timestamps: true });

CampanhaSchema.index({ criador: 1, status: 1 });
CampanhaSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Campanha', CampanhaSchema);