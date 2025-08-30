<template>
  <header class="header">
    <div class="header-content">
      <div class="header-title">{{ pageTitle }}</div>
      <Breadcrumb :items="breadcrumbItems" />
    </div>
    <div class="user-info">
      <!-- Placeholder for user info/avatar -->
      <span class="user-name">Admin User</span>
      <div class="user-avatar">A</div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Breadcrumb from './Breadcrumb.vue';

const props = defineProps({
  pageTitle: {
    type: String,
    default: 'Dashboard',
  },
});

const route = useRoute();

const breadcrumbItems = computed(() => {
  const items = [];
  
  switch (route.name) {
    case 'Editais':
      items.push({ text: 'Editais', link: null });
      break;
    case 'Campanhas':
      items.push({ text: 'Editais', link: '/editais' });
      items.push({ text: 'Campanhas', link: null });
      break;
    case 'Gerencia':
      items.push({ text: 'Editais', link: '/editais' });
      items.push({ text: 'Campanhas', link: '/campanhas' });
      items.push({ text: 'Chatbots', link: null });
      break;
    case 'Dashboard':
      items.push({ text: 'Dashboard', link: null });
      break;
    case 'Usuarios':
      items.push({ text: 'Usuários', link: null });
      break;
    default:
      items.push({ text: props.pageTitle, link: null });
  }
  
  return items;
});
</script>

<style scoped>
.header {
  min-height: 70px;
  background-color: var(--header-bg, #ffffff);
  border-bottom: 1px solid var(--border-color, #dee2e6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-content {
  flex: 1;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color, #212529);
  margin-bottom: 5px;
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

@media (max-width: 767px) {
  .header {
    padding: 15px;
  }
  
  .header-title {
    font-size: 1.3rem;
  }
  
  .user-name {
    display: none;
  }
}
</style>
