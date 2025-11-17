<template>
  <div class="public-chat-wrapper">
    <div class="chat-container">
      <header class="chat-header">
        <h2>{{ chatbotInfo.nome || 'Assistente Virtual' }}</h2>
        <p v-if="chatbotInfo.nome">Respostas baseadas nos editais da campanha</p>
      </header>
      
      <div class="messages-area" ref="messagesAreaRef">
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

// Estado simplificado para o chat público
const chatbotInfo = ref({});
const messages = ref([]); // Apenas as mensagens da sessão atual
const userInput = ref('');
const isReplying = ref(false);
const sessionId = ref(null); // A "memória" da conversa atual
const messagesAreaRef = ref(null);

// Busca apenas o nome do chatbot
const fetchChatbotInfo = async () => {
  try {
    // Usa a rota PÚBLICA para buscar info
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
      mensagemUsuario: currentMessage,
      // Envia o sessionId da conversa atual, se existir
      ...(sessionId.value && { sessaoId: sessionId.value }),
    };

    // Usa a rota PÚBLICA para interagir
    const response = await apiClient.post(`/public/chatbots/${chatbotId}/interagir`, payload);
    
    // GUARDA O ID DA SESSÃO RETORNADO PELA API
    sessionId.value = response.data.sessaoId;
    
    messages.value.push({ role: 'assistant', text: response.data.resposta });

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
  messages.value.push({
    role: 'assistant',
    text: 'Olá! Como posso ajudar com base nas informações desta campanha?',
  });
});
</script>

<style scoped>
/* ESTILOS VISUAIS PARA O CHAT PÚBLICO */
.public-chat-wrapper {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5; /* Um fundo neutro */
  padding: 20px;
}

.chat-container {
  width: 100%;
  height: 100%;
  max-width: 800px;
  max-height: 90vh;
  background: var(--card-bg, #fff);
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color, #dee2e6);
  text-align: center;
  flex-shrink: 0;
}

.chat-header h2 {
  font-size: 1.25rem;
  margin: 0;
  color: var(--text-color-dark, #212529);
}
.chat-header p {
  font-size: 0.85rem;
  margin: 0;
  color: var(--text-color-muted, #6c757d);
}

.messages-area {
  flex-grow: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-bubble {
  max-width: 80%;
  padding: 0.75rem 1.25rem;
  border-radius: 20px;
  line-height: 1.5;
  word-wrap: break-word;
}
.message-content :deep(p) { margin: 0; }

.message-bubble.user {
  background-color: var(--primary-color, #0d6efd);
  color: var(--text-color-light, #fff);
  align-self: flex-end;
  border-bottom-right-radius: 5px;
}

.message-bubble.assistant {
  background-color: #e9ecef;
  color: var(--text-color-dark, #212529);
  align-self: flex-start;
  border-bottom-left-radius: 5px;
}

.chat-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color, #dee2e6);
  background-color: var(--card-bg, #fff);
  flex-shrink: 0;
}

.message-form {
  display: flex;
  gap: 0.75rem;
}
.message-form input {
  flex-grow: 1;
  padding: 0.75rem 1.25rem;
  border: 1px solid var(--border-color, #dee2e6);
  border-radius: 22px;
  font-size: 1rem;
}
.message-form input:focus {
  outline: none;
  border-color: var(--primary-color, #0d6efd);
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}
.message-form button {
  padding: 0.75rem 1.5rem;
  border: none;
  background-color: var(--primary-color, #0d6efd);
  color: white;
  border-radius: 22px;
  cursor: pointer;
}
.message-form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.typing-indicator span {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--text-color-muted, #6c757d);
  margin: 0 2px;
  animation: bounce 1.4s infinite ease-in-out both;
}
.typing-indicator span:nth-of-type(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-of-type(2) { animation-delay: -0.16s; }
@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }
</style>
