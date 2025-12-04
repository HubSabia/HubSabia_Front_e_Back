# Hub-Sabiá - Sistema de Gestão de Campanhas e Chatbots

## 📋 Sobre o Projeto

Hub-Sabiá é uma plataforma web desenvolvida para o Instituto Federal do Paraná (IFPR) que permite a gestão de campanhas educacionais e a criação de chatbots assistentes virtuais baseados em editais. O sistema facilita a disseminação de informações e o atendimento automatizado através de inteligência artificial.

## 🎯 Funcionalidades Principais

- **Gestão de Editais**: Biblioteca centralizada para armazenar e gerenciar editais
- **Gestão de Campanhas**: Criação e acompanhamento de campanhas com períodos e público-alvo definidos
- **Chatbots Inteligentes**: Assistentes virtuais que respondem perguntas baseadas nos editais das campanhas
- **Interface Pública**: Vitrine de campanhas ativas com acesso aos chatbots
- **Controle de Acesso**: Sistema de autenticação com roles (admin/user)
- **Integração com Google AI**: Utiliza o Gemini para processamento de linguagem natural

## 🏗️ Arquitetura do Sistema

O projeto está dividido em duas partes principais:

### Backend (Node.js + Express + MongoDB)
- API RESTful
- Autenticação JWT e OAuth (Google)
- Integração com Google Generative AI (Gemini)
- Upload de imagens via Cloudinary

### Frontend (Vue.js 3)
- Interface responsiva e moderna
- Gerenciamento de estado com Pinia
- Roteamento com Vue Router
- Notificações com Vue Toastification

## 🚀 Como Executar o Projeto

### Pré-requisitos

Certifique-se de ter instalado em sua máquina:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **MongoDB** (local ou MongoDB Atlas)
- **Git**

### 1️⃣ Clonar o Repositório

```bash
git clone <url-do-repositorio>
cd hub-sabia
```

### 2️⃣ Configurar o Backend

#### Navegar para a pasta do backend
```bash
cd backend
```

#### Instalar dependências
```bash
npm install
```

#### Configurar variáveis de ambiente

Crie um arquivo `.env` na pasta `backend` baseado no arquivo `.env.example`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e preencha as seguintes informações:

```env
# Porta do servidor
PORT=5000

# URLs (ajuste conforme seu ambiente)
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

# MongoDB (use sua string de conexão)
MONGO_URI=mongodb://localhost:27017/hubsabia
# OU para MongoDB Atlas:
# MONGO_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/hubsabia

# JWT (crie uma string secreta forte)
JWT_SECRET=sua_chave_secreta_jwt_aqui_mude_isso

# Session (crie uma string secreta forte)
SESSION_SECRET=sua_chave_secreta_session_aqui_mude_isso

# Google OAuth (obtenha em https://console.cloud.google.com)
GOOGLE_CLIENT_ID=seu_google_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_google_client_secret_aqui

# Cloudinary (opcional - para upload de imagens)
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=sua_api_secret

# Ambiente
NODE_ENV=development
```

#### Iniciar o servidor backend
```bash
npm start
```

O backend estará rodando em `http://localhost:5000`

### 3️⃣ Configurar o Frontend

#### Abrir um novo terminal e navegar para a pasta do frontend
```bash
cd frontend
```

#### Instalar dependências
```bash
npm install
```

#### Configurar variáveis de ambiente (opcional)

Se necessário, crie um arquivo `.env` na pasta `frontend`:

```env
VITE_API_URL=http://localhost:5000/api
```

#### Iniciar o servidor de desenvolvimento
```bash
npm run dev
```

O frontend estará rodando em `http://localhost:5173`

### 4️⃣ Acessar a Aplicação

Abra seu navegador e acesse:
```
http://localhost:5173
```

## 👤 Primeiro Acesso

### Criar uma Conta

1. Acesse a página inicial
2. Clique em "Criar uma conta aqui"
3. Preencha os dados (nome, email, senha)
4. Faça login com as credenciais criadas

### Obter Chave do Google AI (Gemini)

Para utilizar os chatbots, você precisa de uma chave de API do Google:

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma nova chave de API
3. No sistema, vá em "Meu Perfil"
4. Cole sua chave de API no campo apropriado
5. Clique em "Salvar Chave"

## 📚 Fluxo de Uso Recomendado

1. **Adicionar Editais**: Vá em "Biblioteca de Editais" e adicione os editais que deseja usar
2. **Criar Campanha**: Em "Gerenciar Campanhas", crie uma nova campanha e associe os editais
3. **Criar Chatbot**: Em "Gerenciar Chatbots", crie um chatbot vinculado à campanha
4. **Ativar o Chatbot**: Edite o chatbot e mude o status para "Ativo"
5. **Compartilhar**: Copie o link público do chatbot e compartilhe

## 🔧 Scripts Disponíveis

### Backend
```bash
npm start          # Inicia o servidor em modo produção
npm run dev        # Inicia com nodemon (recarrega automaticamente)
```

### Frontend
```bash
npm run dev        # Inicia servidor de desenvolvimento
npm run build      # Cria build de produção
npm run preview    # Visualiza o build de produção localmente
```

## 🌐 Deploy

### Backend (Render, Heroku, etc.)

Configure as variáveis de ambiente no serviço de hospedagem e faça o deploy da pasta `backend`.

### Frontend (Vercel, Netlify, etc.)

1. Configure a variável `VITE_API_URL` com a URL do backend em produção
2. Faça o deploy da pasta `frontend`

## 📦 Dependências Principais

### Backend
- Express 5.1.0
- Mongoose 8.19.3
- Passport (autenticação)
- Google Generative AI 0.24.1
- Cloudinary 2.8.0
- JsonWebToken 9.0.2

### Frontend
- Vue 3.5.13
- Vue Router 4.5.1
- Pinia 3.0.4
- Axios 1.9.0
- Marked 15.0.12 (renderização Markdown)
- Vue Toastification 2.0.0

## 🤝 Contribuidores

- **Carlos Eduardo** - Discente IFPR
- **Heitor Gavioli** - Discente IFPR
- **Kallel** - Discente IFPR
- **Vagner Simões** - Docente IFPR (Orientador)

## 📄 Licença

Instituto Federal do Paraná - Campus Assis Chateaubriand

## 🐛 Problemas Conhecidos e Soluções

### Erro de conexão com MongoDB
- Verifique se o MongoDB está rodando
- Confirme a string de conexão no `.env`

### Erro 401 ao usar chatbots
- Verifique se a chave do Google AI está configurada
- Confirme se o chatbot está com status "Ativo"

### Erro de CORS
- Verifique se as URLs no backend (`FRONTEND_URL`) estão corretas
- Em desenvolvimento, certifique-se de que ambos os servidores estão rodando

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento através dos links disponíveis na seção "Sobre" do sistema.

---

**Nota**: Este é um projeto educacional desenvolvido no IFPR Campus Assis Chateaubriand.