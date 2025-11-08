// backend/middlewares/authValidation.js
const passwordValidator = require('password-validator');

const schema = new passwordValidator();
schema
  .is().min(8)
  .has().uppercase()
  .has().lowercase()
  .has().digits(1)
  .has().not().spaces();

const validatePassword = (password) => {
  return schema.validate(password);
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Middleware para validar registro
const validateRegister = (req, res, next) => {
  const { email, password } = req.body;

  // Validar email
  if (!validateEmail(email)) {
    return res.status(400).json({ 
      message: 'Por favor, insira um email válido' 
    });
  }

  // Validar senha
  if (!validatePassword(password)) {
    return res.status(400).json({ 
      message: 'Senha não atende aos requisitos de segurança',
      requirements: {
        minLength: 8,
        requiresUppercase: true,
        requiresLowercase: true,
        requiresNumbers: true,
        noSpaces: true
      }
    });
  }

  next();
};

module.exports = {
  validatePassword,
  validateEmail,
  validateRegister
};