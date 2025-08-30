<template>
  <div class="status-card" :class="cardClass">
    <div class="card-icon">
      <span class="icon-emoji">{{ icon }}</span>
    </div>
    <div class="card-content">
      <h3 class="card-title">{{ title }}</h3>
      <p class="card-count">{{ count }}</p>
      <p class="card-description">{{ description }}</p>
      <router-link :to="link" class="card-link">
        {{ linkText }}
        <span class="arrow">→</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  count: {
    type: [Number, String],
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  linkText: {
    type: String,
    default: 'Ver todos'
  },
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'success', 'warning'].includes(value)
  }
});

const cardClass = computed(() => {
  return `status-card--${props.type}`;
});
</script>

<style scoped>
.status-card {
  background: var(--card-bg, #ffffff);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid var(--border-color, #dee2e6);
  position: relative;
  overflow: hidden;
}

.status-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.status-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary-color, #0056b3);
}

.status-card--primary::before {
  background: var(--primary-color, #0056b3);
}

.status-card--success::before {
  background: #28a745;
}

.status-card--warning::before {
  background: #ffc107;
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: rgba(0, 86, 179, 0.1);
  border-radius: 12px;
  margin-bottom: 16px;
}

.icon-emoji {
  font-size: 28px;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color, #212529);
  margin-bottom: 8px;
}

.card-count {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-color, #0056b3);
  margin-bottom: 8px;
  line-height: 1;
}

.card-description {
  font-size: 0.9rem;
  color: var(--secondary-color, #6c757d);
  margin-bottom: 16px;
  line-height: 1.4;
}

.card-link {
  display: inline-flex;
  align-items: center;
  color: var(--primary-color, #0056b3);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: color 0.2s ease;
}

.card-link:hover {
  color: #004182;
}

.arrow {
  margin-left: 8px;
  transition: transform 0.2s ease;
}

.card-link:hover .arrow {
  transform: translateX(4px);
}

@media (max-width: 767px) {
  .status-card {
    padding: 20px;
  }
  
  .card-count {
    font-size: 2rem;
  }
  
  .card-icon {
    width: 50px;
    height: 50px;
  }
  
  .icon-emoji {
    font-size: 24px;
  }
}
</style>

