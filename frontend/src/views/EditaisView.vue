<template>
  <div class="view-container">
    <header class="view-header">
      <h2>Meus Editais</h2>
      <p>Gerencie aqui a sua biblioteca de editais e documentos.</p>
    </header>

    <div class="actions-bar">
      <!-- O clique neste botão agora chama a função 'handleCriar' correta -->
      <button class="btn-primary" @click="handleCriar">Adicionar Novo Edital</button>
    </div>

    <div class="list-card">
      <h3 class="list-title">Biblioteca de Editais</h3>
      <table>
        <thead>
          <tr>
            <th>TÍTULO</th>
            <th>DATA DE PUBLICAÇÃO</th>
            <th>AÇÕES</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="edital in editais" :key="edital._id">
            <td class="titulo-cell">{{ edital.titulo }}</td>
            <td>{{ formatarData(edital.data_publicacao) }}</td>
            <td class="actions-cell">
              <button class="btn-edit" @click="handleEditar(edital)">Editar</button>
              <button class="btn-delete" @click="handleExcluir(edital._id)">Excluir</button>
            </td>
          </tr>
          <tr v-if="editais.length === 0">
            <td colspan="3" class="no-data">Nenhum edital encontrado.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- O modal sendo chamado corretamente -->
    <EditalModal 
      v-model="isModalVisible" 
      :edital-to-edit="editalParaEditar" 
      @edital-saved="onEditalSaved"  
    />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';
// Assumindo que você criará este componente no próximo passo
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

// Abre o modal em modo de criação
const handleCriar = () => {
  editalParaEditar.value = null;
  isModalVisible.value = true;
};

// Abre o modal em modo de edição
const handleEditar = (edital) => {
  editalParaEditar.value = edital;
  isModalVisible.value = true;
};

// Lógica de exclusão com atualização instantânea
const handleExcluir = async (editalId) => {
  if (window.confirm('Tem certeza que deseja excluir este edital?')) {
     try {
       await apiClient.delete(`/editais/${editalId}`);
       // MUDANÇA: Remove o edital da lista localmente para feedback instantâneo
       editais.value = editais.value.filter(e => e._id !== editalId);
       alert('Edital excluído com sucesso!');
     } catch (error) {
       console.error('Erro ao excluir edital:', error);
       alert('Não foi possível excluir o edital.');
    }
  }
};

// MUDANÇA: Função unificada para lidar com o salvamento (criação e edição)
const onEditalSaved = (editalSalvo) => {
  const index = editais.value.findIndex(e => e._id === editalSalvo._id);
  if (index !== -1) {
    // Se o edital já existia (edição), atualiza-o na lista.
    editais.value[index] = editalSalvo;
  } else {
    // Se for um novo edital (criação), adiciona-o no início da lista.
    editais.value.unshift(editalSalvo);
  }
};

onMounted(buscarEditais);
</script>

<style scoped>
/* Seus estilos estão corretos e não precisam de alteração */
.view-container { padding: 2rem; }
.view-header h2 { font-size: 1.8rem; font-weight: 600; margin-bottom: 0.5rem; }
.view-header p { color: #6c757d; margin-bottom: 1.5rem; }
.actions-bar { margin-bottom: 2rem; }
.list-card { background-color: #fff; border-radius: 8px; padding: 1.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
.list-title { font-size: 1.2rem; font-weight: 600; margin-bottom: 1.5rem; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th, td { padding: 1rem; border-bottom: 1px solid #e9ecef; vertical-align: middle; }
th { font-size: 0.75rem; text-transform: uppercase; color: #6c757d; font-weight: 600; }
.titulo-cell { font-weight: 500; }
.actions-cell button { padding: 0.3rem 0.6rem; border: none; border-radius: 4px; cursor: pointer; margin-right: 0.5rem; font-size: 0.8rem; }
.btn-primary { background-color: #007bff; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; }
.btn-edit { background-color: #007bff; color: white; }
.btn-delete { background-color: #dc3545; color: white; }
.no-data { text-align: center; padding: 2rem; color: #6c757d; }
</style>