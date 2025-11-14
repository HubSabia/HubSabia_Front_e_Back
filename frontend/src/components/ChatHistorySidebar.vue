<template>
  <div class="history-sidebar">
    <div class="sidebar-header">
      <h4>Seu Histórico de Conversas</h4>
    </div>
    <div class="sidebar-content">
      <div v-if="isLoading" class="loading-message">Carregando...</div>
      <div v-else-if="conversations.length === 0" class="no-data-message">
        Nenhuma conversa anterior encontrada.
      </div>
      <div v-else class="conversation-list">
        <div 
          v-for="(conv, index) in conversations" 
          :key="index" 
          class="conversation-item"
          @click="selectConversation(conv)"
        >
          <div class="conversation-title">
            {{ conv.pergunta.substring(0, 30) + (conv.pergunta.length > 30 ? '...' : '') }}
          </div>
          <div class="conversation-date">
            {{ formatDate(conv.dataInteracao) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { getUserChatHistory } from '@/services/api';
import { useToast } from "vue-toastification";

const props = defineProps({
  chatbotId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['conversation-selected']);

const conversations = ref([]);
const isLoading = ref(false);
const toast = useToast();

const fetchHistory = async (id) => {
  if (!id) return;
  isLoading.value = true;
  try {
    const response = await getUserChatHistory(id);
    // O backend retorna o histórico de mensagens individuais.
    // Para a sidebar, vamos usar a primeira mensagem de cada interação como "título".
    conversations.value = response.data;
  } catch (error) {
    console.error("Erro ao buscar histórico do usuário:", error);
    toast.error("Não foi possível carregar seu histórico de conversas.");
    conversations.value = [];
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  
  // Se for hoje, mostra a hora
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  // Se for outro dia, mostra a data
  return date.toLocaleDateString('pt-BR');
};

const selectConversation = (conv) => {
  // Por enquanto, apenas emitimos o evento. A lógica de "selecionar" a conversa
  // para reexibir o diálogo completo pode ser mais complexa e talvez não seja o que o usuário quer.
  // O mais simples é apenas mostrar a lista de interações.
  // Se o objetivo for apenas mostrar a lista de interações, este método pode ser removido.
  // Vamos manter a lista de interações simples por enquanto.
  // Se o usuário quiser que o clique recarregue a conversa, precisaremos de mais lógica.
  // Por enquanto, a sidebar apenas lista as interações.
};

onMounted(() => {
  fetchHistory(props.chatbotId);
});

watch(() => props.chatbotId, (newId) => {
  fetchHistory(newId);
});
</script>

<style scoped>
.history-sidebar {
  width: 250px;
  min-width: 250px;
  background-color: #f8f9fa; /* Cor de fundo clara para a sidebar */
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  background-color: #e2e6ea;
}

.sidebar-header h4 {
  margin: 0;
  font-size: 1rem;
  color: #343a40;
}

.sidebar-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.loading-message, .no-data-message {
  padding: 1rem;
  text-align: center;
  font-size: 0.85rem;
  color: #6c757d;
}

.conversation-list {
  display: flex;
  flex-direction: column;
}

.conversation-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f1f3f5;
  cursor: pointer;
  transition: background-color 0.2s;
}

.conversation-item:hover {
  background-color: #e9ecef;
}

.conversation-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: #495057;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-date {
  font-size: 0.75rem;
  color: #adb5bd;
  margin-top: 2px;
}

/* Ocultar em telas pequenas */
@media (max-width: 767px) {
  .history-sidebar {
    display: none;
  }
}
</style>
