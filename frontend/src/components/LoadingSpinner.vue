<template>
  <div class="loading-container" :class="{ 'fullscreen': fullscreen }">
    <div class="spinner"></div>
    <p v-if="message" class="loading-message">{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  /**
   * Mensagem a ser exibida abaixo do spinner
   */
  message: {
    type: String,
    default: 'Carregando...'
  },
  /**
   * Se true, ocupa a tela inteira
   * Se false, ocupa apenas o container pai
   */
  fullscreen: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  min-height: 200px;
}

.loading-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.95);
  z-index: 9999;
  min-height: 100vh;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--primary-color, #0056b3);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-message {
  margin-top: 1.5rem;
  color: var(--text-color-muted, #6c757d);
  font-size: 1rem;
  font-weight: 500;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Versão menor para uso inline */
.loading-container:not(.fullscreen) .spinner {
  width: 35px;
  height: 35px;
  border-width: 3px;
}

.loading-container:not(.fullscreen) .loading-message {
  font-size: 0.9rem;
  margin-top: 1rem;
}
</style>