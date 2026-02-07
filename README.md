# BarkMart - E-commerce Application for Pet Products

A full-featured e-commerce web application built with Node.js, Express, PostgreSQL, and EJS for selling pet products.

## Features

- **User Authentication**: Register, login, logout with session-based authentication
- **Product Catalog**: Browse products by category, search, and filter
- **Shopping Cart**: Add, update, and remove items from cart
- **Checkout**: Complete order with shipping address and payment method selection
- **Order Management**: View order history and track order status
- **Admin Panel**: Manage products, orders, and users
- **Real User Monitoring**: Datadog RUM integration for frontend performance tracking

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: Passport.js with session-based auth
- **Template Engine**: EJS (server-side rendering)
- **Frontend**: Bootstrap 5, Vanilla JavaScript, jQuery
- **File Uploads**: Multer
- **Monitoring**: Datadog RUM (optional)

## Quick Start

Choose your deployment method:

### Option 1: Local Development

See detailed instructions in [Installation](#installation) section below.

### Option 2: Docker Compose (Recommended for Quick Testing)

```bash
# Start everything (database + app)
docker-compose up -d

# Access the application
open http://localhost:3000
```

### Option 3: Kubernetes

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed Kubernetes deployment instructions.

```bash
# Quick deployment
make k8s-deploy
```

---

## Installation

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Setup Steps

1. **Install dependencies**
   ```bash
   npm install
   # OR using make
   make install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Create PostgreSQL database**
   ```bash
   createdb barkmart
   # OR using make
   make db-create
   ```

4. **Run migrations and seed data**
   ```bash
   npm run db:migrate
   npm run db:seed
   # OR using make
   make db-migrate db-seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # OR using make
   make dev
   ```

6. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`

## Default Admin Account

To create an admin account, register a new user and then manually update the database:

```sql
UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';
```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm run db:migrate` - Run database migrations
- `npm run db:migrate:undo` - Undo last migration
- `npm run db:seed` - Seed the database with sample data
- `npm run db:seed:undo` - Undo all seeds
- `npm run db:reset` - Reset database (undo all, migrate, seed)

## Project Structure

```
barkmart/
├── config/              # Configuration files
│   ├── database.js
│   ├── passport.js
│   └── multer.js
├── models/              # Sequelize models
├── routes/              # Express routes
├── controllers/         # Business logic
├── middleware/          # Custom middleware
├── views/               # EJS templates
├── public/              # Static assets
├── migrations/          # Database migrations
├── seeders/             # Database seeds
├── utils/               # Helper functions
└── server.js            # Application entry point
```

## Usage

### Customer Flow

1. Browse products without login
2. Register or login to purchase
3. Add products to cart
4. Proceed to checkout
5. Enter shipping address
6. Select payment method
7. Place order
8. View order confirmation
9. Track orders in "My Orders"

### Admin Flow

1. Login as admin
2. Access admin panel from navigation
3. Manage products (create, edit, delete)
4. View and update order status
5. View user list

## Deployment

### Docker

Build and run with Docker:

```bash
# Build image
docker build -t barkmart:latest .

# Run with Docker Compose
docker-compose up -d
```

### Kubernetes

See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive Kubernetes deployment guide.

Quick deployment:

```bash
# Build and push image
make docker-build docker-push REGISTRY=your-registry.com

# Deploy to Kubernetes
make k8s-deploy

# Check status
make k8s-status

# View logs
make k8s-logs-app
```

Kubernetes resources included:
- Namespace configuration
- ConfigMap for application settings
- Secrets for sensitive data
- PostgreSQL StatefulSet with persistent storage
- Application Deployment with multiple replicas
- Services (ClusterIP and LoadBalancer)
- Ingress configuration
- Database initialization Job
- Makefile for easy management

### Production Considerations

Before deploying to production:

1. **Update secrets** in `k8s/secret.yaml`:
   - Change `POSTGRES_PASSWORD`
   - Generate strong `SESSION_SECRET` (32+ characters)

2. **Configure image registry**:
   - Update image references in deployment manifests
   - Set up private registry if needed

3. **Enable HTTPS**:
   - Configure TLS in Ingress
   - Use cert-manager for automatic certificates

4. **Set resource limits**:
   - Tune CPU/memory requests and limits
   - Configure autoscaling if needed

5. **Set up monitoring**:
   - Add Prometheus/Grafana
   - Configure logging aggregation
   - Set up alerts

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed production considerations.

## Monitoring

### Datadog RUM Integration

BarkMart includes optional Datadog Real User Monitoring (RUM) for tracking:

- Frontend performance metrics
- User sessions and interactions
- JavaScript errors
- Resource loading times
- Session replays (20% sample rate)
- User context (when authenticated)

#### Quick Setup

1. Create a RUM application in Datadog
2. Add credentials to environment:

```bash
# .env
DD_RUM_ENABLED=true
DD_RUM_CLIENT_TOKEN=your-client-token
DD_RUM_APPLICATION_ID=your-application-id
```

3. Restart the application

See [DATADOG_RUM.md](DATADOG_RUM.md) for complete documentation.

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- SQL injection prevention (Sequelize parameterized queries)
- XSS prevention (EJS auto-escaping)
- CSRF protection
- Security headers with Helmet
- Environment variable management
- Secure session storage in PostgreSQL

## Makefile Commands

Common operations:

```bash
# Development
make dev              # Start development server
make db-migrate       # Run migrations
make db-seed          # Seed database

# Docker
make docker-build     # Build Docker image
make docker-run       # Run with docker-compose
make docker-logs      # View logs

# Kubernetes
make k8s-deploy       # Full deployment
make k8s-status       # Check status
make k8s-logs-app     # View application logs
make k8s-port-forward # Forward port to localhost
make k8s-delete       # Delete all resources

# Help
make help             # Show all available commands
```

## License

MIT

## Author

BarkMart Team
