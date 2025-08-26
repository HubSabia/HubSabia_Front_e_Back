<template>
  <div class="view-container">
    <header class="view-header">
      <h2>Gestão de Chatbots</h2>
    </header>

    <div class="actions-bar">
      <button class="btn-primary" @click="handleCriar">Criar Novo Chatbot</button>
    </div>

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
            <td>{{ chatbot.campanha ? chatbot.campanha.nome : 'N/A' }}</td>
            <td>
              <!-- Adicionei .replace(' ', '-') para o status "Em Manutenção" funcionar no CSS -->
              <span :class="['status-badge', `status-${chatbot.status.toLowerCase().replace(' ', '-')}`]">
                {{ chatbot.status }}
              </span>
            </td>
            <td class="actions-cell">
              <button class="btn-chat" @click="iniciarConversa(chatbot._id)">Conversar</button>
              <button class="btn-edit" @click="handleEditar(chatbot)">Editar</button>
              <button class="btn-delete" @click="handleExcluir(chatbot._id)">Excluir</button>
            </td>
          </tr>
          <tr v-if="chatbots.length === 0">
            <td colspan="4" class="no-data">Nenhum chatbot encontrado. Crie o seu primeiro!</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para criar e editar chatbots -->
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

// --- Funções CRUD ---

const buscarChatbots = async () => {
  try {
    const response = await apiClient.get('/chatbots');
    chatbots.value = response.data;
  } catch (error) {
    console.error("Erro ao buscar chatbots:", error);
  }
};

const adicionarNovoChatbotNaLista = (novoChatbot) => {
  chatbots.value.unshift(novoChatbot);
};

const atualizarChatbotNaLista = (chatbotAtualizado) => {
  const index = chatbots.value.findIndex(c => c._id === chatbotAtualizado._id);
  if (index !== -1) {
    chatbots.value[index] = chatbotAtualizado;
  }
};

const handleExcluir = async (chatbotId) => {
  if (!window.confirm("Você tem certeza que deseja excluir este chatbot?")) {
    return;
  }
  try {
    await apiClient.delete(`/chatbots/${chatbotId}`);
    chatbots.value = chatbots.value.filter(c => c._id !== chatbotId);
    alert("Chatbot excluído com sucesso!");
  } catch (error) {
    console.error("Erro ao excluir chatbot:", error);
    alert(`Erro: ${error.response?.data?.msg || 'Não foi possível excluir o chatbot.'}`);
  }
};

const handleCriar = () => {
  chatbotParaEditar.value = null;
  isModalVisible.value = true;
};

const handleEditar = (chatbot) => {
  chatbotParaEditar.value = chatbot;
  isModalVisible.value = true;
};

const iniciarConversa = (chatbotId) => {
  // Redireciona para a página de chat, passando o ID do chatbot na URL
  router.push(`/chatbot/${chatbotId}`);
};

// --- Lifecycle Hook ---
onMounted(buscarChatbots);
</script>

<style scoped>
/* Estilos reutilizados e adaptados */
.view-container { padding: 2rem; }
.view-header h2 { font-size: 1.8rem; font-weight: 600; margin-bottom: 1.5rem; }
.actions-bar { margin-bottom: 2rem; }
.list-card { background-color: #fff; border-radius: 8px; padding: 1.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
.list-title { font-size: 1.2rem; font-weight: 600; margin-bottom: 1.5rem; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th, td { padding: 1rem; border-bottom: 1px solid #e9ecef; vertical-align: middle; }
th { font-size: 0.75rem; text-transform: uppercase; color: #6c757d; font-weight: 600; }
.status-badge { padding: 0.25rem 0.6rem; border-radius: 12px; font-size: 0.8rem; font-weight: 500; display: inline-block; }
.status-ativo { background-color: #d4edda; color: #155724; }
.status-inativo { background-color: #f8f9fa; color: #343a40; }
.status-em-manutenção { background-color: #fff3cd; color: #856404; }
.actions-cell button { padding: 0.3rem 0.6rem; border: none; border-radius: 4px; cursor: pointer; margin-right: 0.5rem; font-size: 0.8rem; }
.btn-primary { background-color: #007bff; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; }
.btn-edit { background-color: #6c757d; color: white; }
.btn-delete { background-color: #dc3545; color: white; }
.btn-chat { background-color: #28a745; color: white; }
.no-data { text-align: center; padding: 2rem; color: #6c757d; }
</style>
