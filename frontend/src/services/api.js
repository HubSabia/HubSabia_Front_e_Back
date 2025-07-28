import axios from 'axios';

// Cria uma instância do axios com a URL base da sua API
const apiClient = axios.create({
    baseURL: 'https://hubsabia-backend-vdl8.onrender.com', // A base de todas as suas rotas de API
    headers: {
        'Content-Type': 'application/json'
    }
});

// Isso é um interceptador. Ele "intercepta" cada requisição ANTES de ela ser enviada.
apiClient.interceptors.request.use(config => {
    // Pega o token do localStorage
    const token = localStorage.getItem('authToken'); // Usamos a chave que definimos no login

    // Se o token existir, adiciona ele ao cabeçalho 'x-auth-token'
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config; // Retorna a configuração modificada para o axios continuar a requisição
},
error => {
    return Promise.reject(error);
});

export default apiClient;