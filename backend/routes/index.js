// Em frontend/src/router/index.js
{
  path: '/chat-publico/:id',
  name: 'ChatPublico',
  component: () => import('@/views/PublicChatView.vue'),
  // SEM 'requiresAuth: true' AQUI
  meta: { title: 'Assistente Virtual' } 
},
