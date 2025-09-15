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
        const response = await axios.get(`${publicApiBaseUrl}/chatbots/${chatbotId}`);
        chatbotInfo.value = response.data;
    } catch (error) {
        console.error("Erro ao buscar chatbot público:", error);
        mensagens.value.push({ autor: 'bot', texto: 'Este assistente não está disponível no momento.' });
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
/* Estilos focados na página pública, sem dependência do layout logado */
.public-chat-view {
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
}
.header-logo { height: 40px; margin-right: 1rem; }
/* O resto do CSS é idêntico ao do seu ConversaChatbot.vue */
.chat-container { width: 100%; max-width: 800px; height: 90vh; max-height: 800px; background: white; border-radius: 8px; box-shadow: 0 5px 25px rgba(0,0,0,0.1); display: flex; flex-direction: column; }
.chat-header { padding: 1rem; border-bottom: 1px solid #e9ecef; display: flex; align-items: center; justify-content: center; }
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