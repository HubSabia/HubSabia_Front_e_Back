const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');

dotenv.config();
const app = express();

app.set('trust proxy', 1);

// --- CONFIGURAÇÃO DE SEGURANÇA DO CORS ---
const allowedOrigins = [
    'https://hub-sabia-front-e-back.vercel.app',
    'http://localhost:5174',
    'http://127.0.0.1:5173'
];

const corsOptions = {
  origin: (origin, callback) => {
    // A condição '!origin' permite requisições de ferramentas como Postman.
    // A condição 'allowedOrigins.indexOf(origin) !== -1' verifica se a URL do front-end está na lista.
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      // Se a origem for permitida, chama o callback sem erro.
      callback(null, true);
    } else {
      // Se a origem NÃO for permitida, chama o callback COM um erro.
      callback(new Error('Não permitido pela política de CORS'));
    }
  }
};

app.use(cors(corsOptions)); 

app.use(express.json()); 

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'fallback_secret_string', 
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            collectionName: 'sessions'
        })
    })
);

app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

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
