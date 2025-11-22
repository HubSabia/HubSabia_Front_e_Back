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

    <div v-else class="campaigns-list">
      <div v-for="campanha in campanhas" :key="campanha._id" class="campaign-card">
        <!-- Imagem da Campanha -->
        <div class="card-image">
          <img 
            v-if="campanha.imagemUrl" 
            :src="campanha.imagemUrl" 
            :alt="campanha.nome"
          >
          <div v-else class="placeholder-image"></div>
        </div>

        <!-- Conteúdo do Card -->
        <div class="card-content">
          <div class="card-info">
            <p><strong>Nome da Campanha:</strong> {{ campanha.nome }}</p>
            <p><strong>Criador:</strong> {{ campanha.criador?.nome || 'Não informado' }}</p>
            <p><strong>Descrição:</strong> {{ campanha.descricao || 'Sem descrição' }}</p>
          </div>

          <!-- Botão de Chat -->
          <router-link 
            v-if="campanha.chatbot" 
            :to="`/chat-publico/${campanha.chatbot}`" 
            class="chat-button"
          >
            conversar com o bot
          </router-link>
          <span v-else class="no-chatbot">Chatbot não disponível</span>

          <!-- Período -->
          <p class="card-period">
            Período: {{ formatarData(campanha.periodo_inicio) }} a {{ formatarData(campanha.periodo_fim) }}
          </p>
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
  if (!dataString) return '00/00/0000';
  const date = new Date(dataString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
</script>

<style scoped>
.vitrine-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #1e293b;
}

.page-header p {
  font-size: 1rem;
  color: #64748b;
}

.status-message {
  text-align: center;
  color: #64748b;
  padding: 3rem;
  font-size: 1.1rem;
}

.campaigns-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* === CARD DA CAMPANHA === */
.campaign-card {
  display: flex;
  background-color: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s ease;
}

.campaign-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

/* Imagem do Card */
.card-image {
  width: 150px;
  min-width: 150px;
  height: 150px;
  background-color: #dee2e6;
  flex-shrink: 0;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  background-color: #dee2e6;
}

/* Conteúdo do Card */
.card-content {
  flex: 1;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-info {
  margin-bottom: 0.75rem;
}

.card-info p {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  color: #495057;
  line-height: 1.4;
}

.card-info strong {
  color: #212529;
}

/* Botão de Chat */
.chat-button {
  display: inline-block;
  width: fit-content;
  padding: 0.6rem 1.5rem;
  background-color: #28a745;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  transition: background-color 0.2s;
  margin-bottom: 0.75rem;
}

.chat-button:hover {
  background-color: #218838;
}

.no-chatbot {
  display: inline-block;
  width: fit-content;
  padding: 0.6rem 1.5rem;
  background-color: #e9ecef;
  color: #6c757d;
  border-radius: 6px;
  font-size: 0.9rem;
  font-style: italic;
  margin-bottom: 0.75rem;
}

/* Período */
.card-period {
  margin: 0;
  font-size: 0.85rem;
  color: #6c757d;
}

/* === RESPONSIVIDADE === */
@media (max-width: 576px) {
  .campaign-card {
    flex-direction: column;
  }

  .card-image {
    width: 100%;
    height: 180px;
  }

  .card-content {
    padding: 1rem;
  }

  .chat-button,
  .no-chatbot {
    width: 100%;
    text-align: center;
  }
}
</style>