<template>
  <div style="padding: 2rem;">
    <h1>Gestão de Chatbots</h1>
    <div v-if="error" class="error-message">
      <p>Ocorreu um erro ao buscar os dados:</p>
      <pre>{{ error }}</pre>
    </div>
    <div v-else>
      <p>Dados dos chatbots buscados com sucesso!</p>
      <pre>{{ chatbots }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';

const chatbots = ref([]);
const error = ref(null);

onMounted(async () => {
  try {
    const response = await apiClient.get('/chatbots');
    chatbots.value = response.data;
  } catch (err) {
    console.error("ERRO DETALHADO:", err);
    error.value = err;
  }
});
</script>

<style scoped>
.error-message { color: red; background-color: #ffebeb; border: 1px solid red; padding: 1rem; }
pre { background-color: #f4f4f4; padding: 1rem; border-radius: 4px; }
</style>