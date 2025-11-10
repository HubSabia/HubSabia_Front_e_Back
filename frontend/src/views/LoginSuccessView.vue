<!-- frontend/src/views/LoginSuccessView.vue -->
<template>
  <div class="loading-container">
    <h2>Autenticando...</h2>
    <p>Você será redirecionado em breve.</p>
    <!-- Você pode adicionar um spinner de loading aqui -->
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

onMounted(() => {
  const route = useRoute();
  const router = useRouter();

  // 1. Pega o token que o nosso backend enviou pela URL
  const token = route.query.token;

  if (token) {
    // 2. Salva o token no localStorage, para que o usuário continue logado
    localStorage.setItem('authToken', token);
    
    // 3. Redireciona o usuário para a página principal do dashboard (ou outra página)
    // O window.location.href força um recarregamento completo da página,
    // o que é útil para garantir que o estado de autenticação seja atualizado em toda a aplicação.
    window.location.href = '/dashboard'; 
  } else {
    // Se, por algum motivo, não houver token, envia o usuário para a tela de login com um erro
    router.push('/login?error=auth_failed');
  }
});
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
}
</style>