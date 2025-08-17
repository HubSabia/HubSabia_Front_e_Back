<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <header class="modal-header">
        <h3>{{ isEditMode ? 'Editar Campanha' : 'Criar Nova Campanha' }}</h3>
        <button class="close-btn" @click="closeModal">×</button>
      </header>
      <form @submit.prevent="handleSubmit">
        <!-- ... (campos de nome, descrição, datas, etc. continuam aqui) ... -->
        
        <!-- MUDANÇA: Adicionamos a seção para associar editais -->
        <div class="form-group">
          <label>Associar Editais</label>
          <div v-if="listaDeEditais.length > 0" class="edital-selector-list">
            <div v-for="edital in listaDeEditais" :key="edital._id" class="edital-checkbox-item">
              <input 
                type="checkbox" 
                :id="`edital-${edital._id}`" 
                :value="edital._id"
                v-model="formData.editais"
              >
              <label :for="`edital-${edital._id}`">{{ edital.titulo }}</label>
            </div>
          </div>
          <p v-else class="no-editals-message">Nenhum edital cadastrado. Crie um na página de 'Editais' primeiro.</p>
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
import { ref, watch, computed, onMounted } from 'vue'; // Adicionamos onMounted
import apiClient from '@/services/api';

const props = defineProps({ /* ... (igual a antes) ... */ });
const emit = defineEmits(['update:modelValue', 'campaign-created', 'campaign-updated']);
const formData = ref({});
const isEditMode = computed(() => !!props.campaignToEdit);

// MUDANÇA: Nova variável para guardar a lista de editais disponíveis
const listaDeEditais = ref([]);

// MUDANÇA: Função para buscar a lista de todos os editais do usuário
const buscarEditaisDisponiveis = async () => {
  try {
    const response = await apiClient.get('/editais');
    listaDeEditais.value = response.data;
  } catch (error) {
    console.error("Não foi possível carregar a lista de editais:", error);
  }
};

const closeModal = () => { /* ... (igual a antes) ... */ };
const handleSubmit = async () => { /* ... (igual a antes) ... */ };
const formatDateForInput = (dateString) => { /* ... (igual a antes) ... */ };

watch(() => props.modelValue, (isOpening) => {
  if (isOpening) {
    // Quando o modal abre, busca a lista de editais disponíveis
    buscarEditaisDisponiveis();

    if (isEditMode.value) {
      formData.value = {
        ...props.campaignToEdit,
        periodo_inicio: formatDateForInput(props.campaignToAEdit.periodo_inicio),
        periodo_fim: formatDateForInput(props.campaignToEdit.periodo_fim),
        // Garante que o campo 'editais' seja um array de IDs, se existir
        editais: props.campaignToEdit.editais?.map(e => e._id || e) || []
      };
    } else {
      formData.value = {
        nome: '',
        descricao: '',
        // ... (outros campos)
        editais: [] // Começa com um array vazio de editais selecionados
      };
    }
  }
});
</script>

<style scoped>
/* Adicionando estilos para a lista de checkboxes */
.edital-selector-list {
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 0.5rem;
}
.edital-checkbox-item {
  display: flex;
  align-items: center;
  padding: 0.25rem;
}
.edital-checkbox-item input {
  margin-right: 0.5rem;
  width: auto; /* Reseta a largura do input para o padrão */
}
.no-editals-message {
  font-size: 0.9rem;
  color: #6c757d;
  padding: 0.5rem;
}
/* O resto do seu CSS continua igual */
</style>