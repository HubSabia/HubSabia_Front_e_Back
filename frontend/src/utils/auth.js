import { jwtDecode } from 'jwt-decode';

/**
 * Decodifica o token JWT armazenado e retorna o payload do usuário.
 * @returns {object|null} O payload do usuário (com id, role) ou null se o token for inválido.
 */
export function getUserPayload() {
  const token = localStorage.getItem('authToken');
  if (!token) return null;

  try {
    const decodedToken = jwtDecode(token);
    // Verifica se o token tem a estrutura esperada
    if (decodedToken && decodedToken.usuario) {
      return decodedToken.usuario;
    }
    return null;
  } catch (error) {
    console.error("Token inválido ou expirado:", error);
    // Limpa um token inválido para evitar problemas
    localStorage.removeItem('authToken');
    return null;
  }
}

/**
 * Verifica se o usuário logado atualmente tem o papel de 'admin'.
 * @returns {boolean} True se o usuário for admin, false caso contrário.
 */
export function isAdmin() {
  const payload = getUserPayload();
  return payload ? payload.role === 'admin' : false;
}

/**
 * Retorna o nome do usuário logado (exemplo de outra função útil).
 * @returns {string|null} O nome do usuário ou null.
 */
export function getUserName() {
    const payload = getUserPayload();
    return payload ? payload.nome : null; // Supondo que você adicione 'nome' ao token no futuro
}