<template>
  <div class="next-steps">
    <div class="steps-header">
      <h3 class="steps-title">
        <span class="title-icon">🎯</span>
        Próximos Passos
      </h3>
      <p class="steps-subtitle">Siga o fluxo recomendado para melhor organização</p>
    </div>
    
    <div class="steps-list">
      <div 
        v-for="step in steps" 
        :key="step.id" 
        class="step-item"
        :class="{ 
          'step-completed': step.completed, 
          'step-current': step.current,
          'step-disabled': step.disabled 
        }"
      >
        <div class="step-indicator">
          <div class="step-number">
            <span v-if="step.completed">✓</span>
            <span v-else>{{ step.number }}</span>
          </div>
          <div v-if="step.id < steps.length" class="step-connector"></div>
        </div>
        
        <div class="step-content">
          <h4 class="step-title">{{ step.title }}</h4>
          <p class="step-description">{{ step.description }}</p>
          
          <div v-if="step.current && step.action" class="step-actions">
            <button 
              @click="step.action" 
              class="btn btn-primary step-button"
              :disabled="step.disabled"
            >
              {{ step.actionText }}
            </button>
          </div>
          
          <div v-if="step.completed" class="step-success">
            <span class="success-icon">✅</span>
            <span class="success-text">Concluído</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  steps: {
    type: Array,
    required: true
  }
});
</script>

<style scoped>
.next-steps {
  background: var(--card-bg, #ffffff);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-color, #dee2e6);
}

.steps-header {
  margin-bottom: 24px;
  text-align: center;
}

.steps-title {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--text-color, #212529);
  margin-bottom: 8px;
}

.title-icon {
  margin-right: 10px;
  font-size: 1.2rem;
}

.steps-subtitle {
  color: var(--secondary-color, #6c757d);
  font-size: 0.95rem;
}

.steps-list {
  position: relative;
}

.step-item {
  display: flex;
  margin-bottom: 24px;
  position: relative;
}

.step-item:last-child {
  margin-bottom: 0;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 20px;
  position: relative;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  background: #e9ecef;
  color: var(--secondary-color, #6c757d);
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.step-completed .step-number {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.step-current .step-number {
  background: var(--primary-color, #0056b3);
  color: white;
  border-color: var(--primary-color, #0056b3);
  box-shadow: 0 0 0 4px rgba(0, 86, 179, 0.2);
}

.step-disabled .step-number {
  background: #f8f9fa;
  color: #adb5bd;
  border-color: #f8f9fa;
}

.step-connector {
  width: 2px;
  height: 40px;
  background: #e9ecef;
  margin-top: 8px;
}

.step-completed .step-connector {
  background: #28a745;
}

.step-content {
  flex: 1;
  padding-top: 4px;
}

.step-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color, #212529);
  margin-bottom: 6px;
}

.step-disabled .step-title {
  color: #adb5bd;
}

.step-description {
  color: var(--secondary-color, #6c757d);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 12px;
}

.step-disabled .step-description {
  color: #adb5bd;
}

.step-actions {
  margin-top: 12px;
}

.step-button {
  padding: 8px 16px;
  font-size: 0.9rem;
  border-radius: 6px;
}

.step-success {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.success-icon {
  margin-right: 8px;
}

.success-text {
  color: #28a745;
  font-weight: 500;
  font-size: 0.9rem;
}

@media (max-width: 767px) {
  .next-steps {
    padding: 20px;
  }
  
  .step-indicator {
    margin-right: 15px;
  }
  
  .step-number {
    width: 35px;
    height: 35px;
    font-size: 0.8rem;
  }
  
  .step-connector {
    height: 35px;
  }
}
</style>

