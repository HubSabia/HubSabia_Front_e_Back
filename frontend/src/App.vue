<template>
  <div id="app" :class="{ 'login-layout': isLoginPage, 'main-layout': !isLoginPage }">
    <MainSidebar v-if="!isLoginPage" />
    <div class="content-wrapper">
      <Header v-if="!isLoginPage" :pageTitle="currentPageTitle" />
      <main class="main-content">
        <router-view @update-title="updatePageTitle"></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import MainSidebar from '@/components/MainSidebar.vue';
import Header from '@/components/Header.vue';

const route = useRoute();
// Pega o título do 'meta' da rota atual.
const currentPageTitle = computed(() => {
  return route.meta.title || 'Dashboard'; // Se não houver, usa 'Dashboard' como padrão.
});

const isLoginPage = computed(() => route.name === 'Login' || route.name === 'Register');
</script>

<style>
/* Global styles & Formal Theme */
:root {
  --primary-color: #0056b3;
  --secondary-color: #6c757d;
  --sidebar-bg: #212529;
  --header-bg: #ffffff;
  --content-bg: #f8f9fa;
  --text-color: #212529;
  --text-color-light: #f8f9fa;
  --border-color: #dee2e6;
  --card-bg: #ffffff;
  --font-family: 'Inter', sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family);
  background-color: var(--content-bg);
  color: var(--text-color);
  line-height: 1.6;
}

#app {
  display: flex;
  min-height: 100vh;
}

.main-layout {
  display: flex;
  width: 100%;
}

.login-layout {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #e9ecef;
}

.content-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
}

.main-layout .content-wrapper {
  margin-left: 260px;
}

.main-content {
  flex-grow: 1;
  padding: 30px;
  background-color: var(--content-bg);
}

.btn {
  display: inline-block;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.95rem;
  text-align: center;
  text-decoration: none;
  transition: background-color 0.2s, box-shadow 0.2s, transform 0.1s;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: #004182;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');


</style>
