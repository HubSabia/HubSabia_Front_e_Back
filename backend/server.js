// backend/server.js (VERSÃO DE TESTE 2)
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

console.log('Iniciando o servidor de teste...');

// Carrega APENAS o arquivo de rotas de autenticação
try {
    app.use('/api/auth', require('./routes/auth'));
    console.log('Módulo de rotas de autenticação carregado com sucesso.');
} catch (error) {
    console.error('ERRO CRÍTICO AO CARREGAR A ROTA DE AUTENTICAÇÃO:', error);
    process.exit(1); // Encerra o processo se houver erro ao carregar
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor de TESTE rodando na porta ${PORT}`));