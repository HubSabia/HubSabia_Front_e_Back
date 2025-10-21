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
  
  <!-- MUDANÇA: Adicionados os atributos 'data-label' a cada <td> -->
  <tr v-for="campanha in campanhas" :key="campanha._id">
    <td data-label="Nome">{{ campanha.nome }}</td>
    <td data-label="Período">{{ formatarData(campanha.periodo_inicio) }} - {{ formatarData(campanha.periodo_fim) }}</td>
    <td data-label="Público">{{ campanha.publico_alvo }}</td>
    <td data-label="Status">{{ campanha.status }}</td>
    <td data-label="Ações" class="actions-buttons">
      <button class="btn-edit" @click="handleEditar(campanha)">Editar</button>
      <button class="btn-delete" @click="confirmarExclusao(campanha._id)">Excluir</button>
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

    <ConfirmModal
      :isVisible="isConfirmModalVisible"
      title="Confirmar Exclusão"
      message="Você tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita."
      @confirm="executeDelete"
      @cancel="closeConfirmModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';
import { useToast } from "vue-toastification";
import ConfirmModal from '@/components/ConfirmModal.vue';
// import CampaignsTable from '@/components/CampaignsTable.vue'; 
import CampaignModal from '@/components/CampaignModal.vue';


// A lógica de estado e as funções de manipulação de dados
const campanhas = ref([]);
const isModalVisible = ref(false);
const campanhaParaEditar = ref(null);
const isLoading = ref(true); // Adicionando para uma melhor UX
const isConfirmModalVisible = ref(false);
const itemToDeleteId = ref(null);
const toast = useToast();
// --- Funções CRUD (Lógica Central) ---

const buscarCampanhas = async () => {
  isLoading.value = true;
  try {
    const response = await apiClient.get('/campanhas');
    campanhas.value = response.data;
  } catch (error) {
    console.error("Erro ao buscar campanhas:", error);
    toast.error("Não foi possível carregar as campanhas.");
  } finally {
    isLoading.value = false;
  }
};

const adicionarNovaCampanhaNaLista = (novaCampanha) => {
  campanhas.value.unshift(novaCampanha);
  toast.success(`Campanha "${novaCampanha.nome}" criada com sucesso!`);
};

const atualizarCampanhaNaLista = (campanhaAtualizada) => {
  const index = campanhas.value.findIndex(c => c._id === campanhaAtualizada._id);
  if (index !== -1) {
    campanhas.value[index] = campanhaAtualizada;
  }
  toast.success(`Campanha "${campanhaAtualizada.nome}" atualizada com sucesso!`);
};

const confirmarExclusao = async (campanhaId) => {
  itemToDeleteId.value = campanhaId;
  isConfirmModalVisible.value = true;
};

const closeConfirmModal = () => {
  isConfirmModalVisible.value = false;
  itemToDeleteId.value = null;
};

const executeDelete = async () => {
  try {
    if (!itemToDeleteId.value) { // Checagem de segurança
      toast.error("Nenhum item selecionado para exclusão.");
      closeConfirmModal();
      return;
    }
    await apiClient.delete(`/campanhas/${itemToDeleteId.value}`);
    chatbots.value = chatbots.value.filter(c => c._id !== itemToDeleteId.value);
    toast.success("Campanha excluída com sucesso!");
  } catch (error) {
    console.error("Erro ao excluir campanha:", error);
    toast.error(error.response?.data?.msg || 'Não foi possível excluir a campanha.');
  } finally {
    closeConfirmModal();
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

const formatarData = (data) => {
  if (!data) return '';
  // Formata a data para o padrão dd/mm/aaaa
  return new Date(data).toLocaleDateString('pt-BR');
};


// --- Lifecycle Hook ---
onMounted(buscarCampanhas);
</script>

<style scoped>
/* ESTILOS PADRONIZADOS PARA A VIEW */
.view-container {
  padding: 2rem;
  background-color: #F9F9F9;
  min-height: calc(100vh - 70px);
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

@media (max-width: 767px) {
  /* 1. Esconde o cabeçalho da tabela, pois não o usaremos no layout de card */
  .data-table thead {
    display: none;
  }

  /* 2. Transforma a tabela, o corpo, as linhas e as células em blocos empilhados */
  .data-table, .data-table tbody, .data-table tr, .data-table td {
    display: block;
    width: 100%;
  }

  /* 3. Cada linha agora se parece com um "card" */
  .data-table tr {
    margin-bottom: 1rem;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  /* 4. Cada célula se torna uma linha dentro do card */
  .data-table td {
    display: flex;
    justify-content: space-between; /* Alinha o rótulo à esquerda e o valor à direita */
    align-items: center;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f1f1f1;
  }

  .data-table tr:last-child td:last-child {
    border-bottom: none; /* Remove a borda da última célula do último card */
  }

  /* 5. A mágica: Adiciona o rótulo (que pegamos do 'data-label') antes do conteúdo da célula */
  .data-table td[data-label]::before {
    content: attr(data-label);
    font-weight: 600;
    margin-right: 1rem;
    color: #333;
  }
}
</style>
