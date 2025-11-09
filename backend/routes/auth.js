const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');

const Usuario = require('../models/Usuario');
const validator = require('validator');
const passwordValidator = require('password-validator');

// --- CONFIGURAÇÃO DO LIMITADOR DE REQUISIÇÕES ---
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutos
	max: 10, // Limite de 10 requisições por IP na janela
	message: { msg: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.' },
	standardHeaders: true,
	legacyHeaders: false,
});

// --- CONFIGURAÇÃO DO VALIDADOR DE SENHA ---
const passwordSchema = new passwordValidator();
passwordSchema
    .is().min(8, 'A senha deve ter no mínimo 8 caracteres.')
    .has().uppercase(1, 'A senha deve ter pelo menos uma letra maiúscula.')
    .has().lowercase(1, 'A senha deve ter pelo menos uma letra minúscula.')
    .has().digits(1, 'A senha deve ter pelo menos um número.');


// ==========================================================
// ROTA DE REGISTRO
// ==========================================================
router.post('/registrar', authLimiter, async (req, res) => {
    const { nome, email, senha } = req.body;
    
    if (!nome || !email || !senha) {
        return res.status(400).json({ msg: 'Por favor, inclua todos os campos.' });
    }

    try {
        // Validação de segurança no servidor
        if (!validator.isEmail(email)) {
            return res.status(400).json({ msg: 'Formato de email inválido.' });
        }
        const errosSenha = passwordSchema.validate(senha, { list: true });
        if (errosSenha.length > 0) {
            return res.status(400).json({ msg: `Senha fraca: ${errosSenha[0]}` });
        }

        if (await Usuario.findOne({ email: email.toLowerCase() })) {
            return res.status(400).json({ msg: 'Um usuário com este e-mail já existe.' });
        }

        const usuario = new Usuario({ nome, email, senha_hash: senha });

        const verificationToken = crypto.randomBytes(32).toString('hex');
        usuario.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
        usuario.verificationTokenExpires = Date.now() + 10 * 60 * 1000; // 10 minutos

        await usuario.save();

        const verificationUrl = `${process.env.FRONTEND_URL}/verificar-email/${verificationToken}`;
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        await transporter.sendMail({
            from: '"HubSabia" <no-reply@hubsabia.com>',
            to: usuario.email,
            subject: 'Ative sua Conta - HubSabia',
            html: `<p>Bem-vindo ao HubSabia! Por favor, clique no link a seguir para ativar sua conta: <a href="${verificationUrl}">${verificationUrl}</a></p><p>Este link expira em 10 minutos.</p>`,
        });

        res.status(201).json({ msg: 'Registro realizado com sucesso! Um email de verificação foi enviado.' });

    } catch (err) {
        console.error("Erro no registro:", err.message);
        res.status(500).send('Ocorreu um erro no servidor durante o registro.');
    }
});

// ==========================================================
// ROTA DE VERIFICAÇÃO DE EMAIL
// ==========================================================
router.post('/verificar-email', async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ msg: 'Token não fornecido.' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const usuario = await Usuario.findOne({
        verificationToken: hashedToken,
        verificationTokenExpires: { $gt: Date.now() },
    });

    if (!usuario) {
        return res.status(400).json({ msg: 'Token inválido ou expirado.' });
    }

    usuario.isVerificado = true;
    usuario.verificationToken = undefined;
    usuario.verificationTokenExpires = undefined;
    await usuario.save();

    res.json({ msg: 'Email verificado com sucesso! Você já pode fazer o login.' });
});


// ==========================================================
// ROTA DE LOGIN
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

        // CHECAGEM DE VERIFICAÇÃO
        if (!usuario.isVerificado) {
            return res.status(401).json({ msg: 'Sua conta ainda não foi verificada. Por favor, cheque seu email.' });
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

module.exports = router;