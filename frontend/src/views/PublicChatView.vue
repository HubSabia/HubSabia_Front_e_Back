<template>
  <div class="public-chat-view">
    <div class="chat-container">
      <header class="chat-header">
        <img src="/ifpr_logo_placeholder.svg" alt="Logo IFPR" class="header-logo">
        <h2>{{ chatbotInfo.nome || 'Assistente Virtual do IFPR' }}</h2>
        <p v-if="errorLoading" class="error-text">{{ errorLoading }}</p>
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
          <input 
            type="text" 
            v-model="novaMensagem" 
            placeholder="Digite sua pergunta..." 
            :disabled="isLoading || !!errorLoading" 
            autocomplete="off"
          />
          <button type="submit" :disabled="isLoading || !!errorLoading">Enviar</button>
        </form>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const chatbotId = route.params.id;
const chatbotInfo = ref({});
const mensagens = ref([]);
const novaMensagem = ref('');
const isLoading = ref(false);
const errorLoading = ref('');
const messagesAreaRef = ref(null);

const publicApiBaseUrl = 'https://hubsabia-backend-vdl8.onrender.com/api/public';

console.log('=== PUBLIC CHAT VIEW INICIADO ===');
console.log('Chatbot ID da URL:', chatbotId);
console.log('Route completa:', route);

const buscarInfoChatbot = async () => {
    try {
        console.log('Iniciando busca do chatbot...');
        console.log('URL:', `${publicApiBaseUrl}/chatbots/${chatbotId}`);
        
        const response = await axios.get(`${publicApiBaseUrl}/chatbots/${chatbotId}`);
        console.log('Chatbot encontrado:', response.data);
        
        chatbotInfo.value = response.data;
        
        // Verifica se o chatbot está ativo
        if (response.data.status !== 'Ativo') {
            errorLoading.value = 'Este assistente está inativo no momento.';
            mensagens.value.push({ 
                autor: 'bot', 
                texto: 'Desculpe, este assistente está temporariamente inativo. Entre em contato com o administrador.' 
            });
        }
    } catch (error) {
        console.error("Erro ao buscar chatbot público:", error);
        console.error("Detalhes do erro:", error.response?.data);
        
        errorLoading.value = 'Erro ao carregar o assistente';
        mensagens.value.push({ 
            autor: 'bot', 
            texto: 'Desculpe, não foi possível carregar este assistente. Verifique se o link está correto ou se o chatbot está ativo.' 
        });
    }
}

const enviarMensagem = async () => {
  if (!novaMensagem.value.trim() || isLoading.value || errorLoading.value) return;

  const textoUsuario = novaMensagem.value;
  mensagens.value.push({ autor: 'user', texto: textoUsuario });
  novaMensagem.value = '';
  isLoading.value = true;
  await nextTick(() => { 
    if (messagesAreaRef.value) {
      messagesAreaRef.value.scrollTop = messagesAreaRef.value.scrollHeight; 
    }
  });

  try {
    console.log('Enviando mensagem para:', `${publicApiBaseUrl}/chatbots/${chatbotId}/interagir`);
    
    const response = await axios.post(`${publicApiBaseUrl}/chatbots/${chatbotId}/interagir`, {
      mensagemUsuario: textoUsuario
    });
    
    console.log('Resposta recebida:', response.data);
    mensagens.value.push({ autor: 'bot', texto: response.data.resposta });

  } catch (error) {
    console.error("Erro ao interagir com o bot público:", error);
    console.error("Detalhes:", error.response?.data);
    
    const errorMessage = error.response?.data?.msg || 'Desculpe, ocorreu um erro ao processar sua pergunta.';
    mensagens.value.push({ autor: 'bot', texto: errorMessage });
  } finally {
    isLoading.value = false;
    await nextTick(() => { 
      if (messagesAreaRef.value) {
        messagesAreaRef.value.scrollTop = messagesAreaRef.value.scrollHeight; 
      }
    });
  }
};

onMounted(async () => {
  console.log('Component montado!');
  await buscarInfoChatbot();
  
  if (!errorLoading.value) {
    mensagens.value.push({ 
      autor: 'bot', 
      texto: 'Olá! Bem-vindo ao assistente do IFPR. Como posso ajudar?' 
    });
  }
});
</script>

<style scoped>
.public-chat-view {
  background-color: #f5f5f5;
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
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: #ffffff;
  flex-shrink: 0;
}

.header-logo {
  height: 40px;
}

.chat-header h2 {
  font-size: 1.25rem;
  color: #212529;
  margin: 0;
}

.error-text {
  color: #dc3545;
  font-size: 0.9rem;
  margin: 0;
}

.messages-area {
  flex-grow: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: #f8f9fa;
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
  background-color: #007bff;
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 5px;
}

.message-bubble.bot {
  background-color: #e9ecef;
  color: #212529;
  align-self: flex-start;
  border-bottom-left-radius: 5px;
}

.chat-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
  background-color: #ffffff;
  flex-shrink: 0;
}

.message-form {
  display: flex;
  gap: 0.75rem;
}

.message-form input {
  flex-grow: 1;
  padding: 0.75rem 1.25rem;
  border: 1px solid #ced4da;
  border-radius: 22px;
  font-size: 1rem;
}

.message-form input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.message-form input:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.message-form button {
  padding: 0.75rem 1.5rem;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 22px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.message-form button:hover:not(:disabled) { 
  background-color: #0056b3; 
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
  background-color: #6c757d; 
  margin: 0 2px; 
  animation: bounce 1.4s infinite ease-in-out both; 
}

.typing-indicator span:nth-of-type(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-of-type(2) { animation-delay: -0.16s; }

@keyframes bounce { 
  0%, 80%, 100% { transform: scale(0); } 
  40% { transform: scale(1.0); } 
}

@media (max-width: 767px) {
  .public-chat-view {
    padding: 0;
  }
  .chat-container {
    border-radius: 0;
    box-shadow: none;
    height: 100vh;
    max-height: none;
  }
  .messages-area { 
    padding: 1rem; 
  }
  .chat-footer { 
    padding: 0.75rem 1rem; 
  }
}
</style>