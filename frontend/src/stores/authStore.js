// Em frontend/src/stores/authStore.js

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
    // ---- ESTADO (State) ----
    const token = ref(localStorage.getItem('authToken'));
    const user = ref(token.value ? jwtDecode(token.value).usuario : null);

    const router = useRouter();

    // ---- GETTERS (Computados) ----
    const isAuthenticated = computed(() => !!token.value);
    const isAdmin = computed(() => user.value?.role === 'admin');

    // ---- AÇÕES (Actions) ----
    function login(newToken) {
        token.value = newToken;
        localStorage.setItem('authToken', newToken);
        try {
            user.value = jwtDecode(newToken).usuario;
        } catch (error) {
            console.error('Erro ao decodificar o token:', error);
            logout();
        }
    }

    function logout() {
        token.value = null;
        user.value = null;
        localStorage.removeItem('authToken');
        router.push('/login');
    }

    // ==========================================================
    // --- ESTA É A FUNÇÃO QUE ESTÁ FALTANDO ---
    // ==========================================================
    function checkTokenExpiration() {
        if (token.value) {
            try {
                const decodedToken = jwtDecode(token.value);
                // O tempo de expiração 'exp' está em segundos, Date.now() em milissegundos
                if (decodedToken.exp * 1000 < Date.now()) {
                    console.log("Token expirado. Deslogando...");
                    logout(); // Se o token expirou, desloga o usuário
                }
            } catch (error) {
                console.error("Token inválido no localStorage. Limpando...");
                logout();
            }
        }
    }

    // ==========================================================
    // --- GARANTA QUE A FUNÇÃO ESTÁ SENDO RETORNADA AQUI ---
    // ==========================================================
    return { 
        token, 
        user, 
        isAuthenticated, 
        isAdmin, 
        login, 
        logout,
        checkTokenExpiration // <-- ELA PRECISA ESTAR NO 'return'
    };
});