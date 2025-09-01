<template>
  <div id="app" :class="{ 'login-layout': isLoginPage, 'main-layout': !isLoginPage }">
    <Sidebar v-if="!isLoginPage" />
    <div class="content-wrapper">
      <Header v-if="!isLoginPage" :pageTitle="currentPageTitle" />
      <main class="main-content">
        <router-view @update-title="updatePageTitle"></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';

const route = useRoute();
const currentPageTitle = ref('Dashboard'); // Default title

const isLoginPage = computed(() => route.name === 'Login');

// Function to update the header title based on the current view
const updatePageTitle = (title) => {
  currentPageTitle.value = title;
};

// Optionally, watch the route to set title if views don't emit
// watch(route, (newRoute) => {
//   currentPageTitle.value = newRoute.meta.title || 'Admin';
// }, { immediate: true });

</script>

<style>
/* Global styles & Formal Theme */
:root {
  --primary-color: #0056b3; /* Formal Blue */
  --secondary-color: #6c757d; /* Formal Grey */
  --sidebar-bg: #212529; /* Dark Sidebar */
  --header-bg: #ffffff; /* White Header */
  --content-bg: #f8f9fa; /* Light Grey Content BG */
  --text-color: #212529;
  --text-color-light: #f8f9fa;
  --border-color: #dee2e6;
  --card-bg: #ffffff;
  --font-family: 'Inter', sans-serif; /* Formal, clean font */
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family);
  background-color: var(--content-bg);
  color: var(--text-color);
  line-height: 1.6;
}

#app {
  display: flex;
  min-height: 100vh;
}

.main-layout {
  display: flex;
  width: 100%;
}

.login-layout {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #e9ecef; /* Slightly different bg for login */
}

.content-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  margin-left: 260px; /* Sidebar width */
  transition: margin-left 0.3s ease;
}

.main-content {
  flex-grow: 1;
  padding: 30px;
  background-color: var(--content-bg);
}

/* Basic Button Styles (can be componentized later) */
.btn {
  display: inline-block;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.95rem;
  text-align: center;
  text-decoration: none;
  transition: background-color 0.2s, box-shadow 0.2s, transform 0.1s;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: darken(var(--primary-color), 10%);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: white;
}

.btn-secondary:hover {
  background-color: darken(var(--secondary-color), 10%);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.login-layout .content-wrapper {
  margin-left: 0;
}

.login-layout .main-content {
  padding: 0;
}

/* Add Google Font */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

</style>