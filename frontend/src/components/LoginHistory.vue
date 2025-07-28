<template>
    <div class="container">
      <div v-if="!loggedIn">
      <h1>Login</h1>
      <input type="text" v-model="username" placeholder="Usuário" />
      <input type="password" v-model="password" placeholder="Senha" />
      <button @click="login" :disabled="loading">Entrar</button>
      <p v-if="loginError" class="error">{{ loginError }}</p>
      <div v-if="loading">Processando o pedido de acesso... Aguarde...</div>  <!-- Loading durante o login -->
    </div>
  
      <div v-else>
        <h1>Diálogos do Chatbot</h1>
        <button @click="logout">Sair</button>
        <div v-if="loading">Carregando...</div>
        <div v-else>
          <table class="dialog-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Mensagem</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="dialog in dialogs" :key="dialog._id">
                <td>{{ dialog.usuario }}</td>
                <td>{{ dialog.mensagem }}</td>
                <td>{{ formatDate(dialog.timestamp) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        username: '',
        password: '',
        loggedIn: false,
        loginError: '',
        dialogs: [],
        loading: false,
        backendURL: 'https://backend-endpoints-l6q8.onrender.com' // URL do seu backend
      };
    },
    methods: {
      async login() {
        this.loading = true; // Inicia o loading
        try {
          const response = await axios.post(`${this.backendURL}/login`, {
            username: this.username,
            password: this.password
          });
  
          if (response.data.success) {
            this.loggedIn = true;
            this.loginError = '';
            this.fetchDialogs();
          } else {
            this.loginError = 'Credenciais inválidas';
          }
        } catch (error) {
          console.error('Erro ao fazer login:', error);
          this.loginError = 'Erro ao fazer login';
        } finally {
        this.loading = false; // Finaliza o loading, independente do resultado
        }
      },
      logout() {
        this.loggedIn = false;
        this.dialogs = [];
      },
      async fetchDialogs() {
        this.loading = true;
        try {
          const response = await axios.get(`${this.backendURL}/dialogs`);
          if (response.data.success) {
            this.dialogs = response.data.dialogs;
          } else {
            console.error('Erro ao buscar diálogos:', response.data.message);
          }
        } catch (error) {
          console.error('Erro ao buscar diálogos:', error);
        } finally {
          this.loading = false;
        }
      },
      formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString(); // Formata a data e hora
      }
    },
    mounted() {
      // Se você quiser manter o login entre sessões, pode usar localStorage aqui
    }
  };
  </script>
  
  <style scoped>
  .container {
    font-family: sans-serif;
    max-width: 800px;
    margin: 20px auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
  }
  
  input[type="text"],
  input[type="password"] {
    width: 100%;
    padding: 10px;
    margin: 8px 0;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
  }
  
  button {
    background-color: #4CAF50;
    color: white;
    padding: 12px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #45a049;
  }
  
  .error {
    color: red;
  }
  
  .dialog-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  
  .dialog-table th,
  .dialog-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  
  .dialog-table th {
    background-color: #f2f2f2;
  }
  </style>