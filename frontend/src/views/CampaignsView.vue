<template>
  <div class="campaigns-view">
    <div v-if="!showForm" class="campaign-list-view">
      <CampaignsTable
        :campaigns="campaigns"
        @edit-campaign="handleEditCampaign"
        @delete-campaign="handleDeleteCampaign"
        @add-campaign="handleAddCampaign"
      />
    </div>
    <div v-else class="campaign-form-view">
      <CampaignForm
        :campaign="editingCampaign"
        @save-campaign="handleSaveCampaign"
        @cancel-form="handleCancelForm"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { onMounted, getCurrentInstance } from 'vue';
import CampaignForm from '@/components/CampaignForm.vue';
import CampaignsTable from '@/components/CampaignsTable.vue';

const instance = getCurrentInstance();



const showForm = ref(false);
const editingCampaign = ref(null); // null for new, object for editing

// Sample data (simulated backend)
const campaigns = ref([]);

const handleAddCampaign = () => {
  editingCampaign.value = { id: null, name: '', description: '', period: '', status: 'Planejada', targetAudience: '' }; // Reset for new campaign
  showForm.value = true;
};

const handleEditCampaign = (campaignId) => {
  const campaignToEdit = campaigns.value.find(c => c.id === campaignId);
  if (campaignToEdit) {
    editingCampaign.value = { ...campaignToEdit }; // Create a copy to edit
    showForm.value = true;
  }
};

const handleSaveCampaign = (campaignData) => {
  if (campaignData.id) {
    // Update existing campaign
    const index = campaigns.value.findIndex(c => c.id === campaignData.id);
    if (index !== -1) {
      campaigns.value[index] = { ...campaignData };
    }
  } else {
    // Add new campaign (simulate ID generation)
    campaigns.value.push({ ...campaignData, id: Date.now() });
  }
  showForm.value = false;
  editingCampaign.value = null;
};

const handleDeleteCampaign = (campaignId) => {
  // Simulate deletion
  campaigns.value = campaigns.value.filter(c => c.id !== campaignId);
  // Add confirmation dialog in a real app
};

const handleCancelForm = () => {
  showForm.value = false;
  editingCampaign.value = null;
};

onMounted(() => {
  instance.emit("update-title", "Gerenciamento de Campanhas");
});

</script>

<style scoped>
.campaigns-view {
  padding: 20px;
}

.campaign-list-view {
  display: flex;
  flex-direction: column; /* Adjust as needed, maybe start with AddCard then Table */
  gap: 20px;
}

/* Add basic styling for form view if needed */
.campaign-form-view {
  /* Styles for when the form is visible */
  background-color: #f8f9fa; /* Lighter grey for form background */
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}
</style>