<template>
  <div class="view-container">
    <header class="view-header">
      <h2>Campanhas</h2>
    </header>

    <div class="card-grid">
      <!-- Este card pode ser seu componente AddCampaignCard.vue -->
       <div class="new-campaign-card" @click="handleCriar">
        <div class="plus-icon">+</div>
      </div>
    </div>

    <!-- 
      1. USANDO O COMPONENTE DA TABELA 
      - :campanhas="campanhas" -> Passa a lista de campanhas como uma 'prop' para o filho.
      - @edit="handleEditar" -> Escuta o evento 'edit' que o filho emite e chama a função 'handleEditar'.
      - @delete="handleExcluir" -> Escuta o evento 'delete' e chama a função 'handleExcluir'.
    -->
    <CampaignsTable 
      :campanhas="campanhas"   
      @edit="handleEditar"     
      @delete="handleExcluir"  
    />
    
    <!-- O modal continua aqui, pois é controlado por esta página -->
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

// 2. IMPORTA OS COMPONENTES "FILHOS"
import CampaignsTable from '@/components/CampaignsTable.vue';
import CampaignModal from '@/components/CampaignModal.vue';

// 3. A LÓGICA E OS DADOS PERMANECEM NA "PÁGINA INTELIGENTE"
const campanhas = ref([]);
const isModalVisible = ref(false);
const campanhaParaEditar = ref(null);

// --- Funções CRUD (Lógica Central) ---
// Estas funções agora são chamadas em resposta aos eventos dos componentes filhos.

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

const handleCriar = () => {
  campanhaParaEditar.value = null;
  isModalVisible.value = true;
};

const handleEditar = (campanha) => {
  campanhaParaEditar.value = campanha;
  isModalVisible.value = true;
};

// --- Lifecycle Hook ---
onMounted(buscarCampanhas);
</script>

<style scoped>
.view-container { padding: 2rem; }
.view-header h2 { font-size: 1.8rem; font-weight: 600; margin-bottom: 1.5rem; }
.card-grid { display: flex; gap: 1.5rem; margin-bottom: 2rem; }
.new-campaign-card { width: 150px; height: 150px; background-color: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 8px; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: all 0.2s ease-in-out; }
.new-campaign-card:hover { background-color: #e9ecef; border-color: #adb5bd; }
.plus-icon { font-size: 3rem; color: #adb5bd; font-weight: 300; }
</style>