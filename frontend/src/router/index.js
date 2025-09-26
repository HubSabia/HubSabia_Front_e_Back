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
    path: '/perfil',
    name: 'Perfil',
    component: () => import('@/views/ProfileView.vue'),
    meta: { title: 'Meu Perfil', requiresAuth: true }
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
    path: '/chatbots',
    name: 'Chatbots',
    component: () => import('@/views/GerenciaChatbots.vue'),
    meta: { title: 'Gestão de Chatbots', requiresAuth: true }
  },
  {
    path: '/chatbot/:id',
    name: 'ChatBot',
    component: () => import('@/views/ConversaChatbot.vue'),
    meta: { title: 'Conversa com o ChatBot', requiresAuth: true }
  },
  {
    path: '/chat-publico/:id',
    name: 'ChatPublico',
    component: () => import('@/views/PublicChatView.vue'),
    meta: { title: 'Assistente Virtual' } // Rota pública, sem 'requiresAuth'
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('authToken');
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  if (requiresAuth && !token) {
    next('/login');
  } else if ((to.name === 'Login' || to.name === 'Register') && token) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
