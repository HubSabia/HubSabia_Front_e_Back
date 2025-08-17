<template>
  <!-- MUDANÇA 1: O @click agora chama a função diretamente para emitir um evento 'click' -->
  <div class="add-card" @click="emitClickEvent">
    <span class="add-card-plus">+</span>
  </div>
</template>

<script setup>
// MUDANÇA 2: Definimos que este componente emite um evento chamado 'click'
const emit = defineEmits(["click"]);

// MUDANÇA 3: A função agora emite o evento 'click'
const emitClickEvent = () => {
  emit("click");
};
</script>

<style scoped>
/* Seus estilos estão perfeitos, nenhuma mudança necessária aqui */
.add-card {
  background-color: #f8f9fa; /* Usei a cor do seu design original para consistência */
  border-radius: 8px;
  width: 150px;
  height: 150px; /* Ajustei a altura para corresponder ao design original */
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05); /* Sombra mais sutil */
  border: 2px dashed #dee2e6;
}

.add-card:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}

.add-card-plus {
  font-size: 3rem; /* Ajustado para o design original */
  color: #adb5bd; /* Ajustado para o design original */
  font-weight: 300; /* Ajustado para o design original */
}
</style>