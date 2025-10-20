<template>
  <div class="view-container">
    <header class="view-header">
      <h2>Meu Perfil</h2>
    </header>

    <div class="list-card">
      <h3 class="list-title">Configuração da Chave de API</h3>
      <p class="description">
        Para utilizar os chatbots, você precisa fornecer sua própria chave de API do Google AI Studio (Gemini).
        Isso garante que o uso seja associado à sua conta.
      </p>

      <form @submit.prevent="salvarApiKey" class="api-key-form">
        <div class="form-group">
          <label for="apiKey">Sua Chave de API do Google AI (Gemini)</label>
          <input type="password" id="apiKey" v-model="apiKey" placeholder="Cole sua chave de API aqui">
          <small>Sua chave é armazenada de forma segura e usada apenas para interagir com os chatbots.</small>
        </div>
        
        <button type="submit" class="btn-primary" :disabled="isLoading">
          {{ isLoading ? 'Salvando...' : 'Salvar Chave' }}
        </button>
      </form>
      
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';

const apiKey = ref('');
const isLoading = ref(false);
const successMessage = ref('');

// Busca a chave de API existente quando a página carrega
const buscarApiKey = async () => {
  try {
    const response = await apiClient.get('/profile/apikey');
    apiKey.value = response.data.apiKey;
  } catch (error) {
    console.error("Erro ao buscar a chave de API:", error);
  }
};

// Salva a nova chave de API
const salvarApiKey = async () => {
  isLoading.value = true;
  successMessage.value = '';
  try {
    const response = await apiClient.put('/profile/apikey', { apiKey: apiKey.value });
    successMessage.value = response.data.msg;
  } catch (error) {
    console.error("Erro ao salvar a chave de API:", error);
    toast.error("Não foi possível salvar a chave. Tente novamente.");
  } finally {
    isLoading.value = false;
  }
};

onMounted(buscarApiKey);
</script>

<style scoped>
/* Estilos para a página de perfil */
.view-container { padding: 2rem; }
.view-header h2 { font-size: 1.8rem; font-weight: 600; margin-bottom: 1.5rem; }
.list-card { background-color: #fff; border-radius: 8px; padding: 1.5rem 2rem; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
.list-title { font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem; }
.description { color: #6c757d; margin-bottom: 2rem; }
.api-key-form .form-group { margin-bottom: 1.5rem; }
.api-key-form label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
.api-key-form input { width: 100%; max-width: 600px; padding: 0.75rem; border: 1px solid #ced4da; border-radius: 4px; }
.api-key-form small { display: block; margin-top: 0.5rem; color: #6c757d; font-size: 0.8rem; }

.success-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
}
</style>