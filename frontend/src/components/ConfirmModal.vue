<template>
  <transition name="fade">
    <div v-if="isVisible" class="modal-overlay" @click.self="cancel">
      <div class="modal-content">
        <h3 class="modal-title">{{ title }}</h3>
        <p class="modal-message">{{ message }}</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="cancel">Cancelar</button>
          <button class="btn btn-danger" @click="confirm">Confirmar</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  isVisible: Boolean,
  title: { type: String, default: 'Confirmar Ação' },
  message: { type: String, default: 'Você tem certeza?' }
});

const emit = defineEmits(['confirm', 'cancel']);

const confirm = () => {
  emit('confirm');
};

const cancel = () => {
  emit('cancel');
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; }
.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  max-width: 400px;
}
.modal-title { margin-bottom: 1rem; font-size: 1.25rem; }
.modal-message { color: #6c757d; margin-bottom: 2rem; }
.modal-actions { display: flex; justify-content: center; gap: 1rem; }
.btn { padding: 0.6rem 1.2rem; border-radius: 6px; border: none; cursor: pointer; font-weight: 500; }
.btn-secondary { background-color: #6c757d; color: white; }
.btn-danger { background-color: #dc3545; color: white; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>