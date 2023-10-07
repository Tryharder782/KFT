const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { User } = require('../models/models');

passport.use(new LocalStrategy(
   {
      usernameField: 'email',
      passwordField: 'password',
   },
   async (email, password, done) => {
      try {
         const user = await User.findOne({ where: { email } });
         if (!user || !user.validPassword(password)) {
            return done(null, false);
         }
         return done(null, user);
      } catch (error) {
         return done(error);
      }
   }
));

passport.serializeUser((user, done) => {
   done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
   try {
      const user = await User.findByPk(id);
      return done(null, user);
   } catch (error) {
      return done(error);
   }
});