import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { jwtDecode } from 'jwt-decode';

export const useAuthStore = defineStore('auth', () => {
    // ESTADO: Armazena o token e as informações do usuário
    const token = ref(localStorage.getItem('authToken'));
    const user = ref(token.value ? jwtDecode(token.value).usuario : null);

    // GETTERS (COMPUTED): Informações derivadas do estado
    const isAuthenticated = computed(() => !!token.value);
    const isAdmin = computed(() => user.value?.role === 'admin');

    // AÇÕES (FUNCTIONS): Funções que modificam o estado
    function login(newToken) {
        token.value = newToken;
        localStorage.setItem('authToken', newToken);
        user.value = jwtDecode(newToken).usuario;
    }

    function logout() {
        token.value = null;
        user.value = null;
        localStorage.removeItem('authToken');
        // Redireciona para a página de login
        window.location.href = '/login';
    }

    // Retorna tudo o que os componentes precisam acessar
    return { token, user, isAuthenticated, isAdmin, login, logout };
});