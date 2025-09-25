<template>
  <div class="dashboard-view">
    <div class="dashboard-header">
      <h2 class="view-title">Dashboard</h2>
      <p class="view-subtitle">Visão geral do sistema HubSabia</p>
    </div>

    <!-- Cards de Status Simplificados -->
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
.dashboard-view {
  padding: 0;
}

.dashboard-header {
  margin-bottom: 30px;
}

.view-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-color, #343a40);
  margin-bottom: 5px;
}

.view-subtitle {
  font-size: 1rem;
  color: var(--secondary-color, #6c757d);
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto, 200px);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: var(--card-bg, #ffffff);
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  text-align: center;
  border-left: 5px solid var(--primary-color, #007bff);
}

.stat-card:hover {
  transform: translateY(-2px);
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
  margin-bottom: 10px;
}

.stat-link {
  color: var(--primary-color, #007bff);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
}

.stat-link:hover {
  text-decoration: underline;
}

.content-card {
  background-color: var(--card-bg, #ffffff);
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.content-card h3 {
  margin-bottom: 20px;
  color: #343a40;
  font-weight: 600;
}

.campaign-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.campaign-item {
  padding: 15px 0;
  border-bottom: 1px solid #e9ecef;
}

.campaign-item:last-child {
  border-bottom: none;
}

.campaign-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.campaign-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-ativa {
  background-color: #d4edda;
  color: #155724;
}

.status-planejada {
  background-color: #cce5ff;
  color: #004085;
}

.status-concluída {
  background-color: #e2e3e5;
  color: #383d41;
}

.status-cancelada {
  background-color: #f8d7da;
  color: #721c24;
}

.campaign-period {
  color: #6c757d;
  font-size: 0.9rem;
}

.no-campaigns {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}

.no-campaigns p {
  margin-bottom: 20px;
  font-size: 1.1rem;
}
</style>
