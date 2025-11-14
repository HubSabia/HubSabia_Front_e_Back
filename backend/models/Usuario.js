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
    // Senha não é obrigatória para permitir login com Google
    senha_hash: {
        type: String,
        required: false 
    },
    // ID do Google, para usuários que se cadastram com o Google
    googleId: {
        type: String,
        required: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    // Chave de API do Gemini
    geminiApiKey: {
        type: String,
        trim: true
    }
}, { timestamps: true });

// Hook para criptografar a senha, continua igual
UsuarioSchema.pre('save', async function(next) {
    // Só executa se a senha foi modificada (ou é nova)
    if (!this.isModified('senha_hash')) {
        return next();
    }
    // E se o campo de senha realmente existe (para não dar erro em usuários do Google)
    if (this.senha_hash) {
        const salt = await bcrypt.genSalt(10);
        this.senha_hash = await bcrypt.hash(this.senha_hash, salt);
    }
    next();
});

module.exports = mongoose.model('Usuario', UsuarioSchema);
