<template>
  <div class="vitrine-container">
    <div class="header-text">
      <h1>Bem-vindo ao Hub-Sabiá!</h1>
      <p>Explore as campanhas ativas abaixo e interaja com nossos assistentes virtuais.</p>
    </div>

    <!-- Loading state -->
    <LoadingSpinner 
      v-if="loading" 
      message="Carregando campanhas ativas..." 
    />

    <!-- Mensagem se não houver campanhas -->
    <div v-else-if="campanhas.length === 0" class="empty-message">
      <p>Nenhuma campanha ativa encontrada no momento. Volte mais tarde!</p>
    </div>

    <!-- Lista de Campanhas -->
    <div v-else class="campaigns-grid">
      <div v-for="campanha in campanhas" :key="campanha._id" class="campaign-card">
        <h2>{{ campanha.nome }}</h2>
        <p class="creator">Criado por: {{ campanha.criador.nome }}</p>
        <p class="description">{{ campanha.descricao || 'Nenhuma descrição fornecida.' }}</p>
        <router-link 
          v-if="campanha.chatbot" 
          :to="`/chat-publico/${campanha.chatbot}`" 
          class="chat-button"
        >
          Conversar com Assistente
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const campanhas = ref([]);
const loading = ref(true);
const showDebug = ref(false); // Mude para true se quiser ver os IDs

onMounted(async () => {
  try {
    console.log('=== VITRINE VIEW ===');
    console.log('Buscando campanhas públicas...');
    
    const response = await apiClient.get('/public/campanhas');
    console.log('Campanhas recebidas:', response.data);
    
    // Log detalhado de cada campanha
    response.data.forEach((camp, index) => {
      console.log(`Campanha ${index + 1}:`, {
        nome: camp.nome,
        chatbot: camp.chatbot,
        chatbotType: typeof camp.chatbot,
        temChatbot: !!camp.chatbot
      });
    });
    
    campanhas.value = response.data;
  } catch (error) {
    console.error('Erro ao buscar as campanhas:', error);
    console.error('Detalhes:', error.response?.data);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.vitrine-container {
  padding: 2rem;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header-text {
  text-align: center;
  margin-bottom: 3rem;
}

.header-text h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.header-text p {
  font-size: 1.1rem;
  color: #666;
}

.loading-message, .empty-message {
  text-align: center;
  color: #888;
  padding: 2rem;
  font-size: 1.1rem;
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
  transition: transform 0.2s, box-shadow 0.2s;
}

.campaign-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px -1px rgba(0,0,0,0.15);
}

.campaign-card h2 {
  margin-top: 0;
  font-size: 1.4rem;
  color: #2d3748;
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
  line-height: 1.6;
  margin-bottom: 1rem;
}

.debug-info {
  font-size: 0.8rem;
  color: #e53e3e;
  background-color: #fff5f5;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  font-family: monospace;
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

.no-chatbot {
  display: block;
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #6c757d;
  color: white;
  text-align: center;
  border-radius: 6px;
  font-weight: 500;
  font-style: italic;
}

@media (max-width: 767px) {
  .vitrine-container {
    padding: 1rem;
  }
  
  .header-text h1 {
    font-size: 2rem;
  }
  
  .campaigns-grid {
    grid-template-columns: 1fr;
  }
}
</style>