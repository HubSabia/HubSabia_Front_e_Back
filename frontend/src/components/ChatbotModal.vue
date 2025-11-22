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
              <option v-if="isLoadingCampanhas" disabled value="">Carregando campanhas...</option>
              <option v-else disabled value="">Selecione uma campanha</option>
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

        
        <div class="form-group">
          <label for="apiKey">Chave de API do Google AI (Gemini)</label>
          <input 
            type="password" 
            id="apiKey" 
            v-model="formData.geminiApiKey" 
            placeholder="Cole sua chave de API aqui (opcional)"
          >
          <small class="help-text">
            Se não informada, será usada a chave do seu perfil. 
            Configure uma chave específica para este chatbot caso necessário.
          </small>
        </div>
        
        <footer class="modal-footer">
          <button type="button" class="btn-secondary" @click="closeModal">Cancelar</button>
          <button type="submit" class="btn-primary" :disabled="isLoadingSubmit">
            {{ isLoadingSubmit ? 'Salvando...' : 'Salvar Chatbot' }}
          </button>
        </footer>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import apiClient from '@/services/api';
import { useToast } from "vue-toastification";

const props = defineProps({
  modelValue: Boolean,
  chatbotToEdit: { type: Object, default: null }
});
const emit = defineEmits(['update:modelValue', 'chatbot-created', 'chatbot-updated']);

const formData = ref({});
const campanhas = ref([]);
const isEditMode = computed(() => !!props.chatbotToEdit);
const isLoadingCampanhas = ref(false);
const isLoadingSubmit = ref(false);
const toast = useToast();

const fetchCampanhas = async () => {
  isLoadingCampanhas.value = true;
  try {
    const response = await apiClient.get('/campanhas');
    campanhas.value = response.data;
  } catch (error) {
    console.error("Erro ao buscar campanhas:", error);
    toast.error("Não foi possível carregar a lista de campanhas.");
  } finally {
    isLoadingCampanhas.value = false;
  }
};

const closeModal = () => emit('update:modelValue', false);

const handleSubmit = async () => {
  isLoadingSubmit.value = true;
  try {
    if (isEditMode.value) {
      const response = await apiClient.put(`/chatbots/${props.chatbotToEdit._id}`, formData.value);
      emit('chatbot-updated', response.data);
      toast.success('Chatbot atualizado com sucesso!');
    } else {
      const response = await apiClient.post('/chatbots', formData.value);
      emit('chatbot-created', response.data);
      toast.success('Chatbot criado com sucesso!');
    }
    closeModal();
  } catch (error) {
    console.error("Erro ao salvar chatbot:", error);
    toast.error(error.response?.data?.msg || 'Não foi possível salvar o chatbot.');
  } finally {
    isLoadingSubmit.value = false;
  }
};

watch(() => props.modelValue, (isOpening) => {
  if (isOpening) {
    fetchCampanhas();
    if (isEditMode.value) {
      formData.value = {
        nome: props.chatbotToEdit.nome,
        status: props.chatbotToEdit.status,
        campanha: props.chatbotToEdit.campanha._id,
        geminiApiKey: props.chatbotToEdit.geminiApiKey || ''
      };
    } else {
      formData.value = { 
        nome: '', 
        status: 'Inativo', 
        campanha: '',
        geminiApiKey: ''
      };
    }
  }
});
</script>

<style scoped>
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background-color: white; padding: 1.5rem 2rem; border-radius: 8px; width: 100%; max-width: 600px; box-shadow: 0 5px 25px rgba(0,0,0,0.2); max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e9ecef; padding-bottom: 1rem; margin-bottom: 1.5rem; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6c757d; }
.form-group { margin-bottom: 1rem; }
.form-group-row { display: flex; gap: 1rem; }
.form-group-row > .form-group { flex: 1; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
.form-group input, .form-group textarea, .form-group select { width: 100%; padding: 0.75rem; border: 1px solid #ced4da; border-radius: 4px; font-family: inherit; font-size: inherit; }
.help-text { display: block; margin-top: 0.5rem; font-size: 0.85rem; color: #6c757d; line-height: 1.4; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; margin-top: 1.5rem; border-top: 1px solid #e9ecef; }
.btn-primary, .btn-secondary { padding: 0.6rem 1.2rem; border-radius: 4px; border: none; cursor: pointer; font-weight: 500; }
.btn-primary { background-color: #007bff; color: white; }
.btn-secondary { background-color: #6c757d; color: white; }

@media (max-width: 767px) {
  .modal-content { width: 95vw; height: 90vh; max-width: none; padding: 1.5rem 1rem; display: flex; flex-direction: column; overflow: hidden; }
  .modal-content form { overflow-y: auto; flex-grow: 1; padding-right: 10px; }
  .form-group-row { flex-direction: column; gap: 1rem; }
  .modal-footer { margin-top: 1.5rem; }
}
</style>