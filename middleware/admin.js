// Middleware to check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.is_admin) {
    return next();
  }
  req.flash('error', 'You do not have permission to access this page.');
  res.redirect('/');
};
