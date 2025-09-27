<template>
  <div class="view-container">
    <header class="view-header">
      <!-- O título 'gerenciar usuário' que aparece no topo pode vir do Header.vue -->
      <h2>Usuários</h2>
    </header>

    <div class="list-card">
      <table class="users-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Data de Criação</th>
            <th>Papel</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="usuario in usuarios" :key="usuario._id">
            <td>{{ usuario.nome }}</td>
            <td>{{ usuario.email }}</td>
            <td>{{ formatarData(usuario.createdAt) }}</td>
            <td>
              <select 
                class="role-select"
                :value="usuario.role" 
                @change="mudarPapel(usuario, $event.target.value)"
                :disabled="usuario._id === currentUser.id"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </td>
            <td>
              <button 
                class="btn-delete" 
                @click="handleExcluir(usuario._id)"
                :disabled="usuario._id === currentUser.id"
              >
                Excluir
              </button>
            </td>
          </tr>
          <tr v-if="!isLoading && usuarios.length === 0">
            <td colspan="5" class="no-data">Nenhum usuário encontrado.</td>
          </tr>
        </tbody>
      </table>
      <p v-if="isLoading">Carregando usuários...</p>
    </div>
  </div>
</template>

<script setup>
// O SCRIPT SETUP QUE JÁ TINHAMOS ESTÁ PERFEITO
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';
import { isAdmin, getUserPayload } from '@/utils/auth';

const usuarios = ref([]);
const isLoading = ref(true);
const isAdminUser = ref(isAdmin());
const currentUser = ref(getUserPayload());

const buscarUsuarios = async () => {
  if (isAdminUser.value) {
    isLoading.value = true;
    try {
      const response = await apiClient.get('/usuarios');
      usuarios.value = response.data;
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      isLoading.value = false;
    }
  }
};

const mudarPapel = async (usuario, novoPapel) => {
  if (!window.confirm(`Tem certeza que deseja mudar o papel de ${usuario.nome} para ${novoPapel}?`)) {
    event.target.value = usuario.role;
    return;
  }
  try {
    const response = await apiClient.put(`/usuarios/${usuario._id}/role`, { role: novoPapel });
    const index = usuarios.value.findIndex(u => u._id === response.data._id);
    if (index !== -1) {
      usuarios.value[index] = response.data;
    }
  } catch (error) {
    console.error("Erro ao mudar o papel:", error);
    alert("Não foi possível atualizar o papel do usuário.");
  }
};

const handleExcluir = async (usuarioId) => {
  if (!window.confirm("Tem certeza que deseja EXCLUIR este usuário?")) {
    return;
  }
  try {
    await apiClient.delete(`/usuarios/${usuarioId}`);
    usuarios.value = usuarios.value.filter(u => u._id !== usuarioId);
  } catch(error) {
    console.error("Erro ao excluir usuário:", error);
    alert(error.response?.data?.msg || "Não foi possível excluir o usuário.");
  }
};
    
const formatarData = (data) => {
  if (!data) return '';
  return new Date(data).toLocaleDateString('pt-BR');
};

onMounted(buscarUsuarios);
</script>

<style scoped>
/* ESTILOS PARA CORRESPONDER AO SEU DESIGN */
.view-container {
  padding: 2rem;
}

.view-header h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #333;
}

.list-card {
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden; /* Garante que as bordas da tabela fiquem contidas */
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th, .users-table td {
  border: 1px solid #ddd;
  padding: 12px 15px;
  text-align: left;
  vertical-align: middle;
}

.users-table thead {
  background-color: #f2f2f2; /* Fundo cinza claro para o cabeçalho */
}

.users-table th {
  font-weight: 600;
  color: #333;
}

.role-select {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.role-select:disabled {
  background-color: #eee;
  cursor: not-allowed;
}

.btn-delete {
  background-color: #e74c3c; /* Vermelho */
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-delete:hover {
  background-color: #c0392b;
}
.btn-delete:disabled {
  background-color: #eee; 
  cursor: not-allowed;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: #777;
}
</style>