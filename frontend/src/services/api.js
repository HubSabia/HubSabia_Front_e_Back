import axios from 'axios';
import { useToast } from "vue-toastification";

// Cria uma instância do axios com a URL base da API
const apiClient = axios.create({
    baseURL: 'https://hubsabia-backend-vdl8.onrender.com/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptador de requisição para adicionar token automaticamente
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('authToken');
    
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Interceptador de resposta para lidar com erros de forma consistente
apiClient.interceptors.response.use(
    response => response,
    error => {
        // Tenta obter a instância do toast (só funciona dentro de componentes Vue)
        let toast;
        try {
            toast = useToast();
        } catch (e) {
            // Se não estiver em um componente, apenas loga no console
            console.error('Erro na API:', error);
        }

        // Tratamento de erro 401 (não autenticado)
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            window.location.href = '/#/login';
            if (toast) toast.error('Sua sessão expirou. Faça login novamente.');
            return Promise.reject(error);
        }

        // Tratamento de erro 403 (sem permissão)
        if (error.response?.status === 403) {
            if (toast) toast.error('Você não tem permissão para realizar esta ação.');
            return Promise.reject(error);
        }

        // Tratamento de erro 404 (não encontrado)
        if (error.response?.status === 404) {
            if (toast) toast.error('Recurso não encontrado.');
            return Promise.reject(error);
        }

        // Tratamento de erro 429 (muitas requisições)
        if (error.response?.status === 429) {
            const message = error.response?.data?.msg || 'Você está fazendo muitas requisições. Aguarde um momento.';
            if (toast) toast.warning(message);
            return Promise.reject(error);
        }

        // Para outros erros, não mostra toast automaticamente
        // Deixa o componente decidir se quer mostrar
        return Promise.reject(error);
    }
);

export default apiClient;