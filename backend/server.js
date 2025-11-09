const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();

// --- CONFIGURAÇÃO DE SEGURANÇA DO CORS (VERSÃO FINAL) ---

// Lista de domínios que podem acessar sua API
const allowedOrigins = [
    'https://hub-sabia-front-e-back.vercel.app'
];

const corsOptions = {
  origin: (origin, callback) => {
    // Permite requisições da mesma origem ou da lista de permissões
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pela política de CORS'));
    }
  }
};

// MUDANÇA CRÍTICA: Habilita a resposta para a requisição preflight (OPTIONS)
// que o navegador envia antes do POST/PUT/DELETE. Isso deve vir ANTES de suas rotas.
app.options('*', cors());

// Aplica sua configuração de CORS para todas as outras requisições
app.use(cors(corsOptions)); 

// Permite que o servidor entenda o corpo de requisições no formato JSON.
app.use(express.json()); 

// --- CONEXÃO COM O BANCO DE DADOS ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB (HubSabia) conectado com sucesso!'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// --- ROTAS DA API ---
app.use('/api/auth', require('./routes/auth'));

// Comente temporariamente todas as outras rotas:
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