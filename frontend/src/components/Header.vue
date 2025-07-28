<template>
  <header class="header">
    <div class="header-title">{{ pageTitle }}</div>
    <div class="user-info">
      <!-- Placeholder for user info/avatar -->
      <span class="user-name">Admin User</span>
      <div class="user-avatar">A</div>
    </div>
  </header>
</template>

<script setup>
const props = defineProps({
  pageTitle: {
    type: String,
    default: 'Dashboard',
  },
});
</script>

<style scoped>
.header {
  height: 70px;
  background-color: var(--header-bg, #ffffff);
  border-bottom: 1px solid var(--border-color, #dee2e6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color, #212529);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-name {
  font-weight: 500;
  color: #495057;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background-color: var(--primary-color, #007bff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1rem;
}
</style>
