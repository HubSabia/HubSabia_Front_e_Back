import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/login', 
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: 'Login' }
  },
  {
    path: '/registrar',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { title: 'Registrar' }
  },
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { title: 'Dashboard', requiresAuth: true }
  },
  {
    path: '/campanhas',
    name: 'Campanhas',
    component: () => import('@/views/CampaignsView.vue'),
    meta: { title: 'Gestão de Campanhas', requiresAuth: true }
  },
  {
    path: '/usuarios',
    name: 'Usuarios',
    component: () => import('@/views/UsersView.vue'),
    meta: { title: 'Gestão de Usuários', requiresAuth: true }
  },
  {
    path: '/editais',
    name: 'Editais',
    component: () => import('@/views/EditaisView.vue'),
    meta: { title: 'Gestão de Editais', requiresAuth: true }
  },
  {
    path: '/chatbot:id',
    name: 'ChatBot',
    component: () => import('@/views/ChatBotView.vue'),
    meta: { title: 'Conversa com o ChatBot', requiresAuth: true }
  },
  {
    path: '/chatbots',
    name: 'ChatBots',
    component: () => import('@/views/ChatbotsView.vue'),
    meta: { title: 'Gestão de Chatbots', requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// Guard de navegação para verificar autenticação
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('authToken');
  
  if (to.meta.requiresAuth && !token) {
    // Se a rota requer autenticação mas não há token, redireciona para login
    next('/login');
  } else if (to.name === 'Login' && token) {
    // Se já está logado e tenta acessar login, redireciona para dashboard
    next('/dashboard');
  } else {
    next();
  }
});

export default router;