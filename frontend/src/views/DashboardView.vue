<template>
  <div class="view-container">
    <header class="view-header">
      <h2 class="main-title">Dashboard</h2>
      <p class="subtitle">Visão geral do sistema HubSabia</p>
    </header>

    <!-- Grade de Estatísticas -->
    <div class="stats-grid">
      <!-- Card de Editais -->
      <div class="stat-card">
        <div class="stat-number">{{ stats.editais }}</div>
        <div class="stat-label">Editais</div>
        <router-link to="/editais" class="card-link">Ver todos</router-link>
      </div>
      <!-- Card de Campanhas -->
      <div class="stat-card">
        <div class="stat-number">{{ stats.campanhas }}</div>
        <div class="stat-label">Campanhas</div>
        <router-link to="/campanhas" class="card-link">Ver todas</router-link>
      </div>
      <!-- Card de Chatbots -->
      <div class="stat-card">
        <div class="stat-number">{{ stats.chatbots }}</div>
        <div class="stat-label">Chatbots</div>
        <router-link to="/chatbots" class="card-link">Gerenciar</router-link>
      </div>
      <!-- Card de Usuários (só para admins) -->
      <div v-if="isAdminUser" class="stat-card">
        <div class="stat-number">{{ stats.usuarios }}</div>
        <div class="stat-label">Usuários</div>
        <router-link to="/usuarios" class="card-link">Ver todos</router-link>
      </div>
    </div>

    <!-- Atividade Recente -->
    <div class="recent-activity">
      <h3 class="list-title">Atividade Recente</h3>
      <div v-if="isLoading" class="loading-message">Carregando...</div>
      <div v-else-if="stats.atividadeRecente" class="activity-item">
        <span class="activity-title">{{ stats.atividadeRecente.nome }}</span>
        <div class="activity-details">
          <span class="status-badge">{{ stats.atividadeRecente.status }}</span>
          <span class="activity-date">
            {{ formatarData(stats.atividadeRecente.periodo_inicio) }} - {{ formatarData(stats.atividadeRecente.periodo_fim) }}
          </span>
        </div>
      </div>
      <p v-else class="no-activity">Nenhuma campanha ativa no momento.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';
import { isAdmin } from '@/utils/auth';

const isAdminUser = isAdmin();
const isLoading = ref(true);
const stats = ref({
  editais: 0,
  campanhas: 0,
  chatbots: 0,
  usuarios: 0,
  atividadeRecente: null
});

const buscarEstatisticas = async () => {
  isLoading.value = true;
  try {
    const response = await apiClient.get('/dashboard/stats');
    stats.value = response.data;
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
  } finally {
    isLoading.value = false;
  }
};

const formatarData = (data) => {
  if (!data) return '';
  return new Date(data).toLocaleDateString('pt-BR');
};

onMounted(buscarEstatisticas);
</script>

<style scoped>
.view-container {
  padding: 2rem;
}

.view-header {
  margin-bottom: 2rem;
}

.main-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color-dark);
}

.subtitle {
  font-size: 1rem;
  color: var(--text-color-muted);
}

.stats-grid {
  display: grid;
  /* Cria 4 colunas em telas grandes */
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background-color: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border-left: 5px solid var(--primary-color);
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-color-dark);
}

.stat-label {
  color: var(--text-color-muted);
  margin-bottom: auto; /* Empurra o link para o fundo */
  padding-bottom: 1rem;
}

.card-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}
.card-link:hover {
  color: #0b5ed7; /* Tom de azul mais escuro */
}

.recent-activity {
  background-color: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.list-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap; /* Permite quebrar linha em telas pequenas */
  gap: 1rem;
}

.activity-title {
  font-weight: 600;
}

.activity-details {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: #d4edda;
  color: #155724;
}

.activity-date {
  font-size: 0.9rem;
  color: var(--text-color-muted);
}

.loading-message, .no-activity {
  color: var(--text-color-muted);
  font-style: italic;
}

/* RESPONSIVIDADE */
@media (max-width: 1024px) {
  /* Em tablets, a grade tem 2 colunas */
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  .view-container {
    padding: 1rem;
  }
  
  /* Em celulares, a grade tem 1 coluna */
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>