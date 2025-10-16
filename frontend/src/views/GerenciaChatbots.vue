<template>
  <div class="view-container">
    <header class="view-header">
      <h2>Criar ChatBots</h2>
      <button class="btn-primary" @click="handleCriar">Adicionar</button>
    </header>

    <div class="bots-list-container">
      <div class="list-header">
        <span class="col-nome">Nome</span>
        <span class="col-campanha">Campanha Associada</span>
        <span class="col-status">Status</span>
        <span class="col-link">Link Público</span>
        <span class="col-acoes">Ações</span>
      </div>

      <div class="bots-list">
        <div v-if="isLoading" class="loading-message">Carregando chatbots...</div>
        
        <div v-if="!isLoading && chatbots.length === 0" class="no-data-message">
          Nenhum chatbot encontrado. Clique em "Adicionar" para criar o seu primeiro.
        </div>

        <div v-for="chatbot in chatbots" :key="chatbot._id" class="bot-item">
          <div class="col-nome">{{ chatbot.nome }}</div>
          <div class="col-campanha">{{ chatbot.campanha?.nome || 'N/A' }}</div>
          <div class="col-status">{{ chatbot.status }}</div>
          
          <!-- Bloco do Link Público, agora no lugar certo -->
          <div class="col-link">
            <button v-if="chatbot.status === 'Ativo'" @click="copiarLink(chatbot._id)" class="btn-copy">
              Copiar Link
            </button>
            <span v-else class="link-inactive">Ative o bot</span>
          </div>
          
          <!-- Bloco das Ações -->
          <div class="col-acoes actions-buttons">
            <button class="btn-edit" @click="handleEditar(chatbot)">Editar</button>
            <button class="btn-delete" @click="handleExcluir(chatbot._id)">Excluir</button>
            <button class="btn-chat" @click="iniciarConversa(chatbot._id)">Conversar com o Bot</button>
          </div>
        </div> <!-- Fim da div do v-for -->
      </div> <!-- Fim de .bots-list -->
    </div> <!-- Fim de .bots-list-container -->
  
    <ChatbotModal
      v-model="isModalVisible"
      :chatbot-to-edit="chatbotParaEditar"
      @chatbot-created="adicionarNovoChatbotNaLista"
      @chatbot-updated="atualizarChatbotNaLista"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/services/api';
import ChatbotModal from '@/components/ChatbotModal.vue';

const chatbots = ref([]);
const isModalVisible = ref(false);
const chatbotParaEditar = ref(null);
const router = useRouter();
const isLoading = ref(true);

const buscarChatbots = async () => {
  isLoading.value = true;
  try {
    const response = await apiClient.get('/chatbots');
    chatbots.value = response.data;
  } catch (error) {
    console.error("Erro ao buscar chatbots:", error);
  } finally {
    isLoading.value = false;
  }
};

const adicionarNovoChatbotNaLista = (novoChatbot) => { chatbots.value.unshift(novoChatbot); };
const atualizarChatbotNaLista = (chatbotAtualizado) => { const index = chatbots.value.findIndex(c => c._id === chatbotAtualizado._id); if (index !== -1) { chatbots.value[index] = chatbotAtualizado; } };
const handleExcluir = async (chatbotId) => { if (!window.confirm("Você tem certeza?")) return; try { await apiClient.delete(`/chatbots/${chatbotId}`); chatbots.value = chatbots.value.filter(c => c._id !== chatbotId); } catch (error) { console.error("Erro ao excluir", error); } };
const handleCriar = () => { chatbotParaEditar.value = null; isModalVisible.value = true; };
const handleEditar = (chatbot) => { chatbotParaEditar.value = chatbot; isModalVisible.value = true; };
const iniciarConversa = (chatbotId) => { router.push(`/chatbot/${chatbotId}`); };

  const copiarLink = (chatbotId) => {
  const publicUrl = `${window.location.origin}/#/chat-publico/${chatbotId}`;
  navigator.clipboard.writeText(publicUrl).then(() => {
    alert('Link público copiado para a área de transferência!');
  }).catch(err => {
    console.error('Erro ao copiar o link:', err);
    alert('Não foi possível copiar o link.');
  });
};
  
onMounted(buscarChatbots);
</script>

<style scoped>
.view-container {
  padding: 2rem;
  background-color: #F9F9F9;
  min-height: calc(100vh - 70px);
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.view-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
}

.btn-primary {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}
.btn-primary:hover {
  background-color: #218838;
}
.bots-list-container {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  overflow: hidden;
}

.list-header, .bot-item {
  display: grid;
  grid-template-columns: 1.5fr 2fr 1fr 1.5fr 3fr; 
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #dee2e6;
  gap: 1rem;
}

.list-header {
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  font-size: 0.8rem;
  background-color: #f8f9fa;
}

.bot-item {
  transition: background-color 0.2s;
}

.bot-item:last-child {
  border-bottom: none;
}

.bot-item:hover {
  background-color: #f8f9fa;
}

.col-nome, .col-campanha, .col-status, .col-link, .col-acoes {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-start;
}

.actions-buttons button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  color: white;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.85rem;
  transition: opacity 0.2s;
}
.actions-buttons button:hover {
  opacity: 0.85;
}

.btn-edit { background-color: #0d6efd; } 
.btn-delete { background-color: #dc3545; } 
.btn-chat { background-color: #1f2937; } 

.loading-message, .no-data-message {
  padding: 2rem;
  text-align: center;
  color: #6c757d;
}

.btn-copy {
  background-color: #ffc107;
  color: #212529;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.85rem;
  transition: opacity 0.2s;
}
.btn-copy:hover {
  opacity: 0.85;
}

.link-inactive {
  font-size: 0.8rem;
  color: #6c757d;
  font-style: italic;
}
</style>
