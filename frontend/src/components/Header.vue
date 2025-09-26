<template>
  <header class="app-header">
    <div class="header-content">
      <!-- Opcional: Título da página atual, se você quiser manter essa funcionalidade -->
      <h1 class="page-title">{{ pageTitle || 'Dashboard' }}</h1>

      <div class="user-menu" ref="userMenuRef">
        <!-- O botão que abre/fecha o menu -->
        <button @click="toggleDropdown" class="user-button">
          <span class="user-name">{{ userName }}</span>
          <div class="user-avatar">{{ userInitial }}</div>
        </button>

        <!-- O menu dropdown que aparece/desaparece -->
        <transition name="fade">
          <div v-if="isDropdownOpen" class="dropdown-content">
            <router-link to="/perfil" class="dropdown-item">
              <i class="icon-profile"></i> <!-- Placeholder de ícone -->
              <span>Meu Perfil</span>
            </router-link>
            <a href="#" @click.prevent="logout" class="dropdown-item">
              <i class="icon-logout"></i> <!-- Placeholder de ícone -->
              <span>Sair</span>
            </a>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { jwtDecode } from 'jwt-decode';

// Props para receber o título da página do App.vue
defineProps({
  pageTitle: String
});

const isDropdownOpen = ref(false);
const router = useRouter();
const userMenuRef = ref(null); // Para fechar o menu ao clicar fora

const userName = ref('Admin User'); // Valor padrão
const userInitial = ref('A'); // Valor padrão

// Função para buscar o nome do usuário do token
const loadUserData = () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      // Supondo que o nome esteja no token ou que possamos pegá-lo
      // Se não, você pode buscar os dados do usuário aqui com uma chamada de API
      userName.value = decoded.usuario.nome || 'Usuário';
      userInitial.value = (decoded.usuario.nome || 'A').charAt(0).toUpperCase();
    } catch (e) {
      console.error("Erro ao decodificar token no Header:", e);
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
// Lógica para fechar o menu se o usuário clicar fora dele
const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};

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
  background-color: var(--header-bg, #ffffff);
  border-bottom: 1px solid var(--border-color, #dee2e6);
  padding: 0 30px;
  height: 70px;
  display: flex;
  align-items: center;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color, #212529);
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
  padding: 8px;
  border-radius: 20px;
  transition: background-color 0.2s;
}

.user-button:hover {
  background-color: #f1f1f1;
}

.user-name {
  font-weight: 500;
  color: #495057;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--primary-color, #007bff);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
}

.dropdown-content {
  position: absolute;
  top: 110%;
  right: 0;
  background-color: white;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  border-radius: 8px;
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
  color: #495057;
  font-size: 0.95rem;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

/* Animação de fade para o dropdown */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
