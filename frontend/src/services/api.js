import axios from 'axios';

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

// Interceptador de resposta para lidar com erros de autenticação
apiClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Token inválido ou expirado
            localStorage.removeItem('authToken');
            window.location.href = '/#/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;