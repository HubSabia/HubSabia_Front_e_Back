const mongoose = require('mongoose');

/**
 * Valida se uma string é um ObjectId válido do MongoDB
 */
function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Middleware para validar ObjectId em req.params.id
 */
function validateObjectId(req, res, next) {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ msg: 'ID inválido fornecido.' });
    }
    next();
}

module.exports = {
    isValidObjectId,
    validateObjectId
};