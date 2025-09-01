<template>
  <div class="login-view">
    <div class="login-card">
      <div class="logo-area">
        <div class="logo-box">IFPR</div>
        <div class="logo-text">
          <span>INSTITUTO FEDERAL</span>
          <span>Paraná</span>
        </div>
      </div>
      
      <h2 class="title">Acesso ao Sistema</h2>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Usuário ou Email</label>
          <input type="email" id="email" v-model="email" required placeholder="Digite seu usuário">
        </div>

        <div class="form-group">
          <label for="password">Senha</label>
          <input type="password" id="password" v-model="password" required placeholder="Digite sua senha">
        </div>

        <div class="actions-row">
          <a href="#" class="forgot-password">Esqueci minha senha</a>
          <button type="submit" class="btn-login" :disabled="isLoading">
            {{ isLoading ? 'Entrando...' : 'Entrar' }}
          </button>
        </div>
      </form>

      <div class="signup-link">
        <span>Não tem uma conta?</span>
        <router-link to="/registrar">Crie uma aqui</router-link>
      </div>

      <!-- Indicadores de estado -->
      <div v-if="isLoading" class="loading-container">
        <div class="spinner"></div>
      </div>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
// SEU SCRIPT SETUP ATUAL, QUE JÁ ESTÁ ÓTIMO, CONTINUA O MESMO.
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/services/api';

const email = ref("");
const password = ref("");
const isLoading = ref(false);
const errorMessage = ref("");
const router = useRouter();

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = "Por favor, preencha o e-mail e a senha.";
    return;
  }
  isLoading.value = true;
  errorMessage.value = "";
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
    const errorMsg = error.response?.data?.msg || 'Erro ao fazer login. Verifique suas credenciais.';
    errorMessage.value = errorMsg;
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* ESTILOS ATUALIZADOS PARA O NOVO DESIGN */

.login-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  background-color: #f0f2f5; /* Fundo cinza claro */
}

.login-card {
  background-color: #ffffff;
  padding: 2.5rem 3rem;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 480px;
  text-align: center;
}

.logo-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.logo-box {
  background-color: #343a40; /* Cinza escuro */
  color: white;
  padding: 0.75rem;
  font-weight: 600;
  border-radius: 4px;
}

.logo-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  color: #343a40;
  font-weight: 600;
  line-height: 1.3;
}

.title {
  font-size: 1.75rem;
  margin-bottom: 2.5rem;
  font-weight: 600;
  color: #212529;
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
  color: #6c757d;
}

.form-group input {
  width: 100%;
  padding: 0.8rem 1rem;
  background-color: #ffffff;
  color: #212529;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #0d6efd; /* Azul primário */
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.form-group input::placeholder {
  color: #adb5bd;
}

.actions-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  margin-bottom: 2rem;
}

.forgot-password {
  font-size: 0.85rem;
  color: #0d6efd;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.btn-login {
  background-color: #0d6efd;
  color: #ffffff;
  border: none;
  padding: 0.7rem 2rem;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-login:hover {
  background-color: #0b5ed7;
}

.btn-login:disabled {
  background-color: #0d6efd;
  opacity: 0.65;
  cursor: not-allowed;
}

.signup-link {
  font-size: 0.9rem;
  color: #6c757d;
}

.signup-link a {
  color: #0d6efd;
  text-decoration: none;
  font-weight: 500;
}

.signup-link a:hover {
  text-decoration: underline;
}

/* Seus estilos de loading e error message já são ótimos e combinam bem */
.loading-container, .error-message {
  margin-top: 1.5rem;
}

.error-message {
  margin-top: 15px;
  padding: 10px;
  background-color: #f8d7da;
  color: #721c24;            
  border: 1px solid #f5c6cb; 
}


</style>