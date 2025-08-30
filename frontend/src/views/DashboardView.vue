<template>
  <div class="dashboard-view">
    <h1 class="view-title">Dashboard do Projeto Integrador IFPR</h1>
    <p class="view-subtitle">Visão geral do sistema</p>

    <!-- Placeholder for stats cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">--</div>
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

    <!-- Placeholder for recent activity table -->
    <div class="content-card">
      <h2>Atividade Recente do Sistema</h2>
      <p>Tabela de atividades recentes aparecerá aqui...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, getCurrentInstance } from 'vue';

const instance = getCurrentInstance();

onMounted(() => {
  instance.emit("update-title", "Dashboard");
});
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
  margin-bottom: 15px;
  color: #343a40;
  font-weight: 600;
}
</style>