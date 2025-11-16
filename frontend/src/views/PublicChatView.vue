<template>
  <!-- Layout simplificado para a página pública -->
  <div class="public-chat-view">
    <div class="chat-container">
      <header class="chat-header">
        <img src="/ifpr_logo_placeholder.svg" alt="Logo IFPR" class="header-logo">
        <h2>{{ chatbotInfo.nome || 'Assistente Virtual do IFPR' }}</h2>
      </header>
      <div class="messages-area" ref="messagesAreaRef">
        <div v-for="(msg, index) in mensagens" :key="index" :class="['message-bubble', msg.autor]">
          <p v-html="msg.texto.replace(/\n/g, '<br>')"></p>
        </div>
        <div v-if="isLoading" class="message-bubble bot typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
      <footer class="chat-footer">
        <form @submit.prevent="enviarMensagem" class="message-form">
          <input type="text" v-model="novaMensagem" placeholder="Digite sua pergunta..." :disabled="isLoading" autocomplete="off"/>
          <button type="submit" :disabled="isLoading">Enviar</button>
        </form>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
// MUDANÇA: Usamos axios diretamente, pois não precisamos do interceptador de token.
import axios from 'axios';

const route = useRoute();
const chatbotId = route.params.id;
const chatbotInfo = ref({});
const mensagens = ref([]);
const novaMensagem = ref('');
const isLoading = ref(false);
const messagesAreaRef = ref(null);

// MUDANÇA: A URL base agora aponta para as rotas PÚBLICAS.
const publicApiBaseUrl = 'https://hubsabia-backend-vdl8.onrender.com/api/public';

// Busca informações do chatbot usando a rota pública
const buscarInfoChatbot = async () => {
    try {
        console.log('Buscando chatbot com ID:', chatbotId); // Debug
        const response = await axios.get(`${publicApiBaseUrl}/chatbots/${chatbotId}`);
        console.log('Chatbot encontrado:', response.data); // Debug
        chatbotInfo.value = response.data;
    } catch (error) {
        console.error("Erro ao buscar chatbot público:", error);
        console.error("URL tentada:", `${publicApiBaseUrl}/chatbots/${chatbotId}`); // Debug
        mensagens.value.push({ 
            autor: 'bot', 
            texto: 'Este assistente não está disponível no momento. Por favor, verifique se o link está correto ou se o chatbot está ativo.' 
        });
    }
}

// Envia a mensagem para a rota de interação PÚBLICA
const enviarMensagem = async () => {
  if (!novaMensagem.value.trim() || isLoading.value) return;

  const textoUsuario = novaMensagem.value;
  mensagens.value.push({ autor: 'user', texto: textoUsuario });
  novaMensagem.value = '';
  isLoading.value = true;
  await nextTick(() => { messagesAreaRef.value.scrollTop = messagesAreaRef.value.scrollHeight; });

  try {
    const response = await axios.post(`${publicApiBaseUrl}/chatbots/${chatbotId}/interagir`, {
      mensagemUsuario: textoUsuario
    });
    
    mensagens.value.push({ autor: 'bot', texto: response.data.resposta });

  } catch (error) {
    console.error("Erro ao interagir com o bot público:", error);
    const errorMessage = error.response?.data?.msg || 'Desculpe, ocorreu um erro ao processar sua pergunta.';
    mensagens.value.push({ autor: 'bot', texto: errorMessage });
  } finally {
    isLoading.value = false;
    await nextTick(() => { messagesAreaRef.value.scrollTop = messagesAreaRef.value.scrollHeight; });
  }
};

// Roda as funções quando o componente é carregado
onMounted(() => {
  buscarInfoChatbot();
  mensagens.value.push({ autor: 'bot', texto: 'Olá! Bem-vindo ao assistente do IFPR. Como posso ajudar?' });
});
</script>

<style scoped>
/* ESTILOS REFINADOS E RESPONSIVOS PARA A PÁGINA DE CHAT PÚBLICA */

.public-chat-view {
  background-color: var(--content-bg);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
}

.chat-container {
  width: 100%;
  max-width: 800px;
  height: 90vh;
  max-height: 800px;
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background-color: var(--card-bg);
  flex-shrink: 0;
}

.header-logo {
  height: 40px;
}

.chat-header h2 {
  font-size: 1.25rem;
  color: var(--text-color-dark);
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

.message-bubble p {
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
.message-form button:hover { background-color: #0b5ed7; }
.message-form button:disabled { opacity: 0.6; cursor: not-allowed; }

.typing-indicator span { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #adb5bd; margin: 0 2px; animation: bounce 1.4s infinite ease-in-out both; }
.typing-indicator span:nth-of-type(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-of-type(2) { animation-delay: -0.16s; }
@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }

@media (max-width: 767px) {
  .public-chat-view {
    padding: 0;
  }
  .chat-container {
    border-radius: 0;
    box-shadow: none;
    height: 100vh; /* Ocupa 100% da altura da tela */
    max-height: none;
  }
  .messages-area { padding: 1rem; }
  .chat-footer { padding: 0.75rem 1rem; }
}
</style>