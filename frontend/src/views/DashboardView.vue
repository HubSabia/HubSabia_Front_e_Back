<template>
  <div class="view-container">
    <h1 class="view-title">Dashboard</h1>
    <p class="view-subtitle">Visão geral do sistema</p>

    <!-- Placeholder for stats cards -->
      <div class="status-grid">
      <div class="stat-card">
        <div class="stat-number">{{ editais.length }}</div>
        <div class="stat-label">Editais</div>
        <router-link to="/editais" class="stat-link">Ver todos</router-link>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ campanhas.length }}</div>
        <div class="stat-label">Campanhas</div>
        <router-link to="/campanhas" class="stat-link">Ver todas</router-link>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ chatbots.length }}</div>
        <div class="stat-label">Chatbots</div>
        <router-link to="/gerencia" class="stat-link">Gerenciar</router-link>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ usuarios.length }}</div>
        <div class="stat-label">Usuários</div>
        <router-link to="/usuarios" class="stat-link">Ver todos</router-link>
      </div>
    </div>

    <!-- Atividade Recente Simplificada -->
    <div class="content-card">
      <h3>Atividade Recente</h3>
      <ul v-if="campanhas.length > 0" class="campaign-list">
        <li v-for="campanha in campanhas.slice(0, 5)" :key="campanha._id" class="campaign-item">
          <div class="campaign-info">
            <strong>{{ campanha.nome }}</strong>
            <span class="campaign-status" :class="`status-${campanha.status.toLowerCase()}`">
              {{ campanha.status }}
            </span>
          </div>
          <div class="campaign-period">
            {{ formatarData(campanha.periodo_inicio) }} - {{ formatarData(campanha.periodo_fim) }}
          </div>
        </li>
      </ul>
      <div v-else class="no-campaigns">
        <p>Nenhuma campanha encontrada.</p>
        <router-link to="/editais" class="btn btn-primary">Começar criando um edital</router-link>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';

const campanhas = ref([]);
const editais = ref([]);
const chatbots = ref([]);
const usuarios = ref([]);

const buscarDados = async () => {
  try {
    // Buscar campanhas
    const responseCampanhas = await apiClient.get('/campanhas');
    campanhas.value = responseCampanhas.data;

    // Buscar editais
    try {
      const responseEditais = await apiClient.get('/editais');
      editais.value = responseEditais.data;
    } catch (error) {
      console.log('Endpoint de editais não disponível:', error.message);
      editais.value = [];
    }

    // Buscar chatbots
    try {
      const responseChatbots = await apiClient.get('/chatbots');
      chatbots.value = responseChatbots.data;
    } catch (error) {
      console.log('Endpoint de chatbots não disponível:', error.message);
      chatbots.value = [];
    }

    // Buscar usuários
    try {
      const responseUsuarios = await apiClient.get('/usuarios');
      usuarios.value = responseUsuarios.data;
    } catch (error) {
      console.log('Endpoint de usuários não disponível:', error.message);
      usuarios.value = [];
    }

  } catch (error) {
    console.error('Falha ao buscar dados do dashboard:', error.response ? error.response.data : error.message);
  }
};

const formatarData = (data) => {
  if (!data) return '';
  return new Date(data).toLocaleDateString('pt-BR');
};

onMounted(buscarDados);
</script>

<style scoped>
.main-layout .content-wrapper {
    margin-left: 160px;
}
.view-container {
  padding: 30px;
}

.view-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 5px;
}

.view-subtitle {
  font-size: 1rem;
  color: #6c757d;
  margin-bottom: 30px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(520px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: #ffffff;
  padding: 25px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  text-align: center;
  border-left: 5px solid #007bff;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: transform 0.2s ease-in-out;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #212529;
  margin-bottom: 5px;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9rem;
}

.content-card {
  background-color: var(--card-bg, #ffffff);
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.content-card h3 {
  margin-bottom: 15px;
  color: #343a40;
  font-weight: 600;
}
</style>
