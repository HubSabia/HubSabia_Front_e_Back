<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <header class="modal-header">
        <h3>{{ isEditMode ? 'Editar Edital' : 'Adicionar Novo Edital' }}</h3>
        <button class="close-btn" @click="closeModal">×</button>
      </header>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="titulo">Nome do Edital</label>
          <input type="text" id="titulo" v-model="formData.titulo" required>
        </div>
        <div class="form-group">
          <label for="data_publicacao">Data de Publicação</label>
          <input type="date" id="data_publicacao" v-model="formData.data_publicacao">
        </div>
        <div class="form-group">
          <label for="conteudo">Conteúdo do Edital (colar aqui)</label>
          <textarea id="conteudo" v-model="formData.conteudo" rows="8" required></textarea>
        </div>
        <footer class="modal-footer">
          <button type="button" class="btn-secondary" @click="closeModal">Cancelar</button>
          <button type="submit" class="btn-primary">Salvar Edital</button>
        </footer>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import apiClient from '@/services/api';

const props = defineProps({
  modelValue: Boolean,
  editalToEdit: { type: Object, default: null }
});
const emit = defineEmits(['update:modelValue', 'edital-saved']);

const formData = ref({});
const isEditMode = computed(() => !!props.editalToEdit);

const closeModal = () => { emit('update:modelValue', false); };

const handleSubmit = async () => {
  try {
    let response;
    if (isEditMode.value) {
      // (A lógica de PUT pode ser adicionada depois, se necessário)
      response = await apiClient.put(`/editais/${props.editalToEdit._id}`, formData.value);
    } else {
      response = await apiClient.post('/editais', formData.value);
    }
    emit('edital-saved', response.data);
    alert('Edital salvo com sucesso!');
    closeModal();
  } catch (error) {
    console.error("Erro ao salvar edital:", error);
    alert(`Erro: ${error.response?.data?.msg || 'Não foi possível salvar o edital.'}`);
  }
};

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
}

watch(() => props.modelValue, (isOpening) => {
  if (isOpening) {
    if (isEditMode.value) {
      formData.value = {
        ...props.editalToEdit,
        data_publicacao: formatDateForInput(props.editalToEdit.data_publicacao),
      };
    } else {
      formData.value = {
        titulo: '',
        conteudo: '',
        data_publicacao: ''
      };
    }
  }
});
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