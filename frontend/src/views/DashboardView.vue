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

</style>
