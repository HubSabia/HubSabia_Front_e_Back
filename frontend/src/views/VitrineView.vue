<template>
  <div class="vitrine-container">
    <header class="page-header">
      <h1>Bem-vindo ao Hub-Sabiá!</h1>
      <p>Explore as campanhas ativas abaixo e interaja com nossos assistentes virtuais.</p>
    </header>

    <div v-if="loading" class="status-message">
      <p>Carregando campanhas...</p>
    </div>

    <div v-else-if="!campanhas.length" class="status-message">
      <p>Nenhuma campanha ativa encontrada no momento. Volte mais tarde!</p>
    </div>

    <div v-else class="campaigns-grid">

      <div v-for="campanha in campanhas" :key="campanha._id" class="campaign-card">
        <div class="card-content">
          <h2 class="card-title">{{ campanha.nome }}</h2>
          <p class="card-creator">Criado por: {{ campanha.criador.nome }}</p>
          <p class="card-dates">
            Período: {{ formatarData(campanha.periodo_inicio) }} a {{ formatarData(campanha.periodo_fim) }}
          </p>
          <p class="card-description">{{ campanha.descricao || 'Nenhuma descrição fornecida.' }}</p>
          
          <!-- Botão só aparece se houver um chatbot associado -->
          <router-link v-if="campanha.chatbot" :to="`/chat-publico/${campanha.chatbot}`" class="chat-button">
            Conversar com Assistente
          </router-link>
          <p v-else class="no-chatbot">Chatbot não disponível</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';

const campanhas = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const response = await apiClient.get('/public/campanhas');
    campanhas.value = response.data;
  } catch (error) {
    console.error('Erro ao buscar as campanhas:', error);
  } finally {
    loading.value = false;
  }
});

function formatarData(dataString) {
  if (!dataString) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dataString).toLocaleDateString('pt-BR', options);
}
</script>

<style scoped>
.vitrine-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}
.page-header h1 {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #1e293b;
}
.page-header p {
  font-size: 1.1rem;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
}

.status-message {
  text-align: center;
  color: #64748b;
  padding: 3rem;
  font-size: 1.1rem;
}

.campaigns-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.campaign-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-top: 5px solid #28a745;
}

.campaign-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
}


.card-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.card-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.card-creator {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 1rem 0;
  font-weight: 500;
}

.card-dates {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #f1f5f9;
  border-radius: 6px;
  border-left: 4px solid var(--primary-color, #28a745);
}

.card-description {
  flex-grow: 1;
  color: #475569;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}

.chat-button {
  display: block;
  padding: 0.875rem;
  background-color: var(--primary-color, #28a745);
  color: white;
  text-align: center;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  transition: background-color 0.2s, transform 0.2s;
}

.chat-button:hover {
  background-color: var(--primary-color-hover, #218838);
  transform: scale(1.02);
}

.no-chatbot {
  text-align: center;
  padding: 0.875rem;
  background-color: #f8f9fa;
  color: #6c757d;
  border-radius: 8px;
  font-style: italic;
  border: 1px dashed #dee2e6;
}

/* --- MEDIA QUERIES PARA RESPONSIVIDADE --- */

/* Telas médias (tablets) */
@media (min-width: 640px) {
  .vitrine-container {
    padding: 2rem;
  }
  .campaigns-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Telas grandes (desktops) */
@media (min-width: 1024px) {
  .page-header h1 {
    font-size: 2.5rem;
  }
  .campaigns-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Telas extra grandes */
@media (min-width: 1280px) {
  .campaigns-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>