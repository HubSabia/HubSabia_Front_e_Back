const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Usuario = require('../models/Usuario');

module.exports = function(passport) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`
            },
            async (accessToken, refreshToken, profile, done) => {
                const novoUsuario = {
                    googleId: profile.id,
                    nome: profile.displayName,
                    email: profile.emails[0].value.toLowerCase(),
                    isVerificado: true
                };

                try {
                    let usuario = await Usuario.findOne({ email: novoUsuario.email });

                    if (usuario) {
                        done(null, usuario);
                    } else {
                        usuario = await Usuario.create(novoUsuario);
                        done(null, usuario);
                    }
                } catch (err) {
                    console.error('Erro na estratégia do Google Passport:', err.message);
                    done(err, false);
                }
            }
        )
    );

    passport.serializeUser((usuario, done) => {
        done(null, usuario.id);
    });

    // ==========================================================
    // --- MUDANÇA CRÍTICA AQUI ---
    // Reescrevemos a função para usar async/await, como o Mongoose moderno espera.
    // ==========================================================
    passport.deserializeUser(async (id, done) => {
        try {
            const usuario = await Usuario.findById(id);
            done(null, usuario);
        } catch (err) {
            done(err, null);
        }
    });
};