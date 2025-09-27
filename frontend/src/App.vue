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
  return route.meta.title || 'Dashboard';
});

const isLoginPage = computed(() => route.name === 'Login' || route.name === 'Register');
</script>


<style>
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