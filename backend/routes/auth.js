const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// ==========================================================
// Senha forte
// ==========================================================
const passwordSchema = new passwordValidator();
passwordSchema
    .is().min(8, 'A senha deve ter no mínimo 8 caracteres.')
    .has().uppercase(1, 'A senha deve ter pelo menos uma letra maiúscula.')
    .has().lowercase(1, 'A senha deve ter pelo menos uma letra minúscula.')
    .has().digits(1, 'A senha deve ter pelo menos um número.');


const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	message: { msg: 'Tentativas excedidas' },
    skip: (req, res) => req.method === 'OPTIONS',
	standardHeaders: true,
	legacyHeaders: false,
});


//post registrar

router.post('/registrar', authLimiter, async (req, res) => {
    const { nome, email, senha } = req.body;
    
    if (!nome || !email || !senha) {
        return res.status(400).json({ msg: 'Por favor, inclua todos os campos.' });
    }

    try {
        if (!validator.isEmail(email)) {
            return res.status(400).json({ msg: 'Formato de email inválido.' });
        }
        const errosSenha = passwordSchema.validate(senha, { list: true });
        if (errosSenha.length > 0) {
            return res.status(400).json({ msg: `Senha fraca: ${errosSenha[0]}` });
        }

        // Verifica se o email já existe
        let usuario = await Usuario.findOne({ email: email.toLowerCase() });
        if (usuario) {
            return res.status(400).json({ msg: 'Um usuário com este e-mail já existe.' });
        }

        // Cria a instância do usuário (ainda não salva)
        usuario = new Usuario({
            nome,
            email,
            senha_hash: senha // O hook pre-save irá criptografar isso
        });

        // Gerar e salvar o token de verificação
        
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // É uma boa prática de segurança armazenar o hash do token, não o token puro.
        usuario.verificationToken = crypto
            .createHash('sha256')
            .update(verificationToken)
            .digest('hex');

        // Define a expiração do token para 10 minutos a partir de agora
        usuario.verificationTokenExpires = Date.now() + 10 * 60 * 1000;

        // Agora sim, salva o usuário no banco com os dados de verificação
        await usuario.save();

        // ==========================================================
        // Enviar o email de verificação
        // ==========================================================
        // O link que o usuário vai clicar
        const verificationUrl = `${process.env.FRONTEND_URL}/verificar-email/${verificationToken}`;

        // Configura o serviço de email (transporter)
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Ou outro serviço
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Opções do email
        const mailOptions = {
            from: '"HubSabia" <no-reply@hubsabia.com>',
            to: usuario.email,
            subject: 'Ative sua Conta - HubSabia',
            html: `
                <h1>Bem-vindo ao HubSabia!</h1>
                <p>Obrigado por se registrar. Por favor, clique no botão abaixo para ativar sua conta:</p>
                <a href="${verificationUrl}" style="background-color: #28a745; color: white; padding: 15px 25px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;">Ativar Conta</a>
                <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
                <p>${verificationUrl}</p>
                <p>Este link expira em 10 minutos.</p>
            `
        };

        // Envia o email
        await transporter.sendMail(mailOptions);

        // ==========================================================
        // Nova mensagem de sucesso
        // ==========================================================
        res.status(201).json({ msg: 'Registro realizado com sucesso! Um email de verificação foi enviado para sua caixa de entrada.' });

    } catch (err) {
        console.error("Erro no registro:", err.message);
        // Uma mensagem de erro genérica para não expor detalhes do sistema
        res.status(500).send('Ocorreu um erro no servidor durante o registro.');
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