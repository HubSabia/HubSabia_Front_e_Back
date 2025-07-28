<template>
  <div class="add-card" @click="emitAddCampaign">
    <span class="add-card-plus">+</span>
  </div>
</template>

<script setup>
const emit = defineEmits(["add-campaign"]);

const emitAddCampaign = () => {
  emit("add-campaign");
};
</script>

<style scoped>
/* Reusing styles similar to the original HTML/CSS */
.add-card {
  background-color: #e0e0e0; /* Adjusted grey */
  border-radius: 10px;
  width: 150px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s, box-shadow 0.3s;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 2px dashed #bdbdbd;
}

.add-card:hover {
  background-color: #d1d1d1;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.add-card-plus {
  font-size: 3.5rem;
  color: #757575;
  font-weight: lighter;
}
</style>
