// Arquivo: backend/routes/usuarios.js

const express = require('express');
const router = express.Router();

// Importamos nossos middlewares e o modelo de Usuário
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');
const Usuario = require('../models/Usuario');

// ====================================================================
// ROTA GET: Listar todos os usuários (Apenas para Administradores)
// ====================================================================
// Para proteger esta rota, passamos um array de middlewares.
// O Express executará cada um em sequência: primeiro o auth, depois o admin.
router.get('/', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        // Busca todos os documentos na coleção de usuários.
        // O '.select('-senha_hash')' é CRUCIAL para garantir que nunca
        // enviemos o hash da senha dos usuários para o frontend.
        const usuarios = await Usuario.find().select('-senha_hash').sort({ createdAt: -1 });
        
        res.json(usuarios);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor.');
    }
});


// ====================================================================
// ROTA PUT: Atualizar o papel de um usuário (Apenas para Administradores)
// ====================================================================
router.put('/:id/role', [authMiddleware, adminMiddleware], async (req, res) => {
    const { role } = req.body;

    // Validação simples para garantir que o novo papel é válido
    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ msg: 'Papel inválido.' });
    }

    try {
        let usuario = await Usuario.findById(req.params.id);

        if (!usuario) {
            return res.status(404).json({ msg: 'Usuário não encontrado.' });
        }

        usuario.role = role;
        await usuario.save();

        // Retorna o usuário atualizado (sem o hash da senha)
        const usuarioAtualizado = await Usuario.findById(req.params.id).select('-senha_hash');
        res.json(usuarioAtualizado);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

// ====================================================================
// ROTA DELETE: Excluir um usuário (Apenas para Administradores)
// ====================================================================
router.delete('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) {
            return res.status(404).json({ msg: 'Usuário não encontrado.' });
        }

        // Adicionar uma regra de segurança: um admin não pode se auto-excluir.
        if (usuario.id === req.usuario.id) {
            return res.status(400).json({ msg: 'Você não pode excluir sua própria conta de administrador.' });
        }

        await Usuario.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Usuário removido com sucesso.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

module.exports = router;
