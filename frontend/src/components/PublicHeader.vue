<!-- frontend/src/components/PublicHeader.vue -->
<template>
  <header class="public-header">
    <div class="logo-area">
      <!-- O link no logo leva para a página inicial (Vitrine) -->
      <router-link to="/">
        <!-- Substitua por seu logo real em 'src/assets' se tiver um -->
        <!-- <img src="@/assets/logo.svg" alt="Hub-Sabiá Logo" class="logo"> -->
        <span class="app-name">Hub-Sabiá</span>
      </router-link>
    </div>
    <nav class="navigation">
      <!-- O botão leva para a página de login -->
      <router-link to="/login" class="login-button">
        Fazer Login
      </router-link>
    </nav>
  </header>
</template>

<script setup>
// Este componente é tão simples que não precisa de lógica JavaScript
</script>

<style scoped>
.public-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  width: 100%;
  box-sizing: border-box;
}

.logo-area a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #1a202c;
}

.logo {
  height: 40px;
  margin-right: 12px;
}

.app-name {
  font-size: 1.5rem;
  font-weight: 700;
}

.login-button {
  padding: 0.6rem 1.2rem;
  border: 1px solid transparent;
  border-radius: 8px;
  text-decoration: none;
  background-color: #28a745;
  color: #ffffff;
  font-weight: 600;
  transition: background-color 0.2s ease-in-out;
}

.login-button:hover {
  background-color: #218838;
}
</style>