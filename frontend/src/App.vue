<template>
  <div id="app" :class="{ 'login-layout': isLoginPage, 'main-layout': !isLoginPage }">
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

.content-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.main-layout .content-wrapper {
  margin-left: 260px; 
}

.main-content {
  flex-grow: 1;
  background-color: var(--content-bg);
  padding: 0;
  margin: 0;
}
</style>
