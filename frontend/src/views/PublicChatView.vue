<template>
  <div class="chat-view-wrapper">
    <!-- 1. BARRA LATERAL: Usa a lógica de conversas agrupadas -->
    <ChatHistorySidebar
      :conversations="groupedConversations"
      :active-conversation-id="activeConversationId"
      @newChat="startNewConversation"
      @select="selectConversation"
    />

    <div class="chat-container">
      <header class="chat-header">
        <h2>{{ chatbotInfo.nome ? `Conversa com: ${chatbotInfo.nome}` : 'Carregando...' }}</h2>
        <p v-if="chatbotInfo.campanha" class="campaign-context">
          Contexto: Campanha "{{ chatbotInfo.campanha.nome }}"
        </p>
      </header>

      <!-- 2. ÁREA DE MENSAGENS: Agora itera sobre as mensagens da conversa ativa -->
      <div class="messages-area" ref="messagesContainerRef">
        <div v-if="!activeConversationMessages.length" class="welcome-message">
            <p>Faça sua primeira pergunta para começar a conversa.</p>
        </div>
        <div v-for="(msg, index) in activeConversationMessages" :key="index" :class="['message-bubble', msg.role === 'assistant' ? 'bot' : 'user']">
          <div class="message-content" v-html="renderMarkdown(msg.text)"></div>
        </div>
        <div v-if="isReplying" class="message-bubble bot typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>

      <footer class="chat-footer">
        <!-- 3. INPUT: Conectado à lógica de envio de mensagem com sessão -->
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
import ChatHistorySidebar from '@/components/ChatHistorySidebar.vue';

const route = useRoute();
const toast = useToast();
const chatbotId = route.params.id;

// --- LÓGICA AVANÇADA DE ESTADO ---
const chatbotInfo = ref({});
const allHistory = ref([]); // Lista plana com TODO o histórico
const activeConversationId = ref(null); // ID da sessão/conversa ativa
const activeConversationMessages = ref([]); // Mensagens que aparecem na tela
const isReplying = ref(false);
const userInput = ref('');
const messagesContainerRef = ref(null);

// --- COMPUTED: Transforma o histórico plano em conversas agrupadas para a sidebar ---
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

// --- FUNÇÕES ---

// Busca os dados iniciais (info do bot e todo o histórico)
const fetchInitialData = async () => {
  try {
    const [infoRes, historyRes] = await Promise.all([
      apiClient.get(`/chatbots/${chatbotId}`),
      apiClient.get(`/chatbots/${chatbotId}/historico-usuario`)
    ]);
    chatbotInfo.value = infoRes.data;
    allHistory.value = historyRes.data;
    startNewConversation(); // Inicia com uma tela de chat vazia
  } catch (error) {
    toast.error('Erro ao carregar dados do chatbot.');
  }
};

// Chamada quando o usuário clica em uma conversa na sidebar
const selectConversation = (sessionId) => {
  activeConversationId.value = sessionId;
  activeConversationMessages.value = allHistory.value
    .filter(msg => msg.sessaoId === sessionId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // Garante a ordem cronológica
    .flatMap(msg => [
      { role: 'user', text: msg.pergunta },
      { role: 'assistant', text: msg.resposta }
    ]);
  scrollToBottom();
};

// Limpa a tela para uma nova conversa
const startNewConversation = () => {
  activeConversationId.value = null;
  activeConversationMessages.value = [];
};

// Envia a mensagem para o backend, controlando a sessão
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
      ...(activeConversationId.value && { sessaoId: activeConversationId.value })
    };
    
    const response = await apiClient.post(`/chatbots/${chatbotId}/interagir`, payload);
    const { resposta, sessaoId } = response.data;
    
    activeConversationMessages.value.push({ role: 'assistant', text: resposta });
    
    const newHistoryEntry = {
        sessaoId,
        pergunta: currentMessage,
        resposta,
        createdAt: new Date().toISOString()
    };
    allHistory.value.push(newHistoryEntry);

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

// --- FUNÇÕES UTILITÁRIAS ---
const renderMarkdown = (text) => marked(text || '');
const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainerRef.value) {
    messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight;
  }
};

onMounted(fetchInitialData);
</script>

<style scoped>
/* ESTILOS ORIGINAIS MANTIDOS CONFORME SOLICITADO */
.chat-view {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: var(--content-bg);
}

.chat-view-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  max-height: calc(100vh - 70px);
}

.chat-container {
  flex-grow: 1;
  height: 100%;
  max-width: none;
  background: var(--card-bg);
  border-radius: 0 12px 12px 0;
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  text-align: center;
  background-color: var(--card-bg);
  flex-shrink: 0;
}

.chat-header h2 {
  font-size: 1.25rem;
  color: var(--text-color-dark);
}

.campaign-context {
  font-size: 0.85rem;
  color: var(--text-color-muted);
}

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
    color: var(--text-color-muted);
    margin: auto;
}

.message-bubble {
  max-width: 80%;
  padding: 0.75rem 1.25rem;
  border-radius: 20px;
  line-height: 1.5;
  word-wrap: break-word;
}
.message-content :deep(p) {
    margin: 0;
}

.message-bubble.user {
  background-color: var(--primary-color);
  color: var(--text-color-light);
  align-self: flex-end;
  border-bottom-right-radius: 5px;
}

.message-bubble.bot {
  background-color: #e9ecef;
  color: var(--text-color-dark);
  align-self: flex-start;
  border-bottom-left-radius: 5px;
}

.chat-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background-color: var(--card-bg);
  flex-shrink: 0;
}

.message-form {
  display: flex;
  gap: 0.75rem;
}

.message-form input {
  flex-grow: 1;
  padding: 0.75rem 1.25rem;
  border: 1px solid var(--border-color);
  border-radius: 22px;
  font-size: 1rem;
}

.message-form input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.message-form button {
  padding: 0.75rem 1.5rem;
  border: none;
  background-color: var(--primary-color);
  color: white;
  border-radius: 22px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}
.message-form button:hover {
  background-color: #0b5ed7;
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
  background-color: var(--text-color-muted);
  margin: 0 2px;
  animation: bounce 1.4s infinite ease-in-out both;
}
.typing-indicator span:nth-of-type(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-of-type(2) { animation-delay: -0.16s; }
@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }

@media (max-width: 767px) {
  .chat-view-wrapper {
    padding: 0;
    height: 100%;
  }

  .chat-container {
    border-radius: 0;
    box-shadow: none;
    height: 100%;
  }
  
  /* Esconde a sidebar em telas pequenas. Uma solução mais avançada seria um menu "hambúrguer". */
  .chat-view-wrapper :deep(.history-sidebar) {
    display: none;
  }

  .messages-area { padding: 1rem; }
  .chat-footer { padding: 0.75rem 1rem; }
}
</style>
