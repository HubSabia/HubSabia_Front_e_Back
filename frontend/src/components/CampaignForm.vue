<template>
  <form @submit.prevent="saveCampaign" class="campaign-form">
    <h3>{{ formTitle }}</h3>
    <div class="form-grid">
      <div class="form-group">
        <label for="campaignName">Nome da Campanha</label>
        <input type="text" id="campaignName" v-model="localCampaign.name" required>
      </div>
      <div class="form-group">
        <label for="campaignPeriod">Período (Ex: DD/MM/AAAA - DD/MM/AAAA)</label>
        <input type="text" id="campaignPeriod" v-model="localCampaign.period" required>
      </div>
      <div class="form-group full-width">
        <label for="campaignDescription">Descrição</label>
        <textarea id="campaignDescription" v-model="localCampaign.description" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label for="campaignStatus">Status</label>
        <select id="campaignStatus" v-model="localCampaign.status">
          <option>Planejada</option>
          <option>Ativa</option>
          <option>Concluída</option>
          <option>Cancelada</option>
        </select>
      </div>
      <div class="form-group">
        <label for="campaignAudience">Público-Alvo</label>
        <input type="text" id="campaignAudience" v-model="localCampaign.targetAudience">
      </div>
    </div>
    <div class="form-actions">
      <button type="button" @click="cancelForm" class="btn btn-secondary">Cancelar</button>
      <button type="submit" class="btn btn-primary">Salvar Campanha</button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  campaign: { // Can be null (new) or an object (editing)
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["save-campaign", "cancel-form"]);

// Use a local ref to avoid mutating the prop directly
const localCampaign = ref({});

// Watch for changes in the prop and update the local ref
watch(() => props.campaign, (newCampaign) => {
  localCampaign.value = newCampaign ? { ...newCampaign } : { id: null, name: 
'', description: 
'', period: 
'', status: 
'Planejada', targetAudience: 
'' };
}, { immediate: true, deep: true });

const formTitle = computed(() => {
  return localCampaign.value && localCampaign.value.id ? 'Editar Campanha' : 'Nova Campanha';
});

const saveCampaign = () => {
  // Basic validation could be added here
  emit("save-campaign", { ...localCampaign.value });
};

const cancelForm = () => {
  emit("cancel-form");
};
</script>

<style scoped>
.campaign-form {
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.campaign-form h3 {
  margin-bottom: 25px;
  color: #343a40;
  font-weight: 600;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 10px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Two columns */
  gap: 20px;
  margin-bottom: 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: span 2; /* Make description span both columns */
}

.form-group label {
  margin-bottom: 8px;
  color: #495057;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input[type="text"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1rem;
  background-color: #f8f9fa;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input[type="text"]:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  background-color: #fff;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #dee2e6;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.95rem;
  transition: background-color 0.2s, box-shadow 0.2s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr; /* Single column on smaller screens */
  }
  .form-group.full-width {
    grid-column: span 1;
  }
}
</style>
