// backend/models/Usuario.js
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
        required: [true, 'A senha é obrigatória.']
    },
    // MUDANÇA: Adicionando o campo de papel (role)
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
    // MUDANÇA: Removendo o array de chatbots aninhados
}, { timestamps: true }); // Adicionamos timestamps para data_criacao

// Seu hook de criptografia de senha continua perfeito
UsuarioSchema.pre('save', async function(next) {
    if (!this.isModified('senha_hash')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.senha_hash = await bcrypt.hash(this.senha_hash, salt);
    next();
});

module.exports = mongoose.model('Usuario', UsuarioSchema);