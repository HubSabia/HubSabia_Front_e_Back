// Arquivo: backend/middlewares/admin.js

// Este middleware assume que o middleware de autenticação (auth.js)
// já foi executado e já anexou as informações do usuário (incluindo o 'role')
// ao objeto 'req'.

module.exports = function(req, res, next) {
    // 1. Verifica se a propriedade 'usuario' e 'usuario.role' existem.
    //    Isso é uma checagem de segurança para garantir que o authMiddleware rodou antes.
    if (!req.usuario || !req.usuario.role) {
        return res.status(401).json({ msg: 'Token inválido, informação de papel não encontrada.' });
    }

    // 2. A verificação principal: o papel do usuário é 'admin'?
    if (req.usuario.role !== 'admin') {
        // Se não for 'admin', retorna um erro 403 (Forbidden), 
        // que significa que o usuário está autenticado, mas não tem permissão para acessar este recurso.
        return res.status(403).json({ msg: 'Acesso negado. Requer privilégios de administrador.' });
    }

    // 3. Se o usuário for um admin, permite que a requisição prossiga para a rota final.
    next();
};
