<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <header class="modal-header">
        <h3>{{ isEditMode ? 'Editar Chatbot' : 'Criar Novo Chatbot' }}</h3>
        <button class="close-btn" @click="closeModal">&times;</button>
      </header>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="nome">Nome do Chatbot</label>
          <input type="text" id="nome" v-model="formData.nome" required>
        </div>
        <div class="form-group-row">
          <div class="form-group">
            <label for="campanha">Associar à Campanha</label>
            <select id="campanha" v-model="formData.campanha" required>
              <option disabled value="">Selecione uma campanha</option>
              <option v-for="c in campanhas" :key="c._id" :value="c._id">{{ c.nome }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="status">Status</label>
            <select id="status" v-model="formData.status">
              <option>Ativo</option>
              <option>Inativo</option>
              <option>Em Manutenção</option>
            </select>
          </div>
        </div>
        <footer class="modal-footer">
          <button type="button" class="btn-secondary" @click="closeModal">Cancelar</button>
          <button type="submit" class="btn-primary">Salvar Chatbot</button>
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
  chatbotToEdit: { type: Object, default: null }
});
const emit = defineEmits(['update:modelValue', 'chatbot-created', 'chatbot-updated']);

const formData = ref({});
const campanhas = ref([]);
const isEditMode = computed(() => !!props.chatbotToEdit);

const fetchCampanhas = async () => {
  try {
    const response = await apiClient.get('/campanhas');
    campanhas.value = response.data;
  } catch (error) { console.error("Erro ao buscar campanhas:", error); }
};

const closeModal = () => emit('update:modelValue', false);

const handleSubmit = async () => {
  try {
    if (isEditMode.value) {
      const response = await apiClient.put(`/chatbots/${props.chatbotToEdit._id}`, formData.value);
      emit('chatbot-updated', response.data);
    } else {
      const response = await apiClient.post('/chatbots', formData.value);
      emit('chatbot-created', response.data);
    }
    alert('Chatbot salvo com sucesso!');
    closeModal();
  } catch (error) {
    console.error("Erro ao salvar chatbot:", error);
    alert(`Erro: ${error.response?.data?.msg || 'Não foi possível salvar o chatbot.'}`);
  }
};

watch(() => props.modelValue, (isOpening) => {
  if (isOpening) {
    fetchCampanhas();
    if (isEditMode.value) {
      formData.value = {
        nome: props.chatbotToEdit.nome,
        status: props.chatbotToEdit.status,
        campanha: props.chatbotToEdit.campanha._id
      };
    } else {
      formData.value = { nome: '', status: 'Inativo', campanha: '' };
    }
  }
});
</script>

<style scoped>
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background-color: white; padding: 1.5rem 2rem; border-radius: 8px; width: 100%; max-width: 600px; box-shadow: 0 5px 25px rgba(0,0,0,0.2); }
.modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e9ecef; padding-bottom: 1rem; margin-bottom: 1.5rem; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6c757d; }
.form-group { margin-bottom: 1rem; }
.form-group-row { display: flex; gap: 1rem; }
.form-group-row > .form-group { flex: 1; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
.form-group input, .form-group textarea, .form-group select { width: 100%; padding: 0.75rem; border: 1px solid #ced4da; border-radius: 4px; font-family: inherit; font-size: inherit; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; margin-top: 1.5rem; border-top: 1px solid #e9ecef; }
.btn-primary, .btn-secondary { padding: 0.6rem 1.2rem; border-radius: 4px; border: none; cursor: pointer; font-weight: 500; }
.btn-primary { background-color: #007bff; color: white; }
.btn-secondary { background-color: #6c757d; color: white; }
.edital-selector-list { max-height: 150px; overflow-y: auto; border: 1px solid #ced4da; border-radius: 4px; padding: 0.5rem; }
.edital-checkbox-item { display: flex; align-items: center; padding: 0.25rem; }
.edital-checkbox-item input { margin-right: 0.5rem; width: auto; }
.no-editals-message { font-size: 0.9rem; color: #6c757d; padding: 0.5rem; background-color: #f8f9fa; border-radius: 4px; text-align: center; }

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