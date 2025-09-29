<template>
  <div class="view-container">
    <header class="view-header">
      <h2>Criar Campanhas</h2>
      <button class="btn-primary" @click="handleCriar">Adicionar</button>
    </header>

    <div class="list-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Período</th>
            <th>Público</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td colspan="5" class="message">Carregando campanhas...</td>
          </tr>
          <tr v-if="!isLoading && campanhas.length === 0">
            <td colspan="5" class="message">Nenhuma campanha encontrada.</td>
          </tr>
          <tr v-for="campanha in campanhas" :key="campanha._id">
            <td>{{ campanha.nome }}</td>
            <td>{{ formatarData(campanha.periodo_inicio) }} - {{ formatarData(campanha.periodo_fim) }}</td>
            <td>{{ campanha.publico_alvo }}</td>
            <td>{{ campanha.status }}</td>
            <td class="actions-buttons">
              <button class="btn-edit" @click="handleEditar(campanha)">Editar</button>
              <button class="btn-delete" @click="handleExcluir(campanha._id)">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

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
/* ESTILOS PADRONIZADOS PARA A VIEW */
.view-container {
  padding: 2rem;
  background-color: #e9ecef; /* Fundo cinza claro da página */
  min-height: calc(100vh - 70px); /* Ocupa a altura da tela menos o header */
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.view-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
}

.btn-primary {
  background-color: #28a745; /* Verde Adicionar */
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}
.btn-primary:hover {
  background-color: #218838;
}

/* ESTILOS DO CONTAINER DA LISTA/TABELA */
.list-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  overflow: hidden; /* Garante que as bordas da tabela fiquem contidas */
}

/* ESTILOS DA TABELA */
.data-table {
  width: 100%;
  border-collapse: collapse; /* Remove espaçamento entre células */
}

.data-table th, .data-table td {
  padding: 1rem 1.5rem;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
  vertical-align: middle;
}

.data-table thead {
  background-color: #f8f9fa; /* Fundo cinza bem claro para o cabeçalho */
}

.data-table th {
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  font-size: 0.8rem;
}

.data-table tbody tr:last-child td {
  border-bottom: none; /* Remove a borda da última linha */
}

.data-table tbody tr:hover {
  background-color: #f8f9fa; /* Efeito suave ao passar o mouse */
}

.actions-buttons {
  display: flex;
  gap: 0.5rem;
}

.actions-buttons button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  color: white;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.85rem;
  transition: opacity 0.2s;
}

.actions-buttons button:hover {
  opacity: 0.85;
}

.btn-edit { background-color: #0d6efd; } /* Azul */
.btn-delete { background-color: #dc3545; } /* Vermelho */

.message {
  padding: 2rem;
  text-align: center;
  color: #6c757d;
  font-style: italic;
}
</style>
