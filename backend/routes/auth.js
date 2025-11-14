const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const rateLimit = require('express-rate-limit');

// Modelos e Validadores necessários
const Usuario = require('../models/Usuario');
const validator = require('validator');
const passwordValidator = require('password-validator');

// --- CONFIGURAÇÕES ---
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	message: { msg: 'Muitas tentativas. Tente novamente em 15 minutos.' },
	standardHeaders: true,
	legacyHeaders: false,
});

const passwordSchema = new passwordValidator();
passwordSchema.is().min(8).has().uppercase().has().lowercase().has().digits(1);

// ==========================================================
// ROTA DE REGISTRO (SIMPLIFICADA)
// ==========================================================
router.post('/registrar', authLimiter, async (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
        return res.status(400).json({ msg: 'Por favor, inclua todos os campos.' });
    }
    try {
        if (!validator.isEmail(email)) {
            return res.status(400).json({ msg: 'Formato de email inválido.' });
        }
        if (!passwordSchema.validate(senha)) {
            return res.status(400).json({ msg: 'A senha é fraca.' });
        }
        if (await Usuario.findOne({ email: email.toLowerCase() })) {
            return res.status(400).json({ msg: 'Este e-mail já está cadastrado.' });
        }

        // Cria e salva o usuário. O hash da senha é feito pelo hook 'pre-save' no modelo.
        const usuario = new Usuario({ nome, email, senha_hash: senha });
        await usuario.save();
        
        res.status(201).json({ msg: 'Usuário registrado com sucesso!' });
    } catch (err) {
        console.error("Erro no registro:", err.message);
        res.status(500).send('Ocorreu um erro no servidor.');
    }
});

// ==========================================================
// ROTA DE LOGIN (SIMPLIFICADA)
// ==========================================================
router.post('/login', authLimiter, async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ msg: 'Por favor, inclua email e senha.' });
    }
    try {
        const usuario = await Usuario.findOne({ email: email.toLowerCase() });
        if (!usuario || !usuario.senha_hash) { // Adicionado '!usuario.senha_hash' para não logar usuários do Google com senha
            return res.status(400).json({ msg: 'Credenciais inválidas.' });
        }
        
        const isMatch = await bcrypt.compare(password, usuario.senha_hash);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Credenciais inválidas.' });
        }

        const payload = { usuario: { id: usuario.id, role: usuario.role, nome: usuario.nome } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// ==========================================================
// ROTAS DE AUTENTICAÇÃO COM GOOGLE
// ==========================================================
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/google/callback', 
    passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login` }),
    (req, res) => {
        const payload = { usuario: { id: req.user.id, role: req.user.role, nome: req.user.nome } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.redirect(`${process.env.FRONTEND_URL}/login-success?token=${token}`);
        });
    }
);

module.exports = router;