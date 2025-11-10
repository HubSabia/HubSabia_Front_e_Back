<template>
  <div class="login-view">
    <div class="login-card">
      <div class="logo-area">
        <img src="/ifpr_logo_placeholder.svg" alt="Logo IFPR" class="logo-img">
        <h2 class="institution-name">Instituto Federal<br>Paraná</h2>
      </div>
      <h3 class="login-title">Acesso ao Sistema</h3>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" required placeholder="Digite seu email">
        </div>
        <div class="form-group">
          <label for="password">Senha</label>
          <input type="password" id="password" v-model="password" required placeholder="Digite sua senha">
        </div>
        <div class="form-actions">
           <a href="#" class="forgot-password"></a>
           <button type="submit" class="btn btn-primary login-button" :disabled="isLoading">
             {{ isLoading ? 'Entrando...' : 'Entrar' }}
           </button>
        </div>
         <div class="create-account-link">
            Não tem uma conta? <router-link to="/registrar">Crie uma aqui</router-link>
        </div>

        <div v-if="isLoading" class="loading-container">
          <div class="spinner"></div>
          <p>Buscando usuário, por favor aguarde...</p>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </form>
    </div>
  </div>

  <div class="divider">
  <span>OU</span>
</div>

<a href="https://hubsabia-backend-vdl8.onrender.com/api/auth/google" class="google-login-button">
  <!-- Você pode adicionar um ícone do Google aqui se quiser -->
  Entrar com Google
</a>
</template>

<script setup>
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
.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 20px 0;
  color: #888;
}
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #ddd;
}
.divider span {
  padding: 0 10px;
}

.google-login-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 12px;
  background-color: #4285F4;
  color: white;
  border: none;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}
.google-login-button:hover {
  background-color: #357ae8;
}

.login-view {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.login-card {
  background: #ffffff;
  padding: 40px 50px;
  border-radius: 8px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  text-align: center;
}

.logo-area {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 25px;
  gap: 15px;
}

.logo-img {
  height: 50px;
  background-color: var(--sidebar-bg, #212529);
  padding: 5px;
  border-radius: 4px;
}

.institution-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--sidebar-bg, #212529);
  line-height: 1.3;
  text-align: left;
}

.login-title {
  margin-bottom: 30px;
  color: #333;
  font-weight: 600;
  font-size: 1.4rem;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #495057;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color, #007bff);
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 25px;
  margin-bottom: 20px;
}

.forgot-password {
  font-size: 0.85rem;
  color: var(--primary-color, #007bff);
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.login-button {
  padding: 10px 25px;
}

.login-button:disabled {
  background-color: #0056b3;
  opacity: 0.7;
  cursor: not-allowed;
}

.create-account-link {
  margin-top: 25px;
  font-size: 0.9rem;
  color: #6c757d;
}

.create-account-link a {
  color: var(--primary-color, #007bff);
  text-decoration: none;
  font-weight: 500;
}

.create-account-link a:hover {
  text-decoration: underline;
}

.loading-container {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #6c757d;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: var(--primary-color, #007bff);
  animation: spin 1s ease infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-message {
  margin-top: 15px;
  padding: 10px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  font-size: 0.9rem;
}
</style>