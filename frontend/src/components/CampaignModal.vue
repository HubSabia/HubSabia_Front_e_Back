<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <header class="modal-header">
        <h3>{{ isEditMode ? 'Editar Campanha' : 'Criar Nova Campanha' }}</h3>
        <button class="close-btn" @click="closeModal">×</button>
      </header>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="nome">Nome da Campanha</label>
          <input type="text" id="nome" v-model="formData.nome" required>
        </div>
        
        <div class="form-group">
          <label for="descricao">Descrição</label>
          <textarea id="descricao" v-model="formData.descricao" rows="3"></textarea>
        </div>

        <div class="form-group-row">
          <div class="form-group">
            <label for="periodo_inicio">Data de Início</label>
            <input type="date" id="periodo_inicio" v-model="formData.periodo_inicio" required>
          </div>
          <div class="form-group">
            <label for="periodo_fim">Data de Fim</label>
            <input type="date" id="periodo_fim" v-model="formData.periodo_fim" required>
          </div>
        </div>
        <div class="form-group-row">
          <div class="form-group">
            <label for="publico_alvo">Público-Alvo</label>
            <input type="text" id="publico_alvo" v-model="formData.publico_alvo">
          </div>
          
          <div class="form-group">
            <label for="status">Status</label>
            <select id="status" v-model="formData.status">
              <option>Planejada</option>
              <option>Ativa</option>
              <option>Concluída</option>
              <option>Cancelada</option>
            </select>
          </div>
        </div>
        <footer class="modal-footer">
          <button type="button" class="btn-secondary" @click="closeModal">Cancelar</button>
          <button type="submit" class="btn-primary">Salvar Campanha</button>
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
  campaignToEdit: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'campaign-created', 'campaign-updated']);

const formData = ref({});

const isEditMode = computed(() => !!props.campaignToEdit);

const closeModal = () => {
  emit('update:modelValue', false);
};

const handleSubmit = async () => {
  try {
    if (isEditMode.value) {
      const response = await apiClient.put(`/campanhas/${props.campaignToEdit._id}`, formData.value);
      emit('campaign-updated', response.data);
    } else {
      const response = await apiClient.post('/campanhas', formData.value);
      emit('campaign-created', response.data);
    }
    alert('Campanha salva com sucesso!');
    closeModal();
  } catch (error) {
    console.error("Erro ao salvar campanha:", error);
    alert(`Erro: ${error.response?.data?.msg || 'Não foi possível salvar a campanha.'}`);
  }
};

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

watch(() => props.modelValue, (isOpening) => {
  if (isOpening) {
    if (isEditMode.value) {
      formData.value = {
        ...props.campaignToEdit,
        periodo_inicio: formatDateForInput(props.campaignToEdit.periodo_inicio),
        periodo_fim: formatDateForInput(props.campaignToEdit.periodo_fim)
      };
    } else {
      formData.value = {
        nome: '',
        descricao: '',
        periodo_inicio: '',
        periodo_fim: '',
        publico_alvo: '',
        status: 'Planejada'
      };
    }
  }
});
</script>

<style scoped>
.form-group textarea, .form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background-color: white;
  font-family: inherit;
  font-size: inherit; 
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background-color: white;
  padding: 1.5rem 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 5px 25px rgba(0,0,0,0.2);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
}
.form-group { margin-bottom: 1rem; }
.form-group-row { display: flex; gap: 1rem; }
.form-group-row > .form-group {
    flex: 1; 
}
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
.form-group input { width: 100%; padding: 0.75rem; border: 1px solid #ced4da; border-radius: 4px; }
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  margin-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}
.btn-primary, .btn-secondary { padding: 0.6rem 1.2rem; border-radius: 4px; border: none; cursor: pointer; font-weight: 500; }
.btn-primary { background-color: #007bff; color: white; }
.btn-secondary { background-color: #6c757d; color: white; }
</style>