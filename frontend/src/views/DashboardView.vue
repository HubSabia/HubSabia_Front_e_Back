<template>
  <div class="dashboard-view">
    <h2 class="view-title">Dashboard</h2>
    <p class="view-subtitle">Visão geral do sistema</p>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">{{ campanhas.length }}</div>
        <div class="stat-label">Campanhas Ativas</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">--</div>
        <div class="stat-label">Chatbots Configurados</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">--</div>
        <div class="stat-label">Interações Hoje</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">--</div>
        <div class="stat-label">Usuários Ativos</div>
      </div>
    </div>

    <div class="content-card">
      <h3>Atividade Recente (Minhas Campanhas)</h3>
      <ul v-if="campanhas.length > 0" class="campaign-list">
        <li v-for="campanha in campanhas" :key="campanha._id" class="campaign-item">
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
        <router-link to="/campanhas" class="btn btn-primary">Criar primeira campanha</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';

const campanhas = ref([]);

const buscarCampanhas = async () => {
  try {
    console.log('Buscando dados das campanhas...');
    const response = await apiClient.get('/campanhas');
    campanhas.value = response.data;
    console.log('Campanhas recebidas:', response.data);
  } catch (error) {
    console.error('Falha ao buscar dados do dashboard:', error.response ? error.response.data : error.message);
  }
};

const formatarData = (data) => {
  if (!data) return '';
  return new Date(data).toLocaleDateString('pt-BR');
};

onMounted(buscarCampanhas);
</script>

<style scoped>
.dashboard-view {
  padding: 20px;
}

.view-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #343a40;
  margin-bottom: 5px;
}

.view-subtitle {
  font-size: 1rem;
  color: #6c757d;
  margin-bottom: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 25px;
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

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .campaign-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>