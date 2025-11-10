const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Usuario = require('../models/Usuario');

module.exports = function(passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
        // 'profile' contém as informações do usuário do Google
        const novoUsuario = {
            googleId: profile.id,
            nome: profile.displayName,
            email: profile.emails[0].value,
            isVerificado: true // O email do Google já é verificado
        };

        try {
            let usuario = await Usuario.findOne({ email: profile.emails[0].value });
            if (usuario) {
                done(null, usuario); // Usuário já existe, faz o login
            } else {
                usuario = await Usuario.create(novoUsuario); // Cria um novo usuário
                done(null, usuario);
            }
        } catch (err) {
            console.error(err);
        }
    }));

    passport.serializeUser((usuario, done) => {
        done(null, usuario.id);
    });

    passport.deserializeUser((id, done) => {
        Usuario.findById(id, (err, usuario) => done(err, usuario));
    });
}