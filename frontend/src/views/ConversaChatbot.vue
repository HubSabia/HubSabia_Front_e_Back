<template>
  <div class="chat-view">
    <h1>Conversa com o Chatbot</h1>
    <p v-if="chatbotId">
      ID do Chatbot: <strong>{{ chatbotId }}</strong>
    </p>
    <p v-else class="error">
      Não foi possível encontrar o ID do chatbot na URL.
    </p>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();
const chatbotId = route.params.id;
</script>

<style scoped>
.chat-view { padding: 2rem; }
.error { color: red; }
</style>