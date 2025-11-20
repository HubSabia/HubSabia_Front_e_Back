<template>
  <div class="campaigns-view">
    <header class="view-header">
      <h1>Gestão de Campanhas</h1>
      <button @click="abrirModalParaCriar" class="btn-add">Adicionar Campanha</button>
    </header>

    <div v-if="loading" class="status-message">Carregando campanhas...</div>
    <div v-else-if="!campanhas.length" class="status-message">
      <p>Nenhuma campanha encontrada. Clique em "Adicionar Campanha" para começar.</p>
    </div>

    <!-- Tabela de Campanhas -->
    <table v-else class="campaigns-table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Período</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="campanha in campanhas" :key="campanha._id">
          <td>{{ campanha.nome }}</td>
          <td>{{ formatarData(campanha.periodo_inicio) }} - {{ formatarData(campanha.periodo_fim) }}</td>
          <td><span :class="['status-badge', campanha.status.toLowerCase()]">{{ campanha.status }}</span></td>
          <td class="actions-cell">
            <button @click="abrirModalParaEditar(campanha)" class="btn-edit">Editar</button>
            <button @click="pedirConfirmacaoExclusao(campanha)" class="btn-delete">Excluir</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- O Modal (CORREÇÃO AQUI) -->
    <CampaignModal 
      v-model="showModal"
      :campaign-to-edit="campanhaSelecionada"
      @campaign-created="adicionarCampanhaNaLista"
      @campaign-updated="atualizarCampanhaNaLista"
    />

    <!-- Modal de Confirmação para Exclusão -->
    <ConfirmModal 
      :isVisible="showConfirmModal"
      title="Confirmar Exclusão"
      message="Você tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita."
      @confirm="confirmarExclusao"
      @cancel="showConfirmModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';
import { useToast } from 'vue-toastification';

// Importa os componentes de modal
import CampaignModal from '@/components/CampaignModal.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';

const campanhas = ref([]);
const loading = ref(true);
const toast = useToast();

// --- ESTADO PARA CONTROLE DOS MODAIS ---
const showModal = ref(false);
const campanhaSelecionada = ref(null);
const showConfirmModal = ref(false);
const campanhaParaExcluir = ref(null);

// --- FUNÇÕES DE API ---
const buscarCampanhas = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get('/campanhas');
    campanhas.value = response.data;
  } catch (error) {
    console.error('Erro ao buscar campanhas:', error);
    toast.error('Erro ao buscar campanhas.');
  } finally {
    loading.value = false;
  }
};

onMounted(buscarCampanhas);

// --- FUNÇÕES DE CONTROLE DO MODAL DE CAMPANHA ---
const abrirModalParaCriar = () => {
  campanhaSelecionada.value = null;
  showModal.value = true;
};

const abrirModalParaEditar = (campanha) => {
  campanhaSelecionada.value = campanha;
  showModal.value = true;
};

// --- FUNÇÕES DE CALLBACK DO MODAL ---
const adicionarCampanhaNaLista = (novaCampanha) => {
  campanhas.value.unshift(novaCampanha);
  toast.success('Campanha criada com sucesso!');
};

const atualizarCampanhaNaLista = (campanhaAtualizada) => {
  const index = campanhas.value.findIndex(c => c._id === campanhaAtualizada._id);
  if (index !== -1) {
    campanhas.value[index] = campanhaAtualizada;
  }
  toast.success('Campanha atualizada com sucesso!');
};

// --- FUNÇÕES DE EXCLUSÃO ---
const pedirConfirmacaoExclusao = (campanha) => {
  campanhaParaExcluir.value = campanha;
  showConfirmModal.value = true;
};

const confirmarExclusao = async () => {
  try {
    await apiClient.delete(`/campanhas/${campanhaParaExcluir.value._id}`);
    campanhas.value = campanhas.value.filter(c => c._id !== campanhaParaExcluir.value._id);
    toast.success('Campanha excluída com sucesso!');
  } catch (error) {
    console.error('Erro ao excluir campanha:', error);
    toast.error('Erro ao excluir campanha.');
  } finally {
    showConfirmModal.value = false;
    campanhaParaExcluir.value = null;
  }
};

// --- FUNÇÕES UTILITÁRIAS ---
const formatarData = (dataString) => {
  if (!dataString) return '';
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Date(dataString).toLocaleDateString('pt-BR', options);
};
</script>

<style scoped>
.campaigns-view {
  padding: 2rem;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.view-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
}

.btn-add {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-add:hover {
  background-color: #218838;
}

.status-message {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.campaigns-table {
  width: 100%;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border-collapse: collapse;
  overflow: hidden;
}

.campaigns-table th,
.campaigns-table td {
  padding: 1rem;
  border-bottom: 1px solid #ddd;
  text-align: left;
}

.campaigns-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  font-size: 0.8rem;
}

.campaigns-table tbody tr:hover {
  background-color: #f8f9fa;
}

.campaigns-table tbody tr:last-child td {
  border-bottom: none;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-delete {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.85rem;
  transition: opacity 0.2s;
}

.btn-edit {
  background-color: #007bff;
  color: white;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
}

.btn-edit:hover,
.btn-delete:hover {
  opacity: 0.85;
}

.status-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.ativa {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.planejada {
  background-color: #cce5ff;
  color: #004085;
}

.status-badge.concluída {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-badge.cancelada {
  background-color: #f8d7da;
  color: #721c24;
}

@media (max-width: 767px) {
  .campaigns-view {
    padding: 1rem;
  }

  .view-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .campaigns-table {
    font-size: 0.9rem;
  }

  .campaigns-table th,
  .campaigns-table td {
    padding: 0.75rem;
  }

  .actions-cell {
    flex-direction: column;
  }

  .btn-edit,
  .btn-delete {
    width: 100%;
  }
}
</style>