<template>
  <header class="app-header">
    <div class="header-content">
      <!-- Botão Hambúrguer para telas pequenas -->
      <button class="hamburger-button" @click="layoutStore.toggleSidebar">
        <!-- Substitua por um ícone SVG para um visual mais profissional -->
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>

      <!-- Título da Página -->
      <h1 class="page-title">{{ pageTitle }}</h1>

      <!-- Menu de Usuário -->
      <div class="user-menu" ref="userMenuRef">
        <button @click="toggleDropdown" class="user-button">
          <span class="user-name">{{ userName }}</span>
          <div class="user-avatar">{{ userInitial }}</div>
        </button>
        <transition name="fade">
          <div v-if="isDropdownOpen" class="dropdown-content">
            <router-link to="/perfil" class="dropdown-item">Meu Perfil</router-link>
            <a href="#" @click.prevent="logout" class="dropdown-item">Sair</a>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { jwtDecode } from 'jwt-decode';
import { useLayoutStore } from '@/stores/layout';

defineProps({
  pageTitle: String
});

const layoutStore = useLayoutStore(); // Usa a store no componente
const isDropdownOpen = ref(false);
const router = useRouter();
const route = useRoute();
const userMenuRef = ref(null);
const userName = ref('Usuário');
const userInitial = ref('U');

const loadUserData = () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      if (decoded && decoded.usuario && decoded.usuario.nome) {
        userName.value = decoded.usuario.nome;
        userInitial.value = decoded.usuario.nome.charAt(0).toUpperCase();
      }
    } catch (e) {
      console.error("Token inválido:", e);
    }
  }
};

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const logout = () => {
  localStorage.removeItem('authToken');
  router.push('/login');
};

const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};

watch(() => route.name, () => {
  loadUserData();
});

onMounted(() => {
  loadUserData();
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>

<style scoped>
.app-header {
  background-color: var(--header-bg);
  border-bottom: 1px solid var(--border-color);
  padding: 0 1.5rem; /* Espaçamento padrão */
  height: 70px;
  display: flex;
  align-items: center;
  position: sticky; /* Mantém o header no topo ao rolar */
  top: 0;
  z-index: 999;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.hamburger-button {
  display: none; /* Escondido em telas grandes */
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  margin-right: 1rem;
  color: var(--text-color-dark);
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color-dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-menu {
  position: relative;
  display: flex;
  align-items: center;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 20px;
  transition: background-color 0.2s;
}

.user-button:hover {
  background-color: #f1f1f1;
}

.user-name {
  font-weight: 500;
  color: var(--text-color-muted);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: var(--text-color-light);
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  text-transform: uppercase;
}

.dropdown-content {
  position: absolute;
  top: 120%;
  right: 0;
  background-color: var(--card-bg);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  z-index: 100;
  width: 180px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  text-decoration: none;
  color: var(--text-color-dark);
  font-size: 0.95rem;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

/* Animação */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* RESPONSIVIDADE */
@media (max-width: 767px) {
  .app-header {
    padding: 0 1rem; /* Menor espaçamento em telas pequenas */
  }

  .hamburger-button {
    display: block; /* Mostra o botão hambúrguer */
  }

  .page-title {
    /* Centraliza o título quando o nome do usuário some */
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  /* Esconde o nome do usuário para economizar espaço */
  .user-name {
    display: none;
  }
}
</style>