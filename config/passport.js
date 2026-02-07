const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

module.exports = function(passport, User) {
  // Serialize user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findByPk(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Local Strategy for login
  passport.use(
    'local-login',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
      },
      async (req, email, password, done) => {
        try {
          const user = await User.findOne({ where: { email: email.toLowerCase() } });

          if (!user) {
            return done(null, false, { message: 'Invalid email or password.' });
          }

          const isMatch = await bcrypt.compare(password, user.password);

          if (!isMatch) {
            return done(null, false, { message: 'Invalid email or password.' });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Local Strategy for registration
  passport.use(
    'local-register',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
      },
      async (req, email, password, done) => {
        try {
          const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });

          if (existingUser) {
            return done(null, false, { message: 'Email already registered.' });
          }

          const hashedPassword = await bcrypt.hash(password, 10);

          const newUser = await User.create({
            email: email.toLowerCase(),
            password: hashedPassword,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            phone: req.body.phone || null,
            is_admin: false
          });

          return done(null, newUser);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};
