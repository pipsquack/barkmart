require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const passport = require('passport');
const helmet = require('helmet');
const methodOverride = require('method-override');
const path = require('path');
const { sequelize, User } = require('./models');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Passport
require('./config/passport')(passport, User);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Method override for forms
app.use(methodOverride('_method'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  store: new pgSession({
    conString: process.env.DATABASE_URL,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Flash messages middleware
app.use((req, res, next) => {
  req.flash = (type, message) => {
    if (!req.session.flash) {
      req.session.flash = {};
    }
    req.session.flash[type] = message;
  };
  next();
});

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Make helpers available in templates
const helpers = require('./utils/helpers');
app.locals.formatPrice = helpers.formatPrice;
app.locals.formatDate = helpers.formatDate;

// Make user and flash messages available in all views
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.success = req.session.flash?.success || null;
  res.locals.error = req.session.flash?.error || null;
  res.locals.info = req.session.flash?.info || null;

  // Clear flash messages after reading
  if (req.session.flash) {
    delete req.session.flash;
  }

  next();
});

// Make Datadog RUM configuration available in all views
app.use((req, res, next) => {
  res.locals.datadogRum = {
    enabled: process.env.DD_RUM_ENABLED === 'true',
    clientToken: process.env.DD_RUM_CLIENT_TOKEN || '',
    applicationId: process.env.DD_RUM_APPLICATION_ID || '',
    site: process.env.DD_RUM_SITE || 'datadoghq.com',
    service: process.env.DD_RUM_SERVICE || 'barkmart',
    env: process.env.DD_ENV || 'production',
    version: process.env.APP_VERSION || '1.0.0',
    sessionSampleRate: parseInt(process.env.DD_RUM_SESSION_SAMPLE_RATE || '100'),
    sessionReplaySampleRate: parseInt(process.env.DD_RUM_SESSION_REPLAY_SAMPLE_RATE || '20')
  };
  next();
});

// Make cart count available in all views
app.use(async (req, res, next) => {
  if (req.user) {
    try {
      const { Cart, CartItem } = require('./models');
      const cart = await Cart.findOne({
        where: { user_id: req.user.id },
        include: [{ model: CartItem, as: 'items' }]
      });
      res.locals.cartCount = cart?.items?.length || 0;
    } catch (error) {
      res.locals.cartCount = 0;
    }
  } else {
    res.locals.cartCount = 0;
  }
  next();
});

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/products', require('./routes/products'));
app.use('/cart', require('./routes/cart'));
app.use('/checkout', require('./routes/checkout'));
app.use('/orders', require('./routes/orders'));
app.use('/admin', require('./routes/admin'));

// Home route
app.get('/', async (req, res) => {
  try {
    const { Product, Category } = require('./models');
    const products = await Product.findAll({
      where: { is_active: true },
      include: [{ model: Category, as: 'category' }],
      limit: 8,
      order: [['created_at', 'DESC']]
    });

    res.render('home', {
      title: 'Barkmart - Pet Products',
      products
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Database connection and server start
sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  });

module.exports = app;
