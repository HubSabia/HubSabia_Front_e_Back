<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <header class="modal-header">
        <h3>{{ isEditMode ? 'Editar Campanha' : 'Criar Nova Campanha' }}</h3>
        <button class="close-btn" @click="closeModal">&times;</button>
      </header>
      <form @submit.prevent="handleSubmit">
        <!-- Campos de Nome, Descrição, Datas, Status, Público-Alvo -->
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
        
        <!-- SEÇÃO PARA ASSOCIAR EDITAIS -->
        <div class="form-group">
          <label>Associar Editais</label>
          <div v-if="listaDeEditais.length > 0" class="edital-selector-list">
            <div v-for="edital in listaDeEditais" :key="edital._id" class="edital-checkbox-item">
              <input type="checkbox" :id="`edital-${edital._id}`" :value="edital._id" v-model="formData.editais">
              <label :for="`edital-${edital._id}`">{{ edital.titulo }}</label>
            </div>
          </div>
          <p v-else class="no-editals-message">Nenhum edital cadastrado. Vá para a página 'Editais' para criar um.</p>
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

// --- DEFINIÇÕES COMPLETAS ---
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
const listaDeEditais = ref([]);

// --- FUNÇÕES ---

const buscarEditaisDisponiveis = async () => {
  try {
    const response = await apiClient.get('/editais');
    listaDeEditais.value = response.data;
  } catch (error) {
    console.error("Não foi possível carregar a lista de editais:", error);
    listaDeEditais.value = []; // Garante que a lista fique vazia em caso de erro
  }
};

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
};

// --- WATCHER ---
// Observa a abertura do modal para preencher/limpar os dados
watch(() => props.modelValue, (isOpening) => {
  if (isOpening) {
    buscarEditaisDisponiveis();

    if (isEditMode.value) {
      // Preenche o formulário para edição
      formData.value = {
        ...props.campaignToEdit,
        periodo_inicio: formatDateForInput(props.campaignToEdit.periodo_inicio),
        periodo_fim: formatDateForInput(props.campaignToEdit.periodo_fim),
        // Garante que o campo 'editais' seja um array de IDs, se existir
        // Isso é importante para os checkboxes funcionarem corretamente
        editais: props.campaignToEdit.editais?.map(e => e._id || e) || []
      };
    } else {
      // Limpa o formulário para criação
      formData.value = {
        nome: '',
        descricao: '',
        periodo_inicio: '',
        periodo_fim: '',
        publico_alvo: '',
        status: 'Planejada',
        editais: [] // Começa com um array vazio de editais selecionados
      };
    }
  }
});
</script>

<style scoped>
/* Adicionando todos os estilos necessários */
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