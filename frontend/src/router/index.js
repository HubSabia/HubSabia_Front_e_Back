import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  // ROTAS PÚBLICAS PRIMEIRO (ordem importa!)
  {
    path: '/chat-publico/:id',
    name: 'ChatPublico',
    component: () => import('@/views/PublicChatView.vue'),
    meta: { title: 'Assistente Virtual', public: true }
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
    meta: { public: true }
  },
  
  // ROTAS PROTEGIDAS
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
    meta: { title: 'Sobre', requiresAuth: true}
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
  
  // VITRINE POR ÚLTIMO (rota catch-all)
  {
    path: '/', 
    name: 'Vitrine',
    component: () => import('@/views/VitrineView.vue'),
    meta: { title: 'Vitrine de Campanhas', public: true }
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('authToken');
  const requiresAuth = to.meta.requiresAuth;
  const isPublic = to.meta.public;
  const isAuthPage = to.name === 'Login' || to.name === 'Register';

  console.log('Navegando para:', to.path, 'Params:', to.params); // Debug

  // Se a rota requer autenticação e não há token, redireciona para o login.
  if (requiresAuth && !token) {
    return next({ name: 'Login' });
  }

  // Se o usuário está logado e tenta acessar uma página de autenticação (Login/Registro),
  // redireciona para o dashboard.
  if (isAuthPage && token) {
    return next({ name: 'Dashboard' });
  }

  // Para todas as outras situações (páginas públicas, ou páginas protegidas com token),
  // permite a navegação.
  next();
});

export default router;