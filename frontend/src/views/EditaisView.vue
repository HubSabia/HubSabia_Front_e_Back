<template>
  <div class="view-container">
    <header class="view-header">
      <h2>Bibliotecas de Editais</h2>
      <button class="btn-primary" @click="handleCriar">Adicionar</button>
    </header>

    <div class="list-container">
      <!-- Cabeçalho da Lista (opcional, pode ser removido se preferir) -->
      <div class="list-header">
        <span>Informações do Edital</span>
        <span>Ações</span>
      </div>

      <!-- Lista de Itens -->
      <div class="item-list">
        <div v-if="isLoading" class="message">Carregando editais...</div>
        <div v-if="!isLoading && editais.length === 0" class="message">
          Nenhum edital encontrado. Clique em "Adicionar" para criar o primeiro.
        </div>
        <div v-for="edital in editais" :key="edital._id" class="item-card">
          <div class="item-info">
            <span class="item-name">{{ edital.titulo }}</span>
            <span class="item-description">{{ edital.conteudo | truncate }}</span>
          </div>
          <div class="item-actions">
            <button class="btn-edit" @click="handleEditar(edital)">Editar</button>
            <button class="btn-delete" @click="handleExcluir(edital._id)">Excluir</button>
          </div>
        </div>
      </div>
    </div>

    <EditalModal
      v-model="isModalVisible"
      :edital-to-edit="editalParaEditar"
      @edital-created="adicionarNovoEditalNaLista"
      @edital-updated="atualizarEditalNaLista"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';
import EditalModal from '@/components/EditalModal.vue';

const editais = ref([]);
const isModalVisible = ref(false);
const editalParaEditar = ref(null);

const buscarEditais = async () => {
  try {
    const response = await apiClient.get('/editais');
    editais.value = response.data;
  } catch (error) {
    console.error("Erro ao buscar editais:", error);
  }
};

const formatarData = (data) => {
  if (!data) return '';
  return new Date(data).toLocaleDateString('pt-BR');
};

const handleCriar = () => {
  editalParaEditar.value = null;
  isModalVisible.value = true;
};

const handleEditar = (edital) => {
  editalParaEditar.value = edital;
  isModalVisible.value = true;
};

const handleExcluir = async (editalId) => {
  if (window.confirm('Tem certeza que deseja excluir este edital?')) {
    try {
      await apiClient.delete(`/editais/${editalId}`);
      buscarEditais();
      alert('Edital excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir edital:', error);
      alert('Não foi possível excluir o edital.');
    }
  }
};

onMounted(buscarEditais);
</script>

<style scoped>
/* ESTILOS PADRONIZADOS PARA A VIEW */
.view-container {
  padding: 2rem;
  background-color: #e9ecef; /* Fundo cinza claro da página */
  min-height: calc(100vh - 70px); /* Ocupa a altura da tela menos o header */
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
  background-color: #28a745; /* Verde Adicionar */
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

/* ESTILOS DO CONTAINER DA LISTA */
.list-container {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.list-header {
  display: flex;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  font-size: 0.8rem;
  border-bottom: 1px solid #dee2e6;
}

/* ESTILOS DOS CARDS INDIVIDUAIS NA LISTA */
.item-card {
  display: grid;
  grid-template-columns: 1fr auto; /* Coluna da informação cresce, coluna das ações tem tamanho automático */
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  transition: background-color 0.2s;
}

.item-card:last-child {
  border-bottom: none;
}

.item-card:hover {
  background-color: #f8f9fa; /* Efeito suave ao passar o mouse */
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow: hidden; /* Evita que o texto vaze */
}

.item-name {
  font-weight: 600;
  color: #343a40;
  font-size: 1.1rem;
}

.item-description {
  font-size: 0.9rem;
  color: #6c757d;
  white-space: nowrap; /* Impede a quebra de linha */
  overflow: hidden; /* Esconde o texto que transborda */
  text-overflow: ellipsis; /* Adiciona "..." ao final do texto longo */
  max-width: 90%; /* Garante que não empurre os botões */
}

.item-actions {
  display: flex;
  gap: 0.5rem;
}

.item-actions button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  color: white;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.85rem;
  transition: opacity 0.2s;
}

.item-actions button:hover {
  opacity: 0.85;
}

.btn-edit { background-color: #0d6efd; } /* Azul */
.btn-delete { background-color: #dc3545; } /* Vermelho */

.message {
  padding: 2rem;
  text-align: center;
  color: #6c757d;
  font-style: italic;
}
</style>
