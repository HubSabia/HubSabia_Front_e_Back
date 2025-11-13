<template>
  <!-- A classe agora é controlada pela 'isAuthenticated' da nossa store -->
  <div id="app" :class="{ 'public-layout': !authStore.isAuthenticated, 'main-layout': authStore.isAuthenticated }">
    
    <!-- Layout para usuários logados -->
    <template v-if="authStore.isAuthenticated">
      <MainSidebar />
      <div class="content-wrapper">
        <Header :pageTitle="currentPageTitle" />
        <main class="main-content">
          <router-view></router-view>
        </main>
      </div>
    </template>

    <!-- Layout para visitantes (páginas públicas) -->
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
import { useAuthStore } from '@/stores/authStore'; // <-- 1. Importe a store

// Componentes de Layout
import MainSidebar from '@/components/MainSidebar.vue';
import Header from '@/components/Header.vue';
import PublicHeader from '@/components/PublicHeader.vue'; // <-- 2. Importe o novo cabeçalho

const route = useRoute();
const authStore = useAuthStore(); // <-- 3. Inicialize a store

const currentPageTitle = computed(() => route.meta.title || 'Dashboard');

// Opcional: Verifica se o token expirou toda vez que o app carrega
authStore.checkTokenExpiration();

</script>

<style>
/* Seus estilos originais com algumas adaptações */
html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

/* Layout principal para usuários logados */
.main-layout {
  display: flex;
}

/* Layout para páginas públicas (vitrine, login, etc.) */
.public-layout {
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
  margin-left: 260px; /* Largura padrão da Sidebar */
}

/* Wrapper para o conteúdo público, não tem margem da sidebar */
.content-wrapper-public {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex-grow: 1;
}

/* Estilos de responsividade */
@media (max-width: 767px) {
  .content-wrapper {
    margin-left: 80px; /* Largura da sidebar compacta */
  }
}
</style>