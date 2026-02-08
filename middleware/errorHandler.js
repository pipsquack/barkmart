// Global error handler
exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong!';

  // Ensure user is set even if middleware hasn't run
  if (!res.locals.user) {
    res.locals.user = req.user || null;
  }
  if (!res.locals.cartCount) {
    res.locals.cartCount = 0;
  }

  res.status(statusCode).render('error', {
    title: 'Error',
    message: message,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
};

// 404 handler
exports.notFound = (req, res, next) => {
  // Ensure user is set even if middleware hasn't run
  if (!res.locals.user) {
    res.locals.user = req.user || null;
  }
  if (!res.locals.cartCount) {
    res.locals.cartCount = 0;
  }

  res.status(404).render('error', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
    error: {}
  });
};
