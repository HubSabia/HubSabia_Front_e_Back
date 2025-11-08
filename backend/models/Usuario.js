const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UsuarioSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'O nome é obrigatório.']
    },
    email: {
        type: String,
        required: [true, 'O e-mail é obrigatório.'],
        unique: true,
        lowercase: true
    },
    senha_hash: {
        type: String,
        required: false 
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },

    // ==========================================================
    // --- NOVOS CAMPOS PARA VERIFICAÇÃO DE EMAIL ---
    // ==========================================================
    isVerificado: {
        type: Boolean,
        default: false // O usuário sempre começa como "não verificado".
    },
    verificationToken: {
        type: String,
        select: false // Garante que este token não seja enviado em respostas da API por padrão.
    },
    verificationTokenExpires: {
        type: Date,
        select: false // Também não será enviado por padrão.
    },
    // ==========================================================

    geminiApiKey: {
        type: String,
        trim: true
    }
}, { timestamps: true });

UsuarioSchema.pre('save', async function(next) {
    if (!this.isModified('senha_hash')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.senha_hash = await bcrypt.hash(this.senha_hash, salt);
    next();
});

module.exports = mongoose.model('Usuario', UsuarioSchema);