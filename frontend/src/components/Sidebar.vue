<template>
  <aside class="sidebar">
    <div class="logo-container">
      <img src="/ifpr_logo_placeholder.svg" alt="Logo IFPR" class="logo-img"> <!-- Placeholder -->
      <span class="logo-text">INSTITUTO FEDERAL<br>Paraná</span>
    </div>
    <nav class="navigation">
      <ul>
        <li>
          <router-link to="/dashboard" class="nav-link" active-class="active">
            <i class="icon icon-dashboard"></i> <!-- Placeholder for icon -->
            <span>Dashboard</span>
          </router-link>
        </li>
        <li>
          <router-link to="/campanhas" class="nav-link" active-class="active">
            <i class="icon icon-campaign"></i>
            <span>Campanhas</span>
          </router-link>
        </li>
        <li>
          <router-link to="/chatbot" class="nav-link" active-class="active">
            <i class="icon icon-chatbot"></i>
            <span>Chatbots</span>
          </router-link>
        </li>
        <li>
          <router-link to="/usuarios" class="nav-link" active-class="active">
            <i class="icon icon-users"></i>
            <span>Usuários</span>
          </router-link>
        </li>
       <li> <!-- Novo link adicionado -->
          <router-link to="/sobre-bot" class="nav-link" active-class="active">
            <i class="icon icon-info"></i> <!-- Placeholder para ícone de informação -->
            <span>Sobre o Bot</span>
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
  // Add actual logout logic here (e.g., clear token, redirect)
  console.log("Logout clicked");
  router.push("/"); // Redirect to login
};

// Placeholder for icon components or classes if using an icon library
</script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: var(--sidebar-bg, #212529);
  color: var(--text-color-light, #f8f9fa);
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  transition: width 0.3s ease;
}

.logo-container {
  display: flex;
  align-items: center;
  padding: 15px 25px;
  margin-bottom: 30px;
}

.logo-img {
  height: 40px; /* Adjust size as needed */
  margin-right: 15px;
  /* Basic white placeholder style */
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
  color: #adb5bd; /* Lighter grey for inactive links */
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
  font-size: 1.1rem; /* Adjust icon size */
  width: 20px; /* Ensure alignment */
  text-align: center;
  /* Add styles for actual icons here */
  display: inline-block; /* Basic placeholder */
  border: 1px solid #adb5bd; /* Placeholder border */
  border-radius: 3px;
  padding: 2px;
}

.nav-link.active .icon {
   border-color: var(--primary-color, #007bff);
   color: var(--primary-color, #007bff);
}

.sidebar-footer {
  margin-top: auto; /* Pushes footer to the bottom */
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
  /*Tablet(768px a 1024px)*/
@media (max-width: 1024px){
  .sidebar {
  width: 240px;
}
   .logo-text {
  font-size: 18px;
}
.nav-link {
  font-size: 18px; /* Adjust icon size */
}
}
  /*Mobile(767)*/
@media (max-width: 767px){
    .sidebar {
     width: 80px;
  
  }
}
</style>
