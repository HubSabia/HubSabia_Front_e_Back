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
        <span class="logo-text">Hub-Sabiá</span>
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

          <li>
          <router-link to="/">
            <span> <li>
          <router-link to="/" class="nav-link" active-class="active">
            <i class="icon icon-user-settings"></i>
            <span>Vitrine de campanhas</span>
          </router-link>
        </li></span>
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
    </div>
  </aside>
</template>

<script setup>
import { isAdmin } from '@/utils/auth';
import { useLayoutStore } from '@/stores/layout';

const userIsAdmin = isAdmin();
const layoutStore = useLayoutStore();
</script>

<style scoped>

.sidebar {
  width: 260px;
  background-color: var(--sidebar-bg); /* Usa a cor definida no App.vue */
  color: var(--text-color-light);
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: 1px solid var(--border-color); /* Usa a cor de borda global */
  z-index: 1001;
  transition: left 0.3s ease;
}

.logo-container {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  gap: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1); /* Separador sutil */
  text-decoration: none;
  color: var(--text-color-light);
}
.logo-img { height: 40px; }
.logo-text { font-size: 1.5rem; font-weight: 600; }

.navigation ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.main-block .navigation { padding-top: 1rem; }
.footer-block { 
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1rem;
  padding-bottom: 1rem; 
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.9rem 1.5rem;
  color: var(--text-color-muted); /* Cor para texto secundário */
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--text-color-light);
}

.nav-link.active {
  background-color: rgba(0, 0, 0, 0.2);
  color: #ffffff;
  font-weight: 600;
  border-left-color: var(--primary-color); /* Usa a cor primária global */
}

.nav-link .icon {
  margin-right: 1rem;
  width: 24px;
  height: 24px;
  /* Seus ícones aqui */
}

/* ESTILOS PARA O OVERLAY E COMPORTAMENTO MOBILE */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6); /* Um pouco mais escuro para mais contraste */
  z-index: 1000;
}

@media (min-width: 768px) {
  .sidebar-overlay {
    display: none;
  }
}

@media (max-width: 767px) {
  .sidebar {
    left: -260px; /* Escondido por padrão */
  }
  .sidebar.is-mobile-open {
    left: 0; /* Aparece quando a classe é adicionada */
  }
}
</style>