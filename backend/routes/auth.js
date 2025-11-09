// backend/routes/auth.js (VERSÃO LIMPA)

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const validator = require('validator');
const passwordValidator = require('password-validator');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

console.log('Arquivo auth.js (versão limpa) está sendo carregado...');

// Apenas uma rota de teste para garantir que o router funciona
router.get('/health-check', (req, res) => {
    res.send('O router de autenticação está saudável.');
});

// Deixe as rotas originais aqui, mas vazias por enquanto
router.post('/registrar', (req, res) => { res.status(501).send('Rota de registro em construção.'); });
router.post('/login', (req, res) => { res.status(501).send('Rota de login em construção.'); });
router.post('/verificar-email', (req, res) => { res.status(501).send('Rota de verificação em construção.'); });


module.exports = router;