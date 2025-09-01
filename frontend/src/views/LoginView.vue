<template>
  <div class="login-background">
    <div class="login-container">
      <div class="logo-area">
        <div class="logo-box">
          <span class="logo-initials">IFPR</span>
        </div>
        <div class="logo-text">
          <span>INSTITUTO FEDERAL</span>
          <span>Paraná</span>
        </div>
      </div>

      <h1 class="title">Acesso ao Sistema</h1>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" required placeholder="Digite seu email">
        </div>
        <div class="form-group">
          <label for="password">Senha</label>
          <input type="password" id="password" v-model="password" required placeholder="Digite sua senha">
        </div>

        <div class="actions">
          <a href="#" class="forgot-password">Esqueci minha senha</a>
          <button type="submit" class="btn-login">Entrar</button>
        </div>
      </form>

      <div class="signup-link">
        <span>Não tem uma conta?</span>
        <router-link to="/registrar">Crie uma aqui</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/services/api';

const email = ref(""); 
const password = ref("");
const router = useRouter();

const handleLogin = async () => {
  if (!email.value || !password.value) {
    alert("Por favor, preencha o e-mail e a senha.");
    return;
  }
  try {
    const response = await apiClient.post('/auth/login', { 
      email: email.value, 
      password: password.value 
    });
    const data = response.data;
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      router.push("/dashboard");
    } else {
      throw new Error('Token não recebido da API.');
    }
  } catch (error) {
    console.error("Falha no login:", error);
    const errorMessage = error.response?.data?.msg || 'Erro ao fazer login. Verifique suas credenciais.';
    alert(errorMessage);
  }
};
</script>

<style scoped>

.login-background {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  background-color: #ffffff; /* Fundo branco */
  padding: 2rem;
  border: 4px solid #007bff; /* Borda azul, ajuste a cor se necessário */
}

.login-container {
  width: 100%;
  max-width: 400px; /* Largura do card de login */
  padding: 2.5rem;
  border: 1px solid #000000; /* Borda preta fina */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-area {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  width: 100%;
}

.logo-box {
  background-color: #000000;
  color: #ffffff;
  padding: 0.8rem;
  font-weight: bold;
  margin-right: 1rem;
}

.logo-text {
  display: flex;
  flex-direction: column;
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.2;
}

.title {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  font-weight: 600;
  text-align: center;
}

.login-form {
  width: 100%;
}

.form-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.8rem 1rem;
  background-color: #000000;
  color: #ffffff;
  border: none;
  font-size: 1rem;
}

.form-group input::placeholder {
  color: #a0a0a0;
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
}

.forgot-password {
  font-size: 0.85rem;
  color: #000000;
  text-decoration: underline;
}

.btn-login {
  background-color: #00ff00; /* Verde limão */
  color: #000000;
  border: 1px solid #000000;
  padding: 0.8rem 2rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-login:hover {
  background-color: #00e600;
}

.signup-link {
  font-size: 0.9rem;
  color: #6c757d;
}

.signup-link a {
  color: #000000;
  text-decoration: underline;
  font-weight: 500;
}
</style>