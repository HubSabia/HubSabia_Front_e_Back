// backend/server.js (VERSÃO CORRETA PARA DEPURAÇÃO)

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();

// --- CONFIGURAÇÃO DE SEGURANÇA DO CORS ---
const allowedOrigins = [
    'https://hub-sabia-front-e-back.vercel.app'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pela política de CORS'));
    }
  }
};
app.options('*', cors());
app.use(cors(corsOptions)); 

// Permite que o servidor entenda o corpo de requisições no formato JSON.
app.use(express.json()); 

// --- CONEXÃO COM O BANCO DE DADOS ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB (HubSabia) conectado com sucesso!'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));


// ==========================================================
// --- ROTAS DA API (MÉTODO DE DEPURAÇÃO) ---
// O objetivo é ligar uma rota de cada vez para encontrar a que causa o erro.
// ==========================================================

// PASSO 1: Vamos começar com a rota de autenticação LIGADA.
//app.use('/api/auth', require('./routes/auth'));

// Mantenha todas as outras rotas DESLIGADAS por enquanto.
app.use('/api/campanhas', require('./routes/campanhas'));
// app.use('/api/chatbots', require('./routes/chatbots'));
// app.use('/api/editais', require('./routes/editais'));
// app.use('/api/profile', require('./routes/profile'));
// app.use('/api/public', require('./routes/public'));
// app.use('/api/dashboard', require('./routes/dashboard'));
// app.use('/api/usuarios', require('./routes/usuarios'));


// --- INICIA O SERVIDOR ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));