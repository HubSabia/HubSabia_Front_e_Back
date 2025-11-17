<template>
  <div class="public-chat-wrapper">
    <!-- BARRA LATERAL ADICIONADA AQUI -->
    <ChatHistorySidebar
      :conversations="groupedConversations"
      :active-conversation-id="activeConversationId"
      @newChat="startNewConversation"
      @select="selectConversation"
    />

    <div class="chat-container">
      <header class="chat-header">
        <h2>{{ chatbotInfo.nome || 'Assistente Virtual' }}</h2>
        <p v-if="chatbotInfo.nome">Respostas baseadas nos editais da campanha</p>
      </header>
      
      <div class="messages-area" ref="messagesAreaRef">
        <!-- Mensagem de boas-vindas se não houver mensagens -->
        <div v-if="!activeConversationMessages.length" class="welcome-message">
            <p>Faça sua primeira pergunta para começar a conversa.</p>
        </div>
        <!-- Mensagens da conversa ativa -->
        <div v-for="(msg, index) in activeConversationMessages" :key="index" :class="['message-bubble', msg.role]">
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
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { marked } from 'marked';
import { useToast } from 'vue-toastification';
import apiClient from '@/services/api';
// IMPORTAMOS O COMPONENTE DA BARRA LATERAL
import ChatHistorySidebar from '@/components/ChatHistorySidebar.vue';

const route = useRoute();
const toast = useToast();
const chatbotId = route.params.id;

// LÓGICA DE ESTADO REINTRODUZIDA PARA A BARRA LATERAL
const chatbotInfo = ref({});
const allHistory = ref([]); // Histórico temporário, apenas para esta sessão
const activeConversationId = ref(null);
const activeConversationMessages = ref([]);
const userInput = ref('');
const isReplying = ref(false);
const messagesAreaRef = ref(null);

// COMPUTED PARA ALIMENTAR A BARRA LATERAL
const groupedConversations = computed(() => {
  if (!allHistory.value.length) return [];
  const groups = allHistory.value.reduce((acc, msg) => {
    if (!acc[msg.sessaoId]) {
      acc[msg.sessaoId] = {
        id: msg.sessaoId,
        title: msg.pergunta.substring(0, 30) + (msg.pergunta.length > 30 ? '...' : ''),
        createdAt: new Date(msg.createdAt),
      };
    }
    return acc;
  }, {});
  return Object.values(groups).sort((a, b) => b.createdAt - a.createdAt);
});

// FUNÇÕES DE AÇÃO
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
  activeConversationMessages.value.push({ role: 'user', text: currentMessage });
  userInput.value = '';
  isReplying.value = true;
  await scrollToBottom();
  try {
    const payload = {
      mensagemUsuario: currentMessage,
      ...(activeConversationId.value && { sessaoId: activeConversationId.value }),
    };
    const response = await apiClient.post(`/public/chatbots/${chatbotId}/interagir`, payload);
    const { resposta, sessaoId } = response.data;

    activeConversationMessages.value.push({ role: 'assistant', text: resposta });

    // Adiciona a nova mensagem ao histórico LOCAL para atualizar a sidebar
    allHistory.value.push({
        sessaoId,
        pergunta: currentMessage,
        resposta,
        createdAt: new Date().toISOString()
    });

    if (!activeConversationId.value) {
      activeConversationId.value = sessaoId;
    }

  } catch (error) {
    const errorMessage = error.response?.data?.msg || 'Desculpe, ocorreu um erro.';
    activeConversationMessages.value.push({ role: 'assistant', text: errorMessage });
    toast.error(errorMessage);
  } finally {
    isReplying.value = false;
    await scrollToBottom();
  }
};

// Funções para controlar a barra lateral
const selectConversation = (sessionId) => {
  // Como só haverá uma conversa, esta função não terá muito efeito prático,
  // mas é necessária para a estrutura.
  activeConversationId.value = sessionId;
  activeConversationMessages.value = allHistory.value
    .filter(msg => msg.sessaoId === sessionId)
    .flatMap(msg => [
      { role: 'user', text: msg.pergunta },
      { role: 'assistant', text: msg.resposta }
    ]);
  scrollToBottom();
}

const startNewConversation = () => {
    // No contexto público, "nova conversa" reinicia a sessão
    allHistory.value = [];
    activeConversationId.value = null;
    activeConversationMessages.value = [];
}

const renderMarkdown = (text) => marked(text || '');
const scrollToBottom = async () => {
  await nextTick();
  if (messagesAreaRef.value) {
    messagesAreaRef.value.scrollTop = messagesAreaRef.value.scrollHeight;
  }
};

onMounted(() => {
  fetchChatbotInfo();
  // Não adicionamos a mensagem de boas-vindas aqui,
  // para deixar a tela inicial mais limpa.
});
</script>

<style scoped>
/* ESTILO AJUSTADO PARA O LAYOUT DE 2 COLUNAS */
.public-chat-wrapper {
  display: flex; /* MUDANÇA PRINCIPAL AQUI */
  width: 100vw;
  height: 100vh;
  background-color: #f8f9fa; /* --content-bg */
}

.chat-container {
  flex-grow: 1; /* Ocupa o espaço restante ao lado da sidebar */
  height: 100%;
  background: #ffffff; /* --card-bg */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* Removemos o max-width, max-height, border-radius e shadow para um visual integrado */
}

/* O resto dos estilos (header, messages-area, bubble, etc.) permanece o mesmo */
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
    color: #6c757d; /* --text-color-muted */
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
