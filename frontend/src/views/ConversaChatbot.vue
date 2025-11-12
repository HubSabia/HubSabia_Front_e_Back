<template>
  <div class="chat-view-wrapper">
    <ChatHistorySidebar :chatbotId="chatbotId" />
    <div class="chat-container">
      <header class="chat-header">
        <!-- Título agora mostra o nome do chatbot que estamos buscando -->
        <h2>{{ chatbotInfo.nome ? `Conversa com: ${chatbotInfo.nome}` : 'Carregando Chatbot...' }}</h2>
        <p v-if="chatbotInfo.campanha" class="campaign-context">
          Contexto: Campanha "{{ chatbotInfo.campanha.nome }}"
        </p>
      </header>
      <div class="messages-area" ref="messagesAreaRef">
        <!-- Loop para exibir as mensagens -->
        <div v-for="(msg, index) in mensagens" :key="index" :class="['message-bubble', msg.autor]">
          <p v-html="msg.texto"></p> <!-- Usamos v-html para poder renderizar quebras de linha -->
        </div>
        <!-- Indicador de "digitando" -->
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
import ChatHistorySidebar from '@/components/ChatHistorySidebar.vue';

const route = useRoute();
const chatbotId = route.params.id;

const chatbotInfo = ref({}); // Para guardar o nome do chatbot e da campanha
const mensagens = ref([]);
const novaMensagem = ref('');
const isLoading = ref(false);
const messagesAreaRef = ref(null);

// Função para rolar a área de mensagens para o final
const scrollToBottom = async () => {
  await nextTick();
  const area = messagesAreaRef.value;
  if (area) {
    area.scrollTop = area.scrollHeight;
  }
};

// Busca informações do chatbot para exibir no header
const buscarInfoChatbot = async () => {
    try {
        // Vamos criar uma nova rota para buscar um chatbot específico
        const response = await apiClient.get(`/chatbots/${chatbotId}`);
        chatbotInfo.value = response.data;
    } catch (error) {
        console.error("Erro ao buscar informações do chatbot:", error);
        chatbotInfo.value = { nome: "Chatbot não encontrado" };
    }
}

// Função principal que envia a mensagem para o backend
const enviarMensagem = async () => {
  if (!novaMensagem.value.trim() || isLoading.value) return;

  const textoUsuario = novaMensagem.value;
  mensagens.value.push({ autor: 'user', texto: textoUsuario });
  novaMensagem.value = '';
  isLoading.value = true;
  await scrollToBottom();

  try {
    const response = await apiClient.post(`/chatbots/${chatbotId}/interagir`, {
      mensagemUsuario: textoUsuario
    });
    
    // Substitui quebras de linha \n por <br> para renderização no HTML
    const textoFormatado = response.data.resposta.replace(/\n/g, '<br>');
    mensagens.value.push({ autor: 'bot', texto: textoFormatado });

  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    const errorMessage = error.response?.data?.msg || 'Desculpe, ocorreu um erro ao processar sua pergunta.';
    mensagens.value.push({ autor: 'bot', texto: errorMessage });
  } finally {
    isLoading.value = false;
    await scrollToBottom();
  }
};

// Roda as funções quando o componente é carregado
onMounted(() => {
  buscarInfoChatbot();
  mensagens.value.push({ autor: 'bot', texto: 'Olá! Faça sua pergunta sobre a campanha e seus editais.' });
});
</script>

<style scoped>
.chat-view {
  display: flex;
  justify-content: center;
  align-items: center;
  /* MUDANÇA: Ocupa 100% do espaço do .main-content */
  width: 100%;
  height: 100%;
  background-color: var(--content-bg);
}

.chat-view-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  max-height: calc(100vh - 70px); /* Altura total menos o header principal */
}

.chat-container {
  flex-grow: 1; /* Ocupa o espaço restante ao lado da sidebar */
  height: 100%;
  max-width: none; /* Remove o max-width para ocupar o espaço total */
  background: var(--card-bg);
  border-radius: 0 12px 12px 0; /* Ajusta o border-radius para a integração com a sidebar */
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Garante que o conteúdo não vaze */
}

.chat-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  text-align: center;
  background-color: var(--card-bg);
  flex-shrink: 0; /* Impede que o header encolha */
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

.message-bubble {
  max-width: 80%;
  padding: 0.75rem 1.25rem;
  border-radius: 20px;
  line-height: 1.5;
  word-wrap: break-word; /* Garante a quebra de palavras longas */
}

.message-bubble p {
  margin: 0; /* Remove margens padrão do parágrafo */
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
  border-radius: 22px; /* Deixa o input totalmente arredondado */
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
  border-radius: 22px; /* Deixa o botão totalmente arredondado */
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


/* RESPONSIVIDADE */
@media (max-width: 767px) {
  .chat-view-wrapper {
    /* Em celulares, o chat ocupa 100% da tela, sem padding externo */
    padding: 0;
    height: 100%;
  }

  .chat-container {
    /* Remove a borda e a sombra, fazendo o chat se sentir mais "nativo" */
    border-radius: 0;
    box-shadow: none;
    height: 100%;
  }

  .messages-area {
    padding: 1rem;
  }

  .chat-footer {
    padding: 0.75rem 1rem;
  }
}
</style>
