<template>
  <div class="list-card">
    <h3 class="list-title">Lista de Campanhas</h3>
    <table>
      <thead>
        <tr>
          <th>NOME</th>
          <th>PERÍODO</th>
          <th>STATUS</th>
          <th>PÚBLICO-ALVO</th>
          <th>AÇÕES</th>
        </tr>
      </thead>
      <tbody>
        <!-- 1. O loop agora usa a prop 'campanhas' que veio do pai -->
        <tr v-for="campanha in campanhas" :key="campanha._id">
          <td>{{ campanha.nome }}</td>
          <td>{{ formatarData(campanha.periodo_inicio) }} - {{ formatarData(campanha.periodo_fim) }}</td>
          <td>
            <span :class="['status-badge', `status-${campanha.status.toLowerCase()}`]">{{ campanha.status }}</span>
          </td>
          <td>{{ campanha.publico_alvo }}</td>
          <td class="actions-cell">
            <!-- 2. Os botões agora EMITEM eventos para avisar o pai, em vez de conter a lógica -->
            <button class="btn-edit" @click="$emit('edit', campanha)">Editar</button>
            <button class="btn-delete" @click="$emit('delete', campanha._id)">Excluir</button>
          </td>
        </tr>
        <tr v-if="!campanhas || campanhas.length === 0">
          <td colspan="5" class="no-data">Nenhuma campanha encontrada.</td>
          <button class="btn-create" @click="$emit('add')">Adicionar Campanha</button>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
// 3. Define que este componente espera receber uma propriedade 'campanhas'
defineProps({
  campanhas: {
    type: Array,
    required: true
  }
});

// 4. Define os eventos que este componente pode emitir para o pai
defineEmits(['edit', 'delete']);

// Função helper de formatação, que pode ficar aqui ou ser movida para um arquivo de utils
const formatarData = (data) => {
  if (!data) return '';
  return new Date(data).toLocaleDateString('pt-BR');
};
</script>

<style scoped>
/* O CSS da tabela que estava em CampaignsView.vue agora vive aqui */
.list-card { background-color: #fff; border-radius: 8px; padding: 1.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
.list-title { font-size: 1.2rem; font-weight: 600; margin-bottom: 1.5rem; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th, td { padding: 1rem; border-bottom: 1px solid #e9ecef; vertical-align: middle; }
th { font-size: 0.75rem; text-transform: uppercase; color: #6c757d; font-weight: 600; }
.status-badge { padding: 0.25rem 0.6rem; border-radius: 12px; font-size: 0.8rem; font-weight: 500; display: inline-block; }
.status-ativa { background-color: #d4edda; color: #155724; }
.status-planejada { background-color: #cce5ff; color: #004085; }
.actions-cell button { padding: 0.3rem 0.6rem; border: none; border-radius: 4px; cursor: pointer; margin-right: 0.5rem; font-size: 0.8rem; }
.btn-edit { background-color: #007bff; color: white; }
.btn-delete { background-color: #dc3545; color: white; }
.no-data { text-align: center; padding: 2rem; color: #6c757d; }
</style>
