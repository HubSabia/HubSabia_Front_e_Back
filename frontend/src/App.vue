<template>
  <div id="app" :class="[{ 'login-layout': isLoginPage, 'main-layout': !isLoginPage }, routePageClass]">
    <MainSidebar v-if="!isLoginPage" />
    <div class="content-wrapper">
      <Header v-if="!isLoginPage" :pageTitle="currentPageTitle" />
      <main class="main-content">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'; 
import { useRoute } from 'vue-router';
import MainSidebar from '@/components/MainSidebar.vue';
import Header from '@/components/Header.vue';

const route = useRoute();

const currentPageTitle = computed(() => {
  return route.meta.title || 'Home';
});

const isLoginPage = computed(() => route.name === 'Login' || route.name === 'Register');
const routePageClass = computed(() => {
  // Converte o nome da rota para um formato de classe CSS (ex: 'Dashboard' -> 'dashboard-page')
  return route.name ? `${route.name.toLowerCase()}-page` : '';
});
</script>


<style>
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
  --font-family: system-ui, Avenir, Helvetica, Arial, sans-serif, 'Inter';
  line-height: 1.5;
  font-weight: 400;
  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #F2F2F2;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  }

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
  font-family: var(--font-family);
  background-color: var(--content-bg);
  color: var(--text-color);
  line-height: 1.6;
}
#app {
  display: flex;
  min-height: 100vh;
  max-width: 1280px;
  margin: 0 auto;
  text-align: center;
}
.main-layout {
  display: flex;
  width: 100%;
}

.content-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

#app.main-layout .content-wrapper {
  margin-left: 260px; /* Margem padrão quando o sidebar está presente */
}
#app.main-layout.dashboard-page .content-wrapper{
  margin-left: 160px !important; /* Mude para o valor desejado */
}

.main-content {
  flex-grow: 1;
  background-color: var(--content-bg);
  padding: 0;
  margin: 0;
}
a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}
a:hover {
  color: #535bf2;
}
h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:hover {
  border-color: #646cff;
}
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

.card {
  padding: 2em;
}
@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  a:hover {
    color: #747bff;
  }
  button {
    background-color: #f9f9f9;
  }
}
</style>
