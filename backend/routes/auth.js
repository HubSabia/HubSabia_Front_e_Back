const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const rateLimit = require('express-rate-limit');

// ==========================================================
// MUDANÇA 1: Importar os validadores
// ==========================================================
const validator = require('validator');
const passwordValidator = require('password-validator');

// ==========================================================
// MUDANÇA 2: Criar o esquema da senha forte
// ==========================================================
const passwordSchema = new passwordValidator();
passwordSchema
    .is().min(8, 'A senha deve ter no mínimo 8 caracteres.')
    .has().uppercase(1, 'A senha deve ter pelo menos uma letra maiúscula.')
    .has().lowercase(1, 'A senha deve ter pelo menos uma letra minúscula.')
    .has().digits(1, 'A senha deve ter pelo menos um número.');


const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5,
	message: { msg: 'Tentativas excedidas' },
    skip: (req, res) => req.method === 'OPTIONS',
	standardHeaders: true,
	legacyHeaders: false,
});

// ==========================================================
// ROTA DE REGISTRO - ATUALIZADA
// ==========================================================
router.post('/registrar', authLimiter, async (req, res) => {
    const { nome, email, senha } = req.body;
    
    // Checagem inicial dos campos
    if (!nome || !email || !senha) {
        return res.status(400).json({ msg: 'Por favor, inclua todos os campos: nome, email e senha.' });
    }

    try {
        // ==========================================================
        // MUDANÇA 3: Adicionar a validação de segurança aqui
        // ==========================================================
        if (!validator.isEmail(email)) {
            return res.status(400).json({ msg: 'Formato de email inválido.' });
        }
        
        const errosSenha = passwordSchema.validate(senha, { list: true });
        if (errosSenha.length > 0) {
            // Retorna o primeiro erro da lista para ser mais específico
            return res.status(400).json({ msg: `Senha fraca: ${errosSenha[0]}` });
        }
        // ==========================================================
        
        let usuario = await Usuario.findOne({ email: email.toLowerCase() });
        if (usuario) {
            return res.status(400).json({ msg: 'Um usuário com este e-mail já existe.' });
        }

        usuario = new Usuario({
            nome,
            email,
            // CORREÇÃO DE SEGURANÇA: NUNCA salve a senha pura. Sempre o hash.
            senha_hash: senha // A senha será hasheada na próxima linha
        });

        // CORREÇÃO DE SEGURANÇA: Criptografar a senha ANTES de salvar
        const salt = await bcrypt.genSalt(10);
        usuario.senha_hash = await bcrypt.hash(senha, salt);

        await usuario.save();
        res.status(201).json({ msg: 'Usuário registrado com sucesso!' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// Rota de Login (sem alterações, já estava ótima)
router.post('/login', authLimiter, async (req, res) => {
    // ... seu código de login continua aqui ...
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