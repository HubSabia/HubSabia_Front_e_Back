// backend/server.js - CORREÇÃO DO CORS

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

// --- CONFIGURAÇÃO CORRIGIDA DO CORS ---
const allowedOrigins = [
    'https://hub-sabia-front-e-back.vercel.app',
    'http://localhost:5174',
    'http://localhost:5173', // ✅ Adicionado 5173
    'http://127.0.0.1:5173'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// ✅ Middleware de erro para CORS (opcional, mas recomendado)
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      msg: 'Acesso negado pela política de CORS',
      origin: req.headers.origin
    });
  }
  next(err);
});

app.use(express.json()); 

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'fallback_secret_string', 
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            collectionName: 'sessions'
        }),
        cookie: {
            secure: process.env.NODE_ENV === 'production', // ✅ HTTPS em produção
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 // 24 horas
        }
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
app.use('/api', require('./routes/index'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/campanhas', require('./routes/campanhas'));
app.use('/api/chatbots', require('./routes/chatbots'));
app.use('/api/editais', require('./routes/editais'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/public', require('./routes/public'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/usuarios', require('./routes/usuarios'));

// ✅ Tratamento de erro global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(err.status || 500).json({
    msg: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// --- INICIA O SERVIDOR ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));