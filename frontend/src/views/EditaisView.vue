<template>
  <div class="view-container">
    <header class="view-header">
      <h2>Meus Editais</h2>
      <p>Gerencie aqui a sua biblioteca de editais e documentos.</p>
    </header>

    <div class="actions-bar">
      <button class="btn-primary" @click="handleCriar">Adicionar Novo Edital</button>
    </div>

    <div class="list-card">
      <h3 class="list-title">Biblioteca de Editais</h3>
      <table v-if="editais.length > 0">
        <thead>
          <tr>
            <th>TÍTULO</th>
            <th>DATA DE CRIAÇÃO</th>
            <th>AÇÕES</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="edital in editais" :key="edital._id">
            <td class="titulo-cell">{{ edital.titulo }}</td>
            <td>{{ formatarData(edital.createdAt) }}</td>
            <td class="actions-cell">
              <button class="btn-edit" @click="handleEditar(edital)">Editar</button>
              <button class="btn-delete" @click="handleExcluir(edital._id)">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="no-data">
        <p>Nenhum edital encontrado.</p>
        <button class="btn-primary" @click="handleCriar">Criar primeiro edital</button>
      </div>
    </div>

    <EditalModal 
      v-model="isModalVisible" 
      :edital-to-edit="editalParaEditar" 
      @edital-saved="buscarEditais" 
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
.view-container { 
  padding: 2rem; 
}

.view-header h2 { 
  font-size: 1.8rem; 
  font-weight: 600; 
  margin-bottom: 0.5rem; 
  color: #343a40;
}

.view-header p { 
  color: #6c757d; 
  margin-bottom: 1.5rem; 
}

.actions-bar { 
  margin-bottom: 2rem; 
}

.list-card { 
  widht: 800px;
  background-color: #fff; 
  border-radius: 8px; 
  padding: 1.5rem; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.list-title { 
  font-size: 1.2rem; 
  font-weight: 600; 
  margin-bottom: 1.5rem; 
  color: #343a40;
}

table { 
  width: 100%; 
  border-collapse: collapse; 
  text-align: left; 
}

th, td { 
  padding: 1rem; 
  border-bottom: 1px solid #e9ecef; 
  vertical-align: middle; 
}

th { 
  font-size: 0.75rem; 
  text-transform: uppercase; 
  color: #6c757d; 
  font-weight: 600; 
  background-color: #f8f9fa;
}

.titulo-cell { 
  font-weight: 500; 
  color: #343a40;
}

.actions-cell button { 
  padding: 0.3rem 0.6rem; 
  border: none; 
  border-radius: 4px; 
  cursor: pointer; 
  margin-right: 0.5rem; 
  font-size: 0.8rem; 
  font-weight: 500;
}

.btn-primary { 
  background-color: #007bff; 
  color: white; 
  border: none; 
  padding: 0.6rem 1.2rem; 
  border-radius: 6px; 
  cursor: pointer; 
  font-weight: 500;
  font-size: 0.95rem;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-edit { 
  background-color: #007bff; 
  color: white; 
}

.btn-edit:hover {
  background-color: #0056b3;
}

.btn-delete { 
  background-color: #dc3545; 
  color: white; 
}

.btn-delete:hover {
  background-color: #c82333;
}

.no-data { 
  text-align: center; 
  padding: 2rem; 
  color: #6c757d; 
}

.no-data p {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .view-container {
    padding: 1rem;
  }
  
  table {
    font-size: 0.9rem;
  }
  
  th, td {
    padding: 0.5rem;
  }
  
  .actions-cell {
    white-space: nowrap;
  }
  
  .actions-cell button {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
  }
}
</style>
