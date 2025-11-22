import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  // === ROTAS PÚBLICAS ===
  {
    path: '/', 
    name: 'Vitrine',
    component: () => import('@/views/VitrineView.vue'),
    meta: { title: 'Vitrine de Campanhas', public: true }
  },
  {
    path: '/login', 
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: 'Login', public: true }
  },
  {
    path: '/registrar',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { title: 'Registrar', public: true }
  },
  {
    path: '/login-success',
    name: 'LoginSuccess',
    component: () => import('@/views/LoginSuccessView.vue'),
    meta: { title: 'Login Success', public: true }
  },
  {
    path: '/chat-publico/:id',
    name: 'ChatPublico',
    component: () => import('@/views/PublicChatView.vue'),
    meta: { title: 'Assistente Virtual', public: true }
  },
  
  // === ROTAS PROTEGIDAS ===
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
    path: '/sobre',
    name: 'Sobre',
    component: () => import('@/views/SobreView.vue'),
    meta: { title: 'Sobre', requiresAuth: true }
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

  // === ROTA CATCH-ALL ===
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// Guard de navegação
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('authToken');

  // 1. Se a rota é pública, SEMPRE permite acesso
  if (to.meta.public) {
    // Exceção: se está logado e tenta acessar login/registro, vai para dashboard
    if (token && (to.name === 'Login' || to.name === 'Register')) {
      return next({ name: 'Dashboard' });
    }
    return next();
  }

  // 2. Se a rota requer autenticação
  if (to.meta.requiresAuth) {
    if (!token) {
      return next({ name: 'Login' });
    }
    return next();
  }

  // 3. Rota sem meta definida - permite por padrão
  next();
});

export default router;