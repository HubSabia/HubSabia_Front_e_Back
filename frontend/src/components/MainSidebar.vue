<template>
  <aside class="sidebar">
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
    </div>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { isAdmin } from '@/utils/auth';

const router = useRouter();
const userIsAdmin = isAdmin();

const logout = () => {
  localStorage.removeItem('authToken');
  router.push("/login");
};
</script>

<style scoped>
/* ESTILOS ATUALIZADOS PARA O NOVO DESIGN */

.sidebar {
  width: 260px;
  background-color: #1f2937; /* Cinza escuro azulado */
  color: #d1d5db; /* Cinza claro */
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: 1px solid #374151;
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
  color: #9ca3af; /* Cinza médio */
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
  background-color: #111827; /* Fundo mais escuro para ativo */
  color: #ffffff;
  font-weight: 600;
  border-left-color: #3b82f6; /* Azul vibrante */
}

.nav-link .icon {
  margin-right: 1rem;
  width: 24px;
  height: 24px;
  /* Seus ícones aqui */
}

.sidebar-footer {
  padding: 0 1.5rem;
}

.btn-logout {
  width: 100%;
  padding: 10px;
  background-color: #374151;
  color: #d1d5db;
  border: 1px solid #4b5563;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  text-align: center;
  transition: background-color 0.2s ease;
}

.btn-logout:hover {
  background-color: #4b5563;
  color: #ffffff;
}
</style>
