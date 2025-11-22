<template>
  <header class="public-header">
    <div class="logo-area">
      <router-link to="/">
        <span class="app-name">Hub-Sabiá</span>
      </router-link>
    </div>
    <nav class="navigation">
      <router-link v-if="!isLoggedIn" to="/login" class="login-button">
        Fazer Login
      </router-link>
      <router-link v-else to="/dashboard" class="dashboard-button">
        Ir para Dashboard
      </router-link>
    </nav>
  </header>
</template>

<script setup>
import { computed } from 'vue';

const isLoggedIn = computed(() => {
  return !!localStorage.getItem('authToken');
});
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

.app-name {
  font-size: 1.5rem;
  font-weight: 700;
}

.login-button, .dashboard-button {
  padding: 0.6rem 1.2rem;
  border: 1px solid transparent;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.2s ease-in-out;
}

.login-button {
  background-color: #28a745;
  color: #ffffff;
}

.login-button:hover {
  background-color: #218838;
}

.dashboard-button {
  background-color: #007bff;
  color: #ffffff;
}

.dashboard-button:hover {
  background-color: #0056b3;
}
</style>