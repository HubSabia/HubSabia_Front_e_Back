<template>
  <div class="vitrine-container">
    <div class="header-text">
      <h1>Bem-vindo ao Hub-Sabiá!</h1>
      <p>Explore as campanhas ativas abaixo e interaja com nossos assistentes virtuais.</p>
    </div>

    <!-- Mensagem de Loading -->
    <div v-if="loading" class="loading-message">
      <p>Carregando campanhas...</p>
      <!-- Você pode adicionar um spinner aqui -->
    </div>

    <!-- Mensagem se não houver campanhas -->
    <div v-else-if="!campanhas.length" class="empty-message">
      <p>Nenhuma campanha ativa encontrada no momento. Volte mais tarde!</p>
    </div>

    <!-- Lista de Campanhas -->
    <div v-else class="campaigns-grid">
      <div v-for="campanha in campanhas" :key="campanha._id" class="campaign-card">
        <h2>{{ campanha.nome }}</h2>
        <p class="creator">Criado por: {{ campanha.criador.nome }}</p>
        <p class="description">{{ campanha.descricao || 'Nenhuma descrição fornecida.' }}</p>
        <router-link   v-if="campanha.chatbot " 
          :to="`/chat-publico/${campanha.chatbot}`" class="chat-button">
          Conversar com Assistente
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api'; // Verifique se este é o seu cliente Axios

const campanhas = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    // Faz a chamada para a nossa nova API pública
    const response = await apiClient.get('/public/campanhas');
    campanhas.value = response.data;
  } catch (error) {
    console.error('Erro ao buscar as campanhas:', error);
    // Tratar o erro, talvez mostrando uma mensagem para o usuário
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.vitrine-container {
  padding: 2rem;
}
.header-text {
  text-align: center;
  margin-bottom: 3rem;
}
.header-text h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}
.header-text p {
  font-size: 1.1rem;
  color: #666;
}
.loading-message, .empty-message {
  text-align: center;
  color: #888;
  padding: 2rem;
}
.campaigns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}
.campaign-card {
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}
.campaign-card h2 {
  margin-top: 0;
  font-size: 1.4rem;
}
.creator {
  font-size: 0.9rem;
  color: #718096;
  margin-top: -10px;
  margin-bottom: 1rem;
}
.description {
  flex-grow: 1;
  color: #4a5568;
}
.chat-button {
  display: block;
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #28a745;
  color: white;
  text-align: center;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  transition: background-color 0.2s;
}
.chat-button:hover {
  background-color: #218838;
}
</style>
