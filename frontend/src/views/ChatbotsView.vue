<template>
  <div class="chat-view">
    <div class="chat-container">
      <header class="chat-header">
        <h2>Conversa com o Chatbot</h2>
      </header>
      <div class="messages-area" ref="messagesAreaRef">
        <div v-for="(msg, index) in mensagens" :key="index" :class="['message-bubble', msg.autor]">
          <p>{{ msg.texto }}</p>
        </div>
        <div v-if="isLoading" class="message-bubble bot typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
      <footer class="chat-footer">
        <form @submit.prevent="enviarMensagem" class="message-form">
          <input
            type="text"
            v-model="novaMensagem"
            placeholder="Digite sua pergunta..."
            :disabled="isLoading"
            autocomplete="off"
          />
          <button type="submit" :disabled="isLoading">Enviar</button>
        </form>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';

const route = useRoute();
const chatbotId = route.params.id;

const mensagens = ref([]);
const novaMensagem = ref('');
const isLoading = ref(false);
const messagesAreaRef = ref(null);

const scrollToBottom = async () => {
  await nextTick();
  const area = messagesAreaRef.value;
  if (area) {
    area.scrollTop = area.scrollHeight;
  }
};

const enviarMensagem = async () => {
  if (!novaMensagem.value.trim() || isLoading.value) return;
  const textoUsuario = novaMensagem.value;
  mensagens.value.push({ autor: 'user', texto: textoUsuario });
  novaMensagem.value = '';
  isLoading.value = true;
  scrollToBottom();
  try {
    const response = await apiClient.post(`/chatbots/${chatbotId}/interagir`, {
      mensagemUsuario: textoUsuario
    });
    mensagens.value.push({ autor: 'bot', texto: response.data.resposta });
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    mensagens.value.push({ autor: 'bot', texto: 'Desculpe, ocorreu um erro. Tente novamente mais tarde.' });
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
};

onMounted(() => {
  mensagens.value.push({ autor: 'bot', texto: 'Olá! Faça sua pergunta sobre a campanha e seus editais.' });
});
</script>

<style scoped>
/* Estilos da interface de chat */
.chat-view { display: flex; justify-content: center; align-items: center; height: calc(100vh - 60px); background-color: #f4f7f9; }
.chat-container { width: 100%; max-width: 800px; height: 90%; background: white; border-radius: 8px; box-shadow: 0 5px 25px rgba(0,0,0,0.1); display: flex; flex-direction: column; }
.chat-header { padding: 1rem; border-bottom: 1px solid #e9ecef; }
.messages-area { flex-grow: 1; padding: 1rem; overflow-y: auto; display: flex; flex-direction: column; gap: 0.75rem; }
.message-bubble { max-width: 75%; padding: 0.75rem 1rem; border-radius: 18px; line-height: 1.5; }
.message-bubble.user { background-color: #007bff; color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
.message-bubble.bot { background-color: #e9ecef; color: #343a40; align-self: flex-start; border-bottom-left-radius: 4px; }
.chat-footer { padding: 1rem; border-top: 1px solid #e9ecef; }
.message-form { display: flex; gap: 0.5rem; }
.message-form input { flex-grow: 1; padding: 0.75rem; border: 1px solid #ced4da; border-radius: 18px; }
.message-form button { padding: 0.75rem 1.5rem; border: none; background-color: #007bff; color: white; border-radius: 18px; cursor: pointer; }
.typing-indicator span { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #adb5bd; margin: 0 2px; animation: bounce 1.4s infinite ease-in-out both; }
.typing-indicator span:nth-of-type(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-of-type(2) { animation-delay: -0.16s; }
@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }
</style>