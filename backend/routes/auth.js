// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const rateLimit = require('express-rate-limit');

// ==========================================================
// Importar o middleware de validação
// ==========================================================
const { validateRegister } = require('../middlewares/authValidation');

// ==========================================================
// Configuração do rate limiting
// ==========================================================
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // Janela de tempo: 15 minutos
	max: 5, // Limite: cada IP pode fazer no máximo 5 requisições nesta janela
	message: { msg: 'Tentativas excedidas' },
    skip: (req, res) => req.method === 'OPTIONS',
	standardHeaders: true,
	legacyHeaders: false,
});

// ==========================================================
// ROTA DE REGISTRO - COM VALIDAÇÃO DE SENHA
// ==========================================================
router.post('/registrar', authLimiter, validateRegister, async (req, res) => {
    const { nome, email, senha } = req.body;
    
    try {
        let usuario = await Usuario.findOne({ email: email.toLowerCase() });
        if (usuario) {
            return res.status(400).json({ msg: 'Um usuário com este e-mail já existe.' });
        }

        usuario = new Usuario({
            nome,
            email,
            senha_hash: senha
        });

        await usuario.save();
        res.status(201).json({ 
            msg: 'Usuário registrado com sucesso!',
            requirements: {
                minLength: 8,
                requiresUppercase: true,
                requiresLowercase: true,
                requiresNumbers: true,
                noSpaces: true
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// ==========================================================
// ROTA DE LOGIN (mantida igual)
// ==========================================================
router.post('/login', authLimiter, async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ msg: 'Por favor, inclua email e senha.' });
    }
    try {
        const usuario = await Usuario.findOne({ email: email.toLowerCase() });
        if (!usuario) {
            return res.status(400).json({ msg: 'Credenciais inválidas.' });
        }
        const isMatch = await bcrypt.compare(password, usuario.senha_hash);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Credenciais inválidas.' });
        }
        const payload = {
            usuario: {
                id: usuario.id,
                role: usuario.role,
                nome: usuario.nome
            },
        };
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor.');
    }
});

module.exports = router;