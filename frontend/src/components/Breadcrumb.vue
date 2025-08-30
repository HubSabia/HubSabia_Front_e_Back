<template>
  <nav class="breadcrumb" v-if="items.length > 0">
    <ol class="breadcrumb-list">
      <li v-for="(item, index) in items" :key="index" class="breadcrumb-item">
        <router-link 
          v-if="item.link && index < items.length - 1" 
          :to="item.link" 
          class="breadcrumb-link"
        >
          {{ item.text }}
        </router-link>
        <span v-else class="breadcrumb-current">{{ item.text }}</span>
        <span v-if="index < items.length - 1" class="breadcrumb-separator">›</span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  }
});
</script>

<style scoped>
.breadcrumb {
  margin-bottom: 20px;
  padding: 10px 0;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-link {
  color: var(--primary-color, #0056b3);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: #004182;
  text-decoration: underline;
}

.breadcrumb-current {
  color: var(--text-color, #212529);
  font-weight: 600;
}

.breadcrumb-separator {
  margin: 0 10px;
  color: var(--secondary-color, #6c757d);
  font-weight: 500;
}

@media (max-width: 767px) {
  .breadcrumb-list {
    font-size: 0.9rem;
  }
  
  .breadcrumb-separator {
    margin: 0 5px;
  }
}
</style>

