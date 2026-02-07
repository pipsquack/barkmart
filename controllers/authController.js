const passport = require('passport');

// Show login form
exports.showLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Login'
  });
};

// Handle login
exports.login = (req, res, next) => {
  passport.authenticate('local-login', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('error', info.message);
      return res.redirect('/auth/login');
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      req.flash('success', 'Welcome back!');
      const returnTo = req.session.returnTo || '/';
      delete req.session.returnTo;
      return res.redirect(returnTo);
    });
  })(req, res, next);
};

// Show register form
exports.showRegister = (req, res) => {
  res.render('auth/register', {
    title: 'Register'
  });
};

// Handle registration
exports.register = (req, res, next) => {
  passport.authenticate('local-register', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('error', info.message);
      return res.redirect('/auth/register');
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      req.flash('success', 'Registration successful! Welcome to Barkmart.');
      return res.redirect('/');
    });
  })(req, res, next);
};

// Handle logout
exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
    }
    req.flash('success', 'You have been logged out.');
    res.redirect('/');
  });
};
