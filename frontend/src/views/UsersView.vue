<template>
  <div class="view-container">
    <header class="view-header">
      <h2>Gestão de Usuários</h2>
    </header>

    <div v-if="isAdminUser">
      <div class="list-card">
        <h3 class="list-title">Todos os Usuários do Sistema</h3>
        <table>
          <thead>
            <tr>
              <th>NOME</th>
              <th>EMAIL</th>
              <th>PAPEL (ROLE)</th>
              <th>DATA DE CRIAÇÃO</th>
              <th>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="usuario in usuarios" :key="usuario._id">
              <td>{{ usuario.nome }}</td>
              <td>{{ usuario.email }}</td>
              <td>
                <!-- Um dropdown para mudar o papel do usuário -->
                <select :value="usuario.role" @change="mudarPapel(usuario, $event.target.value)">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>{{ formatarData(usuario.createdAt) }}</td>
              <td class="actions-cell">
                <button class="btn-delete" @click="handleExcluir(usuario._id)">Excluir</button>
              </td>
            </tr>
            <tr v-if="usuarios.length === 0">
              <td colspan="5" class="no-data">Nenhum usuário encontrado.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else>
      <p class="access-denied">Acesso negado. Você precisa ser um administrador para ver esta página.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';
import { isAdmin } from '@/utils/auth';

const usuarios = ref([]);
const isAdminUser = ref(isAdmin()); // Verifica se o usuário é admin

const buscarUsuarios = async () => {
  // Só tenta buscar se o usuário for admin
  if (isAdminUser.value) {
    try {
      // Chama a nova rota GET /api/usuarios
      const response = await apiClient.get('/usuarios');
      usuarios.value = response.data;
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      alert("Não foi possível carregar a lista de usuários.");
    }
  }
};

const mudarPapel = async (usuario, novoPapel) => {
  if (!window.confirm(`Tem certeza que deseja mudar o papel de ${usuario.nome} para ${novoPapel}?`)) {
    return;
  }
  try {
    // Chama a nova rota PUT /api/usuarios/:id/role
    const response = await apiClient.put(`/usuarios/${usuario._id}/role`, { role: novoPapel });
    // Atualiza o usuário na lista local com a resposta da API
    const index = usuarios.value.findIndex(u => u._id === response.data._id);
    if (index !== -1) {
      usuarios.value[index] = response.data;
    }
    alert("Papel do usuário atualizado com sucesso!");
  } catch (error) {
    console.error("Erro ao mudar o papel:", error);
    alert("Não foi possível atualizar o papel do usuário.");
    // Recarrega a lista para reverter a mudança visual no dropdown
    buscarUsuarios();
  }
};

const handleExcluir = async (usuarioId) => {
    // ... (você pode implementar a lógica de exclusão aqui, similar à de campanhas)
    alert(`Lógica para excluir o usuário ${usuarioId} a ser implementada.`);
};

const formatarData = (data) => {
  if (!data) return '';
  return new Date(data).toLocaleDateString('pt-BR');
};

onMounted(buscarUsuarios);
</script>

<style scoped>
/* Você pode copiar e adaptar os estilos das suas outras páginas de gestão */
.access-denied { color: #dc3545; font-weight: bold; }
/* ... (estilos para a tabela, botões, etc.) */
</style>