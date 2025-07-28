<!-- src/views/RegisterView.vue -->
<template>
  <div class="register-view">
    <div class="register-card">
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
        
        <!-- Mensagem de erro ou sucesso aparecerá aqui -->
        <p v-if="message" :class="messageType" class="feedback-message">{{ message }}</p>

        <div class="form-actions">
           <button type="submit" class="btn btn-primary register-button">Criar Conta</button>
        </div>
         <div class="login-account-link">
            Já tem uma conta? <router-link to="/login">Faça o login aqui</router-link>
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
const messageType = ref(''); // 'success' ou 'error'
const router = useRouter();

const handleRegister = async () => {
  // Limpa mensagens antigas
  message.value = '';
  messageType.value = '';

  try {
    const response = await apiClient.post('/auth/registrar', form.value);
    
    // Com axios, a resposta bem-sucedida tem os dados em response.data
    const data = response.data;
    
    message.value = `${data.msg} Redirecionando para o login...`;
    messageType.value = 'success';
    
    // Redireciona para o login após 3 segundos
    setTimeout(() => {
      router.push('/login');
    }, 3000);

  } catch (error) {
    console.error("Erro ao registrar:", error);
    // Com axios, a mensagem de erro do servidor está em error.response.data.msg
    message.value = error.response?.data?.msg || 'Não foi possível criar a conta. Tente novamente.';
    messageType.value = 'error';
  }
};
</script>

<style scoped>
.register-view { display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f0f2f5; }
.register-card { background: #fff; padding: 40px 50px; border-radius: 8px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); width: 100%; max-width: 450px; text-align: center; }
.register-title { margin-bottom: 30px; }
.form-group { margin-bottom: 20px; text-align: left; }
.form-group label { display: block; margin-bottom: 8px; }
.form-group input { width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 6px; }
.form-actions { margin-top: 25px; }
.register-button { width: 100%; padding: 12px; background-color: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; }
.login-account-link { margin-top: 20px; }
.feedback-message { margin-bottom: 15px; font-weight: 500; }
.success { color: green; }
.error { color: red; }
</style>