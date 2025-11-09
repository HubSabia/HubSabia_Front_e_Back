const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

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
app.use(cors(corsOptions)); 

app.use(express.json()); 

// --- CONEXÃO COM O BANCO DE DADOS ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB (HubSabia) conectado com sucesso!'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// --- ROTAS DA API ---
// Todas as rotas estão ativas.
app.use('/api', require('./routes/index')); // Rota de teste
app.use('/api/auth', require('./routes/auth'));
app.use('/api/campanhas', require('./routes/campanhas'));
app.use('/api/chatbots', require('./routes/chatbots'));
app.use('/api/editais', require('./routes/editais'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/public', require('./routes/public'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/usuarios', require('./routes/usuarios'));

// --- INICIA O SERVIDOR ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));