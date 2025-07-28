const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();

// --- CONFIGURAÇÃO DE SEGURANÇA DO CORS ---
// Define qual domínio (seu site na Vercel) tem permissão para acessar esta API.
const corsOptions = {
    origin: 'https://hub-sabia-front-e-back.vercel.app' 
};

app.use(cors(corsOptions)); 

// Permite que o servidor entenda o corpo de requisições no formato JSON.
app.use(express.json()); 

// --- CONEXÃO COM O BANCO DE DADOS ---
// Conecta ao MongoDB usando a string de conexão do seu arquivo .env
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB (HubSabia) conectado com sucesso!'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// --- ROTAS DA API ---
// Registra as rotas para autenticação e campanhas.
app.use('/api/auth', require('./routes/auth'));
app.use('/api/campanhas', require('./routes/campanhas'));

// Rota de teste inicial para verificar se a API está online.
app.get('/', (req, res) => {
    res.send('API do HubSabia está no ar!');
});

// --- INICIA O SERVIDOR ---
// A Render fornecerá a porta através de process.env.PORT.
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));