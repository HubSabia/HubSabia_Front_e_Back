import { computed } from 'vue';
import { jwtDecode } from 'jwt-decode';

/**
 * Composable para gerenciar permissões de usuário
 * Uso: const { isAdmin, canEdit, canDelete } = usePermissions();
 */
export function usePermissions() {
    /**
     * Obtém os dados do usuário logado do token
     */
    const getCurrentUser = () => {
        const token = localStorage.getItem('authToken');
        if (!token) return null;

        try {
            const decoded = jwtDecode(token);
            return decoded.usuario; // { id, role, nome }
        } catch (error) {
            console.error('Token inválido:', error);
            return null;
        }
    };

    const currentUser = computed(() => getCurrentUser());

    /**
     * Verifica se o usuário é administrador
     */
    const isAdmin = computed(() => {
        return currentUser.value?.role === 'admin';
    });

    /**
     * Verifica se o usuário é o criador do item
     * @param {Object} item - Item com propriedade 'criador'
     * @returns {Boolean}
     */
    const isOwner = (item) => {
        if (!currentUser.value || !item) return false;
        
        // Se 'criador' é um objeto (populado), usa criador._id
        const criadorId = item.criador?._id || item.criador;
        
        return criadorId === currentUser.value.id;
    };

    /**
     * Verifica se o usuário pode editar o item
     * Regra: Admin ou dono podem editar
     * @param {Object} item - Item a ser verificado
     * @returns {Boolean}
     */
    const canEdit = (item) => {
        return isAdmin.value || isOwner(item);
    };

    /**
     * Verifica se o usuário pode excluir o item
     * Regra: Admin ou dono podem excluir
     * @param {Object} item - Item a ser verificado
     * @returns {Boolean}
     */
    const canDelete = (item) => {
        return isAdmin.value || isOwner(item);
    };

    /**
     * Verifica se o usuário pode visualizar o item
     * Regra: Todos podem visualizar (override se necessário)
     * @param {Object} item - Item a ser verificado
     * @returns {Boolean}
     */
    const canView = (item) => {
        // Por padrão, todos podem visualizar
        // Você pode adicionar lógica específica aqui se necessário
        return true;
    };

    return {
        currentUser,
        isAdmin,
        isOwner,
        canEdit,
        canDelete,
        canView
    };
}