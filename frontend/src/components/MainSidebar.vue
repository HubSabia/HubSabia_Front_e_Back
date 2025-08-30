<template>
  <aside class="sidebar">
    <div class="logo-container">
      <img src="/ifpr_logo_placeholder.svg" alt="Logo IFPR" class="logo-img">
      <span class="logo-text">INSTITUTO FEDERAL<br>Paraná</span>
    </div>
    <nav class="navigation">
      <ul>
        <li>
          <router-link to="/dashboard" class="nav-link" active-class="active">
            <i class="icon icon-dashboard"></i>
            <span>Dashboard</span>
          </router-link>
        </li>
        <li class="nav-divider"></li>
        <li>
          <router-link to="/editais" class="nav-link" active-class="active">
            <i class="icon icon-document"></i>
            <span>Editais</span>
          </router-link>
        </li>
        <li>
          <router-link to="/campanhas" class="nav-link hierarchy-level-1" active-class="active">
            <i class="icon icon-campaign"></i>
            <span>Campanhas</span>
          </router-link>
        </li>
        <li>
          <router-link to="/gerencia" class="nav-link hierarchy-level-2" active-class="active">
            <i class="icon icon-chatbot"></i>
            <span>Chatbots</span>
          </router-link>
        </li>
        <li class="nav-divider"></li>
        <li>
          <router-link to="/usuarios" class="nav-link" active-class="active">
            <i class="icon icon-users"></i>
            <span>Usuários</span>
          </router-link>
        </li>
      </ul>
    </nav>
    <div class="sidebar-footer">
       <button @click="logout" class="btn btn-logout">Sair</button>
    </div>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const logout = () => {
  // Limpa o token de autenticação
  localStorage.removeItem('authToken');
  // Redireciona para login
  router.push("/login");
};
</script>

<style scoped>
.sidebar {
  width: 260px;
  background-color: var(--sidebar-bg, #212529);
  color: var(--text-color-light, #f8f9fa);
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  transition: width 0.3s ease;
  z-index: 1000;
}

.logo-container {
  display: flex;
  align-items: center;
  padding: 15px 25px;
  margin-bottom: 30px;
}

.logo-img {
  height: 40px;
  margin-right: 15px;
  background-color: #fff;
  border-radius: 4px;
  padding: 5px;
}

.logo-text {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.3;
}

.navigation ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 15px 25px;
  color: #adb5bd;
  text-decoration: none;
  transition: background-color 0.2s ease, color 0.2s ease, border-left-color 0.2s ease;
  border-left: 4px solid transparent;
  margin: 5px 0;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: #f8f9fa;
  border-left-color: rgba(255, 255, 255, 0.2);
}

.nav-link.active {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  font-weight: 500;
  border-left-color: var(--primary-color, #007bff);
}

.nav-link .icon {
  margin-right: 15px;
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
  display: inline-block;
  border: 1px solid #adb5bd;
  border-radius: 3px;
  padding: 2px;
}

.nav-link.active .icon {
   border-color: var(--primary-color, #007bff);
   color: var(--primary-color, #007bff);
}

/* Hierarquia visual */
.hierarchy-level-1 {
  padding-left: 35px !important;
}

.hierarchy-level-2 {
  padding-left: 45px !important;
}

.nav-divider {
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 15px 25px;
  list-style: none;
}

.sidebar-footer {
  margin-top: auto;
  padding: 20px 25px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-logout {
  width: 100%;
  padding: 10px;
  background-color: var(--secondary-color, #6c757d);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  text-align: center;
  transition: background-color 0.2s ease;
}

.btn-logout:hover {
  background-color: #5a6268;
}

@media (max-width: 1024px){
  .sidebar {
    width: 240px;
  }
  .logo-text {
    font-size: 18px;
  }
  .nav-link {
    font-size: 18px;
  }
}

@media (max-width: 767px){
  .sidebar {
    width: 80px;
  }
  .logo-text {
    display: none;
  }
  .nav-link span {
    display: none;
  }
}
</style>