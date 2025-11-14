<template>
  <div id="app">
    
    <!-- Layout para PÁGINAS PROTEGIDAS (Dashboard, Campanhas, etc.) -->
    <template v-if="!isPublicLayout">
      <MainSidebar />
      <div class="content-wrapper">
        <Header :pageTitle="currentPageTitle" />
        <main class="main-content">
          <router-view></router-view>
        </main>
      </div>
    </template>

    <!-- Layout para PÁGINAS PÚBLICAS (Vitrine, Login, Registro) -->
    <template v-else>
      <div class="content-wrapper-public">
        <PublicHeader />
        <main class="main-content">
          <router-view></router-view>
        </main>
      </div>
    </template>

  </div>
</template>

<script setup>
import { computed } from 'vue'; 
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

// Componentes de Layout
import MainSidebar from '@/components/MainSidebar.vue';
import Header from '@/components/Header.vue';
import PublicHeader from '@/components/PublicHeader.vue';

const route = useRoute();
const authStore = useAuthStore();
const isPublicLayout = computed(() => route.meta.public);


const currentPageTitle = computed(() => route.meta.title || 'Dashboard');

authStore.checkTokenExpiration();

</script>

<style>
html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
#app {
  display: flex;
  min-height: 100vh;
  width: 100%;
}
.main-layout {
  display: flex;
}
.public-layout {
  display: flex;
  flex-direction: column;
}
.content-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
  margin-left: 260px;
}
.content-wrapper-public {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.main-content {
  flex-grow: 1;
}
@media (max-width: 767px) {
  .content-wrapper {
    margin-left: 80px;
  }
}
</style>