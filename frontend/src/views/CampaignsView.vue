<template>
  <div class="view-container">
    <header class="view-header">
      <h2>Campanhas</h2>
    </header>
    <!-- Usando o componente da Tabela -->
    <CampaignsTable 
      :campanhas="campanhas"   
      @edit="handleEditar"     
      @delete="handleExcluir"
      @add="handleCriar"
    />
    
    <!-- Usando o componente do Modal -->
    <CampaignModal 
      v-model="isModalVisible" 
      :campaign-to-edit="campanhaParaEditar"
      @campaign-created="adicionarNovaCampanhaNaLista" 
      @campaign-updated="atualizarCampanhaNaLista"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';

// MUDANÇA: Importa TODOS os componentes filhos que esta página utiliza
import AddCampaignCard from '@/components/AddCampaignCard.vue';
import CampaignsTable from '@/components/CampaignsTable.vue';
import CampaignModal from '@/components/CampaignModal.vue';

// A lógica de estado e as funções de manipulação de dados permanecem aqui
const campanhas = ref([]);
const isModalVisible = ref(false);
const campanhaParaEditar = ref(null);

// --- Funções CRUD (Lógica Central) ---
// Estas funções são chamadas em resposta aos eventos dos componentes filhos.

const buscarCampanhas = async () => {
  try {
    const response = await apiClient.get('/campanhas');
    campanhas.value = response.data;
  } catch (error) {
    console.error("Erro ao buscar campanhas:", error);
  }
};

const adicionarNovaCampanhaNaLista = (novaCampanha) => {
  campanhas.value.unshift(novaCampanha);
};

const atualizarCampanhaNaLista = (campanhaAtualizada) => {
  const index = campanhas.value.findIndex(c => c._id === campanhaAtualizada._id);
  if (index !== -1) {
    campanhas.value[index] = campanhaAtualizada;
  }
};

const handleExcluir = async (campanhaId) => {
  if (!window.confirm("Você tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita.")) {
    return;
  }
  try {
    await apiClient.delete(`/campanhas/${campanhaId}`);
    campanhas.value = campanhas.value.filter(c => c._id !== campanhaId);
    alert("Campanha excluída com sucesso!");
  } catch (error) {
    console.error("Erro ao excluir campanha:", error);
    alert(`Erro: ${error.response?.data?.msg || 'Não foi possível excluir a campanha.'}`);
  }
};

// Esta função é chamada quando o AddCampaignCard emite o evento 'click'
const handleCriar = () => {
  campanhaParaEditar.value = null;
  isModalVisible.value = true;
};

// Esta função é chamada quando a CampaignsTable emite o evento 'edit'
const handleEditar = (campanha) => {
  campanhaParaEditar.value = campanha;
  isModalVisible.value = true;
};

// --- Lifecycle Hook ---
onMounted(buscarCampanhas);
</script>

<style scoped>
/* 
  O CSS da página fica super limpo.
  O CSS do card de criação foi movido para o componente AddCampaignCard.vue.
*/
.view-container { padding: 2rem; }
.view-header h2 { font-size: 1.8rem; font-weight: 600; margin-bottom: 1.5rem; }
.card-grid { display: flex; gap: 1.5rem; margin-bottom: 2rem; }
</style>
