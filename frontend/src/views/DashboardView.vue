<template>
  <div class="dashboard-view">
    <h2 class="view-title">Dashboard</h2>
    <p class="view-subtitle">Visão geral do sistema</p>

    <div class="stats-grid">
      <div class="stat-card">
        <!-- DADO REAL: Mostra o número de campanhas recebidas da API -->
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
      <!-- DADO REAL: Lista as campanhas recebidas da API -->
      <ul v-if="campanhas.length > 0">
        <li v-for="campanha in campanhas" :key="campanha.id">
          {{ campanha.nome }} (Criador ID: {{ campanha.criador }})
        </li>
      </ul>
      <p v-else>Nenhuma campanha encontrada.</p>
    </div>
  </div>
</template>

<script setup>
// MUDANÇA 1: Importamos 'ref' para criar variáveis reativas e nosso 'apiClient'
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api'; // Importa nosso cliente de API configurado

// MUDANÇA 2: Criamos uma variável reativa para guardar a lista de campanhas
const campanhas = ref([]);

// MUDANÇA 3: A função onMounted agora é 'async' para poder fazer chamadas de API
onMounted(async () => {
  try {
    // Busca os dados da rota protegida '/api/campanhas'
    // O apiClient automaticamente adiciona o token de autenticação
    console.log('Buscando dados das campanhas...');
    const response = await apiClient.get('/campanhas');

    // Atualiza nossa variável reativa com os dados recebidos do backend
    campanhas.value = response.data;
    console.log('Campanhas recebidas:', response.data);

  } catch (error) {
    // Se ocorrer um erro (ex: token inválido, servidor offline), ele será mostrado no console
    console.error('Falha ao buscar dados do dashboard:', error.response ? error.response.data : error.message);
    // Você pode adicionar um alerta para o usuário aqui se quiser
    // alert('Não foi possível carregar os dados do dashboard.');
  }
});
</script>

<style scoped>
/* Seu CSS continua o mesmo, sem nenhuma alteração necessária */
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