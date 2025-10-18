<template>
  <header class="app-header">
    <div class="header-content">

      <button class="hamburger-button" @click="layoutStore.toggleSidebar">
        ☰
      </button>

      <!-- O título da página vindo do App.vue é exibido aqui -->
      <h1 class="page-title">{{ pageTitle }}</h1>

      <!-- O menu de usuário fica à direita -->
      <div class="user-menu" ref="userMenuRef">
        <!-- O botão é o conjunto de Nome + Avatar -->
        <button @click="toggleDropdown" class="user-button">
          <span class="user-name">{{ userName }}</span>
          <div class="user-avatar">{{ userInitial }}</div>
        </button>

        <!-- O dropdown agora contém 'Meu Perfil' e 'Sair' -->
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
  background-color: #ffffff;
  border-bottom: 1px solid #dee2e6;
  height: 70px;
  display: flex;
  align-items: center;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 30px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #212529;
}

.user-menu {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 20px;
}

.user-name {
  font-weight: 500;
  color: #495057;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #0d6efd;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
}

.dropdown-content {
  position: absolute;
  top: 120%;
  right: 0;
  background-color: white;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  border-radius: 8px;
  overflow: hidden;
  z-index: 100;
  width: 180px;
}

.dropdown-item {
  display: block;
  padding: 12px 16px;
  text-decoration: none;
  color: #495057;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.hamburger-button {
  display: none; /* Escondido por padrão */
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  margin-right: 1rem;
}

@media (max-width: 767px) {
  .hamburger-button {
    display: block; /* Aparece em telas de celular */
  }
}
</style>