<template>
  <div class="register-view">
    <div class="register-card">
      <div class="logo-area">
        <img src="/ifpr_logo_placeholder.svg" alt="Logo IFPR" class="logo-img">
        <h2 class="institution-name">Instituto Federal<br>Paraná</h2>
      </div>
      <h3 class="register-title">Criar Nova Conta</h3>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="nome">Nome Completo</label>
          <input type="text" id="nome" v-model="form.nome" required placeholder="Digite seu nome completo">
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="form.email" required placeholder="Digite seu melhor email">
        </div>
        <div class="form-group">
          <label for="password">Senha</label>
          <input type="password" id="password" v-model="form.senha" required placeholder="Crie uma senha forte">
        </div>
        
        <div class="form-actions">
           <button type="submit" class="btn btn-primary register-button" :disabled="isLoading">
             {{ isLoading ? 'Criando conta...' : 'Criar Conta' }}
           </button>
        </div>
         <div class="login-account-link">
            Já tem uma conta? <router-link to="/login">Faça o login aqui</router-link>
        </div>

        <div v-if="isLoading" class="loading-container">
          <div class="spinner"></div>
          <p>Criando sua conta, por favor aguarde...</p>
        </div>

        <div v-if="message" :class="messageType" class="feedback-message">
          {{ message }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/services/api';

const form = ref({
  nome: '',
  email: '',
  senha: ''
});
const message = ref('');
const messageType = ref('');
const isLoading = ref(false);
const router = useRouter();

const handleRegister = async () => {
  message.value = '';
  messageType.value = '';
  isLoading.value = true;

  try {
    const response = await apiClient.post('/auth/registrar', form.value);
    const data = response.data;
    
    message.value = `${data.msg} Redirecionando para o login...`;
    messageType.value = 'success';
    
    setTimeout(() => {
      router.push('/login');
    }, 3000);

  } catch (error) {
    console.error("Erro ao registrar:", error);
    message.value = error.response?.data?.msg || 'Não foi possível criar a conta. Tente novamente.';
    messageType.value = 'error';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.register-view {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.register-card {
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

.register-title {
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
  margin-top: 25px;
  margin-bottom: 20px;
}

.register-button {
  width: 100%;
  padding: 12px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
}

.register-button:hover {
  background-color: #218838;
}

.register-button:disabled {
  background-color: #28a745;
  opacity: 0.7;
  cursor: not-allowed;
}

.login-account-link {
  margin-top: 20px;
  font-size: 0.9rem;
  color: #6c757d;
}

.login-account-link a {
  color: var(--primary-color, #007bff);
  text-decoration: none;
  font-weight: 500;
}

.login-account-link a:hover {
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

.feedback-message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
}

.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>