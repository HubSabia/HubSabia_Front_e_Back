<template>
  <div class="login-view">
    <div class="login-card">
      <div class="logo-area">
        <img src="/ifpr_logo_placeholder.svg" alt="Logo IFPR" class="logo-img">
        <h2 class="institution-name">INSTITUTO FEDERAL<br>Paraná</h2>
      </div>
      <h3 class="login-title">Acesso ao Sistema</h3>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Usuário ou Email</label>
          <input type="text" id="username" v-model="username" required placeholder="Digite seu usuário">
        </div>
        <div class="form-group">
          <label for="password">Senha</label>
          <input type="password" id="password" v-model="password" required placeholder="Digite sua senha">
        </div>
        <div class="form-actions">
           <a href="#" class="forgot-password">Esqueci minha senha</a>
           <button type="submit" class="btn btn-primary login-button">Entrar</button>
        </div>
         <div class="create-account-link">
            Não tem uma conta? <a href="#">Crie uma aqui</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';

const username = ref("");
const password = ref("");
const router = useRouter();
const instance = getCurrentInstance();

const handleLogin = () => {
  // Simulate login validation
  console.log("Login attempt:", username.value);
  // In a real app, validate credentials here
  if (username.value && password.value) {
    // Simulate successful login
    router.push("/dashboard");
  }
};

onMounted(() => {
  // Emit event to update page title (though Login might not need a header title)
  instance.emit("update-title", "Login - Projeto Integrador IFPR");
});

</script>

<style scoped>
.login-view {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5; /* Light grey background */
}

.login-card {
  background: #ffffff;
  padding: 40px 50px;
  border-radius: 8px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  text-align: center;
}

.logo-area {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 25px;
  gap: 15px;
}

.logo-img {
  height: 50px;
  /* Placeholder style */
  background-color: var(--sidebar-bg, #212529);
  padding: 5px;
  border-radius: 4px;
}

.institution-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--sidebar-bg, #212529);
    line-height: 1.3;
    text-align: left;
}

.login-title {
  margin-bottom: 30px;
  color: #333;
  font-weight: 600;
  font-size: 1.4rem;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #495057;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color, #007bff);
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 25px;
    margin-bottom: 20px;
}

.forgot-password {
    font-size: 0.85rem;
    color: var(--primary-color, #007bff);
    text-decoration: none;
}

.forgot-password:hover {
    text-decoration: underline;
}

.login-button {
    padding: 10px 25px;
}

.create-account-link {
    margin-top: 25px;
    font-size: 0.9rem;
    color: #6c757d;
}

.create-account-link a {
    color: var(--primary-color, #007bff);
    text-decoration: none;
    font-weight: 500;
}

.create-account-link a:hover {
    text-decoration: underline;
}

</style>