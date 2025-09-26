// Arquivo: backend/routes/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// ==========================================================
// MUDANÇA 1: Importamos a biblioteca de limite de requisições
// ==========================================================
const rateLimit = require('express-rate-limit');

// ==========================================================
// MUDANÇA 2: Criamos a nossa regra de limite
// ==========================================================
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // Janela de tempo: 15 minutos
	max: 10, // Limite: cada IP pode fazer no máximo 10 requisições nesta janela
	message: { msg: 'Muitas tentativas de autenticação a partir deste IP. Por favor, tente novamente após 15 minutos.' },
	standardHeaders: true, // Padrão recomendado
	legacyHeaders: false,  // Padrão recomendado
});

// ==========================================================
// ROTA DE REGISTRO
// ==========================================================
// MUDANÇA 3: Aplicamos o 'authLimiter' à rota.
// Agora, esta rota está protegida contra spam.
router.post('/registrar', authLimiter, async (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
        return res.status(400).json({ msg: 'Por favor, inclua todos os campos: nome, email e senha.' });
    }
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
        res.status(201).json({ msg: 'Usuário registrado com sucesso!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// ==========================================================
// ROTA DE LOGIN
// ==========================================================
// MUDANÇA 4: Aplicamos o 'authLimiter' à rota de login também.
// Isso protege contra ataques de força bruta (tentar adivinhar senhas).
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