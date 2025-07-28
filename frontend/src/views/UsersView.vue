<template>
  <div class="view-placeholder">
    <h2 class="view-title">Gestão de Usuários</h2>
    <p>Conteúdo da gestão de usuários aparecerá aqui.</p>
     <div class="content-card">
        <p>Funcionalidade ainda não implementada.</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, getCurrentInstance } from 'vue';

const instance = getCurrentInstance();

onMounted(() => {
  instance.emit("update-title", "Usuários");
});
</script>

<style scoped>
/* Reuse styles from DashboardView or create specific ones */
.view-placeholder {
  padding: 20px;
}
.view-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #343a40;
  margin-bottom: 5px;
}
.content-card {
  background-color: var(--card-bg, #ffffff);
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  margin-top: 20px;
}
</style>
