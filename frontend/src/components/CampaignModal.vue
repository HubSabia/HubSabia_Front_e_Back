<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <header class="modal-header">
        <h3>{{ isEditMode ? 'Editar Campanha' : 'Criar Nova Campanha' }}</h3>
        <button class="close-btn" @click="closeModal">&times;</button>
      </header>
      
      <form @submit.prevent="handleSubmit" class="campaign-form">

        <div class="form-group">
          <label for="nome-campanha">Nome da Campanha</label>
          <input type="text" id="nome-campanha" v-model="formData.nome" required>
        </div>
        
        <div class="form-group full-width">
          <label for="descricao-campanha">Descrição</label>
          <textarea id="descricao-campanha" v-model="formData.descricao" rows="3"></textarea>
        </div>
        
        <div class="form-group-row">
          <div class="form-group">
            <label for="inicio-campanha">Data de Início</label>
            <input type="date" id="inicio-campanha" v-model="formData.periodo_inicio" required>
          </div>
          <div class="form-group">
            <label for="fim-campanha">Data de Fim</label>
            <input type="date" id="fim-campanha" v-model="formData.periodo_fim" required>
          </div>
        </div>
        
        <div class="form-group-row">
          <div class="form-group">
            <label for="publico-alvo-campanha">Público-Alvo</label>
            <input type="text" id="publico-alvo-campanha" v-model="formData.publico_alvo">
          </div>
          <div class="form-group">
            <label for="status-campanha">Status</label>
            <select id="status-campanha" v-model="formData.status">
              <option>Planejada</option>
              <option>Ativa</option>
              <option>Concluída</option>
              <option>Cancelada</option>
            </select>
          </div>
        </div>
        
        <fieldset class="form-group full-width">
          <legend>Associar Editais</legend>
          <div v-if="isLoadingEditais" class="loading-message">Carregando editais...</div>
          <div v-else-if="listaDeEditais.length > 0" class="edital-selector-list">
            <div v-for="edital in listaDeEditais" :key="edital._id" class="edital-checkbox-item">
              <input type="checkbox" :id="`edital-${edital._id}`" :value="edital._id" v-model="formData.editais">
              <label :for="`edital-${edital._id}`">{{ edital.titulo }}</label>
            </div>
          </div>
          <p v-else class="no-editals-message">Nenhum edital cadastrado.</p>
        </fieldset>
        
        <footer class="modal-footer">
          <button type="button" class="btn-secondary" @click="closeModal">Cancelar</button>
          <button type="submit" class="btn-primary" :disabled="isLoadingSubmit">
            {{ isLoadingSubmit ? 'Salvando...' : (isEditMode ? 'Atualizar Campanha' : 'Criar Campanha') }}
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

const props = defineProps({ modelValue: Boolean, campaignToEdit: Object });
const emit = defineEmits(['update:modelValue', 'campaign-created', 'campaign-updated']);

const formData = ref({});
const isEditMode = computed(() => !!props.campaignToEdit);
const listaDeEditais = ref([]);
const isLoadingEditais = ref(false);
const isLoadingSubmit = ref(false);
const toast = useToast();

const buscarEditaisDisponiveis = async () => {
  isLoadingEditais.value = true;
  try {
    const response = await apiClient.get('/editais');
    listaDeEditais.value = response.data;
  } catch (error) {
    toast.error("Não foi possível carregar os editais.");
  } finally {
    isLoadingEditais.value = false;
  }
};

const closeModal = () => { 
  emit('update:modelValue', false); 
};

const handleSubmit = async () => {
  isLoadingSubmit.value = true;
  try {
    if (isEditMode.value) {
      const response = await apiClient.put(`/campanhas/${props.campaignToEdit._id}`, formData.value);
      emit('campaign-updated', response.data);
      toast.success("Campanha atualizada com sucesso!");
    } else {
      const response = await apiClient.post('/campanhas', formData.value);
      emit('campaign-created', response.data);
      toast.success("Campanha criada com sucesso!");
    }
    closeModal();
  } catch (error) {
    toast.error(error.response?.data?.msg || 'Não foi possível salvar a campanha.');
  } finally {
    isLoadingSubmit.value = false;
  }
};

const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

watch(() => props.modelValue, (isOpening) => {
  if (isOpening) {
    buscarEditaisDisponiveis();
    if (isEditMode.value) {
      formData.value = {
        ...props.campaignToEdit,
        periodo_inicio: formatDateForInput(props.campaignToEdit.periodo_inicio),
        periodo_fim: formatDateForInput(props.campaignToEdit.periodo_fim),
        editais: props.campaignToEdit.editais?.map(e => e._id || e) || []
      };
    } else {
      formData.value = {
        nome: '',
        descricao: '',
        periodo_inicio: '',
        periodo_fim: '',
        publico_alvo: '',
        status: 'Planejada',
        editais: []
      };
    }
  }
});
</script>

<style scoped>
.image-preview {
  max-width: 200px;
  height: auto;
  margin-top: 1rem;
  border-radius: 8px;
  border: 1px solid #ddd;
}
.upload-status {
  font-size: 0.9rem;
  color: #007bff;
  margin-top: 0.5rem;
}
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