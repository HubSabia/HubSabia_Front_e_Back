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
            <!-- MUDANÇA: Vamos usar o ConfirmModal para a exclusão -->
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

    <!-- Modal de confirmação -->
    <ConfirmModal
      :isVisible="isConfirmModalVisible"
      title="Confirmar Exclusão"
      message="Você tem certeza que deseja excluir este edital? Esta ação não pode ser desfeita."
      @confirm="executeDelete"
      @cancel="closeConfirmModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';
import EditalModal from '@/components/EditalModal.vue';
// MUDANÇA 1: Importa o toast e o modal de confirmação
import { useToast } from "vue-toastification";
import ConfirmModal from '@/components/ConfirmModal.vue';

const editais = ref([]);
const isModalVisible = ref(false);
const editalParaEditar = ref(null);
const isLoading = ref(true);

// MUDANÇA 2: Variáveis para o modal de confirmação
const isConfirmModalVisible = ref(false);
const itemToDeleteId = ref(null);

// MUDANÇA 3: Instancia o toast
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

// MUDANÇA 4: A lógica de exclusão agora usa o modal de confirmação
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
/* Os estilos são praticamente idênticos aos do CampaignModal, então podemos reutilizá-los */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background-color: white; padding: 1.5rem 2rem; border-radius: 8px; width: 100%; max-width: 500px; box-shadow: 0 5px 25px rgba(0,0,0,0.2); }
.modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e9ecef; padding-bottom: 1rem; margin-bottom: 1.5rem; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6c757d; }
.form-group { margin-bottom: 1rem; }
.form-group-row { display: flex; gap: 1rem; }
.form-group-row > .form-group { flex: 1; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
.form-group input { width: 100%; padding: 0.75rem; border: 1px solid #ced4da; border-radius: 4px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; margin-top: 1.5rem; border-top: 1px solid #e9ecef; }
.btn-primary, .btn-secondary { padding: 0.6rem 1.2rem; border-radius: 4px; border: none; cursor: pointer; font-weight: 500; }
.btn-primary { background-color: #007bff; color: white; }
.btn-secondary { background-color: #6c757d; color: white; }

@media (max-width: 767px) {
  .modal-content {
    /* Faz o modal ocupar quase toda a tela */
    width: 95vw; /* 95% da largura da tela */
    height: 90vh; /* 90% da altura da tela */
    max-width: none; /* Remove qualquer limite de largura máxima */
    
    padding: 1.5rem 1rem; /* Reduz o padding interno */
    
    /* Adiciona scroll se o conteúdo for muito grande */
    display: flex;
    flex-direction: column;
    overflow: hidden; /* Controla o scroll no container do formulário */
  }

  /* Faz o formulário ser a área de scroll, não o modal inteiro */
  .modal-content form {
    overflow-y: auto;
    flex-grow: 1;
    padding-right: 10px; /* Espaço para a barra de rolagem */
  }

  /* Empilha os campos que ficavam lado a lado */
  .form-group-row {
    flex-direction: column;
    gap: 1rem;
  }

  .modal-footer {
    margin-top: 1.5rem;
  }
}
</style>