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

const currentPageTitle = computed(() => route.meta.title || 'Dashboard');
const isLoginPage = computed(() => route.name === 'Login' || route.name === 'Register');

</script>

<style>

html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 3. ESTRUTURA DE LAYOUT SIMPLIFICADA E ROBUSTA */
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
}

.content-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
}

.main-layout .content-wrapper {
  margin-left: 260px; /* Largura padrão da Sidebar */
}

.main-content {
  flex-grow: 1;
}

/* 5. RESPONSIVIDADE DO LAYOUT PRINCIPAL */
@media (max-width: 767px) {
  .main-layout .content-wrapper {
    margin-left: 80px; /* Largura da sidebar compacta */
  }
}
</style>