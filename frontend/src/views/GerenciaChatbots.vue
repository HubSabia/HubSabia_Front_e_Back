<template>
  <div class="view-container">
    <header class="view-header">
      <h2>Gestão de Chatbots</h2>
    </header>

    <div class="actions-bar">
      <button class="btn-primary" @click="handleCriar">Criar Novo Chatbot</button>
    </div>

    <!-- A tabela agora será renderizada em vez do bloco <pre> -->
    <div class="list-card">
      <h3 class="list-title">Meus Chatbots</h3>
      <table>
        <thead>
          <tr>
            <th>NOME</th>
            <th>CAMPANHA ASSOCIADA</th>
            <th>STATUS</th>
            <th>AÇÕES</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="chatbot in chatbots" :key="chatbot._id">
            <td>{{ chatbot.nome }}</td>
            <td>{{ chatbot.campanha?.nome || 'N/A' }}</td>
            <td>
              <span v-if="chatbot.status" :class="['status-badge', `status-${chatbot.status.toLowerCase().replace(' ', '-')}`]">
                {{ chatbot.status }}
              </span>
            </td>
            <td class="actions-cell">
              <button class="btn-chat" @click="iniciarConversa(chatbot._id)">Conversar</button>
              <button class="btn-edit" @click="handleEditar(chatbot)">Editar</button>
              <button class="btn-delete" @click="handleExcluir(chatbot._id)">Excluir</button>
            </td>
          </tr>
          <tr v-if="!isLoading && chatbots.length === 0">
            <td colspan="4" class="no-data">Nenhum chatbot encontrado.</td>
          </tr>
        </tbody>
      </table>
      <p v-if="isLoading">Carregando chatbots...</p> <!-- Indicador de carregamento -->
    </div>

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
const isLoading = ref(true); // Adicionando estado de carregamento

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

onMounted(buscarChatbots);
</script>

<style scoped>
/*.view-container { padding: 2rem; }*/
.list-card { 
  width: 900px;
  background-color: #fff; 
  border-radius: 8px; 
  padding: 1.5rem; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  }
.list-title { 
  font-size: 1.2rem; 
  font-weight: 600; 
  margin-bottom: 1.5rem; 
}
table { 
  width: 100%; 
  border-collapse: collapse; 
  text-align: left;
  table-layout: fixed;
}
th, td { 
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}
th { 
  font-size: 0.75rem; 
  text-transform: uppercase;
  font-weight: 600; 
}
.titulo-cell { 
  font-weight: 500; 
  word-wrap: break-word;
  max-width: 0;
  overflow-wrap: break-word;
}
.status-badge { 
  padding: 0.25rem 0.6rem; 
  border-radius: 12px; 
  font-size: 0.8rem; 
  font-weight: 500; 
  display: inline-block; 
}
.status-ativa { 
  background-color: #d4edda; 
  color: #155724;
}
.status-planejada { 
  background-color: #cce5ff; 
  color: #004085; 
}
.actions-cell button { 
  padding: 0.3rem 0.6rem; 
  border: none; 
  border-radius: 4px; 
  cursor: pointer;
  margin-right: 0.5rem; 
  font-size: 0.8rem; 
}
.btn-edit { 
  background-color: #007bff; 
  color: white; 
}
.btn-delete { 
  background-color: #dc3545; 
  color: white; 
}
.no-data { 
  text-align: center; 
  padding: 2rem; 
  color: #6c757d; 
}
</style>
