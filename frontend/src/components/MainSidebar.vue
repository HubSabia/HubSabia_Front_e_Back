<template>
  <!-- O overlay que escurece o fundo e fecha a sidebar ao ser clicado -->
  <div 
    v-if="layoutStore.isSidebarVisible" 
    class="sidebar-overlay" 
    @click="layoutStore.closeSidebar"
  ></div>

  <!-- A sidebar em si. A classe 'is-mobile-open' controla sua visibilidade em telas pequenas -->
  <aside class="sidebar" :class="{ 'is-mobile-open': layoutStore.isSidebarVisible }">
    <!-- Bloco Superior: Logo e Ações Principais -->
    <div class="main-block">
      <router-link to="/dashboard" class="logo-container">
        <img src="/ifpr_logo_placeholder.svg" alt="Logo IFPR" class="logo-img">
        <span class="logo-text">Hub-SabIA</span>
      </router-link>
      <nav class="navigation">
        <ul>
          <li>
            <router-link to="/editais" class="nav-link" active-class="active">
              <i class="icon icon-books"></i>
              <span>Biblioteca de Editais</span>
            </router-link>
          </li>
          <li>
            <router-link to="/campanhas" class="nav-link" active-class="active">
              <i class="icon icon-idea"></i>
              <span>Gerenciar Campanhas</span>
            </router-link>
          </li>
          <li>
            <router-link to="/chatbots" class="nav-link" active-class="active">
              <i class="icon icon-bot"></i>
              <span>Gerenciar Chatbots</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Bloco Inferior: Navegação Secundária e Ações -->
    <div class="footer-block">
      <nav class="navigation">
        <ul>
          <li>
            <router-link to="/sobre" class="nav-link" active-class="active">
              <i class="icon icon-about"></i>
              <span>Sobre</span>
            </router-link>
          </li>
          <li>
            <router-link to="/dashboard" class="nav-link" active-class="active">
              <i class="icon icon-home"></i>
              <span>Home</span>
            </router-link>
          </li>
          <li v-if="userIsAdmin">
            <router-link to="/usuarios" class="nav-link" active-class="active">
              <i class="icon icon-user-settings"></i>
              <span>Gerenciar Usuários</span>
            </router-link>
          </li>
        </ul>
      </nav>
      <!-- O footer com o botão Sair foi removido daqui e movido para o Header.vue -->
    </div>
  </aside>
</template>

<script setup>
import { isAdmin } from '@/utils/auth';
// MUDANÇA: Importamos a store de layout que controla a visibilidade
import { useLayoutStore } from '@/stores/layout';

const userIsAdmin = isAdmin();
// MUDANÇA: Criamos uma instância da store para usar no template
const layoutStore = useLayoutStore();
</script>

<style scoped>
/* ESTILOS ATUALIZADOS PARA O NOVO DESIGN RESPONSIVO */
.sidebar {
  width: 260px;
  background-color: #14333A;
  color: #E3E3E3;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: 1px solid #134EB3;
  z-index: 1001; /* Fica na frente do overlay */
  transition: left 0.3s ease; /* Anima o deslizamento */
}

.logo-container {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  gap: 0.75rem;
  border-bottom: 1px solid #374151;
  text-decoration: none;
  color: #ffffff;
}
.logo-img { height: 40px; }
.logo-text { font-size: 1.5rem; font-weight: 600; }

.navigation ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.main-block .navigation { padding-top: 1rem; }
.footer-block { padding-bottom: 1rem; }

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.9rem 1.5rem;
  color: #9ca3af;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
}

.nav-link:hover {
  background-color: #374151;
  color: #ffffff;
}

.nav-link.active {
  background-color: #111827;
  color: #ffffff;
  font-weight: 600;
  border-left-color: #3b82f6;
}

.nav-link .icon {
  margin-right: 1rem;
  width: 24px;
  height: 24px;
}

/* ESTILOS PARA O OVERLAY E COMPORTAMENTO MOBILE */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000; /* Fica atrás da sidebar */
}

@media (min-width: 768px) {
  /* Em telas grandes, o overlay nunca aparece */
  .sidebar-overlay {
    display: none;
  }
}

@media (max-width: 767px) {
  /* Em telas pequenas, a sidebar fica escondida por padrão */
  .sidebar {
    left: -260px;
  }
  /* Quando a classe é adicionada via store, a sidebar aparece */
  .sidebar.is-mobile-open {
    left: 0;
  }
}
</style>