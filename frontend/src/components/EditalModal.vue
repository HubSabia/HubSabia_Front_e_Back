<template>
  <!-- A estrutura do modal é a mesma, controlada pelo v-model -->
  <div v-if="modelValue" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <header class="modal-header">
        <!-- O título é dinâmico, dependendo do modo de edição ou criação -->
        <h3>{{ isEditMode ? 'Editar Edital' : 'Adicionar Novo Edital' }}</h3>
        <button class="close-btn" @click="closeModal">×</button>
      </header>
      <form @submit.prevent="handleSubmit">
        <!-- O formulário agora reflete os campos do modelo Edital.js -->
        <div class="form-group">
          <label for="titulo">Título do Edital</label>
          <input type="text" id="titulo" v-model="formData.titulo" required>
        </div>
        
        <div class="form-group-row">
          <div class="form-group">
            <label for="numero">Número (Ex: 01/2025)</label>
            <input type="text" id="numero" v-model="formData.numero">
          </div>
          <div class="form-group">
            <label for="data_publicacao">Data de Publicação</label>
            <input type="date" id="data_publicacao" v-model="formData.data_publicacao">
          </div>
        </div>

        <div class="form-group">
          <label for="orgao_publicador">Órgão Publicador</label>
          <input type="text" id="orgao_publicador" v-model="formData.orgao_publicador">
        </div>

        <div class="form-group">
          <label for="link_documento">Link para o Documento (URL)</label>
          <input type="url" id="link_documento" v-model="formData.link_documento" placeholder="https://...">
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

// As props são as mesmas: uma para o v-model e outra para receber o edital a ser editado
const props = defineProps({
  modelValue: Boolean,
  editalToEdit: {
    type: Object,
    default: null
  }
});

// O evento agora é unificado: 'edital-saved'
const emit = defineEmits(['update:modelValue', 'edital-saved']);

const formData = ref({});
const isEditMode = computed(() => !!props.editalToEdit);

const closeModal = () => {
  emit('update:modelValue', false);
};

// A lógica de envio agora usa os endpoints de /api/editais
const handleSubmit = async () => {
  try {
    let response;
    if (isEditMode.value) {
      // MODO EDIÇÃO: Chama a rota PUT
      response = await apiClient.put(`/editais/${props.editalToEdit._id}`, formData.value);
    } else {
      // MODO CRIAÇÃO: Chama a rota POST
      response = await apiClient.post('/editais', formData.value);
    }
    // Emite o evento unificado com os dados salvos
    emit('edital-saved', response.data);
    alert('Edital salvo com sucesso!');
    closeModal();
  } catch (error) {
    console.error("Erro ao salvar edital:", error);
    alert(`Erro: ${error.response?.data?.msg || 'Não foi possível salvar o edital.'}`);
  }
};

// Função helper para formatar a data para o input
const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
}

// O watch agora preenche ou limpa o formulário de editais
watch(() => props.modelValue, (isOpening) => {
  if (isOpening) {
    if (isEditMode.value) {
      // Preenche o formulário com os dados do edital a ser editado
      formData.value = {
        ...props.editalToEdit,
        data_publicacao: formatDateForInput(props.editalToEdit.data_publicacao),
      };
    } else {
      // Limpa o formulário para criar um novo edital
      formData.value = {
        titulo: '',
        numero: '',
        orgao_publicador: '',
        link_documento: '',
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
</style>