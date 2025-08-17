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
    path: '/', // Faz a página inicial redirecionar para o login
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
    path: '/chatbots',
    name: 'Chatbots',
    component: () => import('@/views/ChatbotsView.vue'),
    meta: { title: 'Gestão de Chatbots', requiresAuth: true }
  },
  {
    path: '/usuarios',
    name: 'Usuarios',
    component: () => import('@/views/UsersView.vue'),
    meta: { title: 'Gestão de Usuários', requiresAuth: true }
  },
 {
    path: '/editais', // Novo caminho
    name: 'Editais',   // Novo nome
    component: () => import('@/views/EditaisView.vue'), // Nova view
    meta: { title: 'Gestão de Editais', requiresAuth: true }
  },
  {
    path: '/chatbot',
    name: 'ChatBot',
    component: () => import('@/views/ChatBotView.vue'),
    meta: { title: 'Chat Bot', requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;