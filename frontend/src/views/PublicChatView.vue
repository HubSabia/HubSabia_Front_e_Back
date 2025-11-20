<template>
  <div class="public-chat-wrapper">
    <div class="chat-container">
      <header class="chat-header">
        <h2>{{ chatbotInfo.nome || 'Assistente Virtual' }}</h2>
        <p v-if="chatbotInfo.nome">Respostas baseadas nos editais da campanha</p>
      </header>
      
      <div class="messages-area" ref="messagesAreaRef">
        <div v-if="!messages.length" class="welcome-message">
            <p>Faça sua primeira pergunta para começar a conversa.</p>
        </div>
        <div v-for="(msg, index) in messages" :key="index" :class="['message-bubble', msg.role]">
          <div class="message-content" v-html="renderMarkdown(msg.text)"></div>
        </div>
        <div v-if="isReplying" class="message-bubble assistant typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
      
      <footer class="chat-footer">
        <form @submit.prevent="sendMessage" class="message-form">
          <input
            type="text"
            v-model="userInput"
            placeholder="Digite sua pergunta..."
            :disabled="isReplying"
            autocomplete="off"
          />
          <button type="submit" :disabled="!userInput.trim() || isReplying">Enviar</button>
        </form>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { marked } from 'marked';
import { useToast } from 'vue-toastification';
import apiClient from '@/services/api';

const route = useRoute();
const toast = useToast();
const chatbotId = route.params.id;

const chatbotInfo = ref({});
const messages = ref([]);
const userInput = ref('');
const isReplying = ref(false);
const messagesAreaRef = ref(null);

const fetchChatbotInfo = async () => {
  try {
    const response = await apiClient.get(`/public/chatbots/${chatbotId}`);
    chatbotInfo.value = response.data;
  } catch (error) {
    toast.error('Não foi possível carregar as informações do chatbot.');
    chatbotInfo.value = { nome: 'Chatbot Indisponível' };
  }
};

const sendMessage = async () => {
  if (!userInput.value.trim() || isReplying.value) return;
  const currentMessage = userInput.value;
  messages.value.push({ role: 'user', text: currentMessage });
  userInput.value = '';
  isReplying.value = true;
  await scrollToBottom();
  try {
    const payload = {
      mensagemUsuario: currentMessage
    };
    const response = await apiClient.post(`/public/chatbots/${chatbotId}/interagir`, payload);
    const { resposta } = response.data;

    messages.value.push({ role: 'assistant', text: resposta });

  } catch (error) {
    const errorMessage = error.response?.data?.msg || 'Desculpe, ocorreu um erro.';
    messages.value.push({ role: 'assistant', text: errorMessage });
    toast.error(errorMessage);
  } finally {
    isReplying.value = false;
    await scrollToBottom();
  }
};

const renderMarkdown = (text) => marked(text || '');
const scrollToBottom = async () => {
  await nextTick();
  if (messagesAreaRef.value) {
    messagesAreaRef.value.scrollTop = messagesAreaRef.value.scrollHeight;
  }
};

onMounted(() => {
  fetchChatbotInfo();
});
</script>

<style scoped>
.public-chat-wrapper {
  display: flex;
  width: 100vw;
  height: 100vh;
  background-color: #f8f9fa;
}

.chat-container {
  flex-grow: 1;
  height: 100%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #dee2e6;
  text-align: center;
  flex-shrink: 0;
}
.chat-header h2 { font-size: 1.25rem; margin: 0; color: #212529; }
.chat-header p { font-size: 0.85rem; margin: 5px 0 0; color: #6c757d; }

.messages-area {
  flex-grow: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.welcome-message {
    text-align: center;
    color: #6c757d;
    margin: auto;
}

.message-bubble {
  max-width: 80%;
  padding: 0.75rem 1.25rem;
  border-radius: 20px;
  line-height: 1.5;
  word-wrap: break-word;
}
.message-content :deep(p) { margin: 0; }
.message-content :deep(ul), .message-content :deep(ol) { padding-left: 20px; }

.message-bubble.user {
  background-color: #0d6efd;
  color: #ffffff;
  align-self: flex-end;
  border-bottom-right-radius: 5px;
}
.message-bubble.assistant {
  background-color: #e9ecef;
  color: #212529;
  align-self: flex-start;
  border-bottom-left-radius: 5px;
}

.chat-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
  background-color: #ffffff;
  flex-shrink: 0;
}

.message-form { display: flex; gap: 0.75rem; }
.message-form input { flex-grow: 1; padding: 0.75rem 1.25rem; border: 1px solid #dee2e6; border-radius: 22px; font-size: 1rem; }
.message-form input:focus { outline: none; border-color: #0d6efd; box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25); }
.message-form button { padding: 0.75rem 1.5rem; border: none; background-color: #0d6efd; color: white; border-radius: 22px; cursor: pointer; }
.message-form button:disabled { background-color: #6c757d; opacity: 0.7; cursor: not-allowed; }

.typing-indicator span { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #6c757d; margin: 0 2px; animation: bounce 1.4s infinite ease-in-out both; }
.typing-indicator span:nth-of-type(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-of-type(2) { animation-delay: -0.16s; }
@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }
</style>