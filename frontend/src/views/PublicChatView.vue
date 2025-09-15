<template>
  <div class="public-chat-view">
    <div class="chat-container">
      <header class="chat-header">
        <img src="/ifpr_logo_placeholder.svg" alt="Logo IFPR" class="header-logo">
        <h2>{{ chatbotInfo.nome || 'Assistente Virtual do IFPR' }}</h2>
      </header>
      <div class="messages-area" ref="messagesAreaRef">
        <!-- Loop de mensagens -->
        <div v-for="(msg, index) in mensagens" :key="index" :class="['message-bubble', msg.autor]">
          <p v-html="msg.texto.replace(/\n/g, '<br>')"></p>
        </div>
        <div v-if="isLoading" class="message-bubble bot typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
      <footer class="chat-footer">
        <form @submit.prevent="enviarMensagem" class="message-form">
          <input type="text" v-model="novaMensagem" placeholder="Digite sua pergunta..." :disabled="isLoading"/>
          <button type="submit" :disabled="isLoading">Enviar</button>
        </form>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios'; // Usamos axios diretamente aqui

const route = useRoute();
const chatbotId = route.params.id;
const chatbotInfo = ref({});
const mensagens = ref([]);
const novaMensagem = ref('');
const isLoading = ref(false);
const messagesAreaRef = ref(null);

// URL base da API pública
const publicApiBaseUrl = 'https://hubsabia-backend-vdl8.onrender.com/api/public';

const buscarInfoChatbot = async () => {
  try {
    const response = await axios.get(`${publicApiBaseUrl}/chatbots/${chatbotId}`);
    chatbotInfo.value = response.data;
  } catch (error) {
    console.error("Erro ao buscar chatbot público:", error);
    mensagens.value.push({ autor: 'bot', texto: 'Este assistente não está disponível no momento.' });
  }
};

const enviarMensagem = async () => {
  const textoUsuario = novaMensagem.value.trim();
  if (!textoUsuario || isLoading.value) return;
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
    mensagens.value.push({ autor: 'bot', texto: error.response?.data?.msg || 'Desculpe, ocorreu um erro.' });
  } finally {
    isLoading.value = false;
    await nextTick(() => { messagesAreaRef.value.scrollTop = messagesAreaRef.value.scrollHeight; });
  }
};

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
}
/* Copie e adapte os estilos do seu ChatBotView.vue para o .chat-container, etc. */
.header-logo { height: 40px; margin-right: 1rem; }
</style>