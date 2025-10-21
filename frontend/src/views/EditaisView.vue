<template>
  <div class="view-container">
    <header class="view-header">
      <h2>Biblioteca de Editais</h2>
      <button class="btn-primary" @click="handleCriar">Adicionar Novo Edital</button>
    </header>

    <div class="list-container">
      <div class="list-header">
        <span>Informações do Edital</span>
        <span>Ações</span>
      </div>
      <div class="item-list">
        <div v-if="isLoading" class="message">Carregando editais...</div>
        <div v-if="!isLoading && editais.length === 0" class="message">
          Nenhum edital encontrado. Clique em "Adicionar" para criar o primeiro.
        </div>
        <div v-for="edital in editais" :key="edital._id" class="item-card">
          <div class="item-info">
            <span class="item-name">{{ edital.titulo }}</span>
            <span class="item-description">{{ edital.conteudo }}</span>
          </div>
          <div class="item-actions">
            <button class="btn-edit" @click="handleEditar(edital)">Editar</button>
            <!-- MUDANÇA: O clique agora chama 'confirmarExclusao' -->
            <button class="btn-delete" @click="confirmarExclusao(edital._id)">Excluir</button>
          </div>
        </div>
      </div>
    </div>

    <EditalModal
      v-model="isModalVisible"
      :edital-to-edit="editalParaEditar"
      @edital-created="adicionarNovoEditalNaLista"
      @edital-updated="atualizarEditalNaLista"
    />

    <!-- MUDANÇA: Modal de confirmação adicionado -->
    <ConfirmModal
      :isVisible="isConfirmModalVisible"
      title="Confirmar Exclusão"
      message="Você tem certeza que deseja excluir este edital da biblioteca? Ele pode estar em uso por campanhas."
      @confirm="executeDelete"
      @cancel="closeConfirmModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';
import EditalModal from '@/components/EditalModal.vue';
// MUDANÇA: Importa o toast e o modal de confirmação
import { useToast } from "vue-toastification";
import ConfirmModal from '@/components/ConfirmModal.vue';

const editais = ref([]);
const isModalVisible = ref(false);
const editalParaEditar = ref(null);
const isLoading = ref(true);

// MUDANÇA: Variáveis para o modal de confirmação
const isConfirmModalVisible = ref(false);
const itemToDeleteId = ref(null);

// MUDANÇA: Instancia o toast
const toast = useToast();

const buscarEditais = async () => {
  isLoading.value = true;
  try {
    const response = await apiClient.get('/editais');
    editais.value = response.data;
  } catch (error) {
    console.error("Erro ao buscar editais:", error);
    toast.error("Não foi possível carregar os editais.");
  } finally {
    isLoading.value = false;
  }
};

const adicionarNovoEditalNaLista = (novoEdital) => { 
  editais.value.unshift(novoEdital);
  toast.success(`Edital "${novoEdital.titulo}" criado com sucesso!`);
};

const atualizarEditalNaLista = (editalAtualizado) => { 
  const index = editais.value.findIndex(e => e._id === editalAtualizado._id); 
  if (index !== -1) { editais.value[index] = editalAtualizado; }
  toast.success(`Edital "${editalAtualizado.titulo}" atualizado com sucesso!`);
};

const handleCriar = () => { editalParaEditar.value = null; isModalVisible.value = true; };
const handleEditar = (edital) => { editalParaEditar.value = edital; isModalVisible.value = true; };

// MUDANÇA: 'handleExcluir' foi dividido em 'confirmar' e 'executar'
const confirmarExclusao = (editalId) => {
  itemToDeleteId.value = editalId;
  isConfirmModalVisible.value = true;
};

const executeDelete = async () => {
  closeConfirmModal();
  try {
    await apiClient.delete(`/editais/${itemToDeleteId.value}`);
    editais.value = editais.value.filter(e => e._id !== itemToDeleteId.value);
    toast.success('Edital excluído com sucesso!');
  } catch (error) {
    console.error('Erro ao excluir edital:', error);
    toast.error(error.response?.data?.msg || 'Não foi possível excluir o edital.');
  }
};

const closeConfirmModal = () => {
  isConfirmModalVisible.value = false;
  itemToDeleteId.value = null;
};

onMounted(buscarEditais);
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
  background-color: #28a745;
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

.list-container {
  /* MUDANÇA: Removido o tamanho fixo para ser responsivo */
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.list-header {
  display: flex;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  font-size: 0.8rem;
  border-bottom: 1px solid #dee2e6;
}

.item-card {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  transition: background-color 0.2s;
}

.item-card:last-child {
  border-bottom: none;
}

.item-card:hover {
  background-color: #f8f9fa;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow: hidden;
}

.item-name {
  font-weight: 600;
  color: #343a40;
  font-size: 1.1rem;
}

.item-description {
  font-size: 0.9rem;
  color: #6c757d;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
}

.item-actions button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  color: white;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.85rem;
  transition: opacity 0.2s;
}

.item-actions button:hover {
  opacity: 0.85;
}

.btn-edit { background-color: #0d6efd; }
.btn-delete { background-color: #dc3545; }

.message {
  padding: 2rem;
  text-align: center;
  color: #6c757d;
  font-style: italic;
}

@media (max-width: 767px) {
  .view-container {
    padding: 1rem;
  }
  .view-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .list-header {
    display: none; /* Esconde o cabeçalho em telas pequenas */
  }
  .item-card {
    grid-template-columns: 1fr; /* Muda para uma única coluna */
    gap: 1rem; /* Aumenta o espaçamento vertical */
  }
  .item-actions {
    justify-content: flex-start; /* Alinha os botões à esquerda */
  }
}
</style>