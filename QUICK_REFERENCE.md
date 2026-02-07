# BarkMart - Quick Reference Guide

## Quick Commands

### Local Development

```bash
# Setup
npm install
cp .env.example .env
make db-create
make db-migrate
make db-seed

# Run
npm run dev

# Database operations
make db-reset              # Reset database
npm run db:migrate         # Run migrations
npm run db:seed            # Seed data
```

### Docker

```bash
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Clean up volumes
docker-compose down -v
```

### Kubernetes

```bash
# Deploy
make k8s-deploy

# Check status
make k8s-status

# View logs
make k8s-logs-app
make k8s-logs-postgres
make k8s-logs-init

# Port forward (access locally)
make k8s-port-forward

# Restart app
make k8s-restart-app

# Delete everything
make k8s-delete
```

## Environment Variables

Required variables in `.env`:

```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/barkmart
SESSION_SECRET=your-secret-at-least-32-characters-long
```

Optional Datadog RUM variables:

```bash
DD_RUM_ENABLED=true
DD_RUM_CLIENT_TOKEN=your-datadog-client-token
DD_RUM_APPLICATION_ID=your-datadog-application-id
DD_RUM_SITE=datadoghq.com
DD_RUM_SERVICE=barkmart
DD_RUM_SESSION_SAMPLE_RATE=100
DD_RUM_SESSION_REPLAY_SAMPLE_RATE=20
DD_ENV=development
APP_VERSION=1.0.0
```

See [DATADOG_RUM.md](DATADOG_RUM.md) for setup instructions.

## Database Connection Strings

### Local
```
postgresql://localhost:5432/barkmart
```

### Docker Compose
```
postgresql://barkmart:barkmart_password@postgres:5432/barkmart
```

### Kubernetes
```
postgresql://barkmart:password@postgres-service:5432/barkmart
```

## Default Port

The application runs on **port 3000** by default.

## Creating an Admin User

1. Register a normal user through the UI
2. Connect to the database
3. Run this SQL:

```sql
UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';
```

### Via psql (local)
```bash
psql barkmart
UPDATE users SET is_admin = true WHERE email = 'admin@example.com';
\q
```

### Via Docker Compose
```bash
docker-compose exec postgres psql -U barkmart
UPDATE users SET is_admin = true WHERE email = 'admin@example.com';
\q
```

### Via Kubernetes
```bash
kubectl exec -it <postgres-pod> -n barkmart -- psql -U barkmart
UPDATE users SET is_admin = true WHERE email = 'admin@example.com';
\q
```

## File Locations

### Configuration
- `.env` - Environment variables (don't commit!)
- `config/database.js` - Database configuration
- `config/passport.js` - Authentication strategy
- `config/multer.js` - File upload settings

### Code
- `models/` - Database models
- `controllers/` - Business logic
- `routes/` - Route definitions
- `middleware/` - Custom middleware
- `views/` - EJS templates
- `public/` - Static assets

### Deployment
- `Dockerfile` - Container definition
- `docker-compose.yml` - Local Docker setup
- `k8s/` - Kubernetes manifests
- `Makefile` - Automation commands

### Documentation
- `README.md` - Main documentation
- `DEPLOYMENT.md` - Deployment guide
- `PROJECT_SUMMARY.md` - Implementation overview
- `QUICK_REFERENCE.md` - This file

## Kubernetes Resources

### Namespace
```bash
kubectl get all -n barkmart
```

### Pods
```bash
# List pods
kubectl get pods -n barkmart

# Describe pod
kubectl describe pod <pod-name> -n barkmart

# Shell into pod
kubectl exec -it <pod-name> -n barkmart -- sh
```

### Services
```bash
# List services
kubectl get svc -n barkmart

# Get service details
kubectl describe svc barkmart-service -n barkmart
```

### Logs
```bash
# App logs
kubectl logs -f -l app=barkmart -n barkmart

# PostgreSQL logs
kubectl logs -f -l app=postgres -n barkmart

# Previous pod logs
kubectl logs <pod-name> -n barkmart --previous
```

### Secrets
```bash
# View secrets (base64 encoded)
kubectl get secret barkmart-secret -n barkmart -o yaml

# Decode secret
kubectl get secret barkmart-secret -n barkmart -o jsonpath='{.data.POSTGRES_PASSWORD}' | base64 -d
```

## Troubleshooting

### Issue: Application won't start

**Check:**
1. Database is running
2. DATABASE_URL is correct
3. Migrations have run
4. Ports are not in use

```bash
# Check what's using port 3000
lsof -i :3000

# Check PostgreSQL
psql -l

# Check logs
npm run dev
```

### Issue: Database connection error

**Check:**
1. PostgreSQL is running
2. Database exists
3. Credentials are correct
4. Host/port are correct

```bash
# Test connection
psql $DATABASE_URL

# Check PostgreSQL status
pg_isready
```

### Issue: Cannot login/register

**Check:**
1. User table exists
2. Session table exists
3. SESSION_SECRET is set

```bash
# Check tables
psql barkmart -c "\dt"

# Check session table
psql barkmart -c "SELECT * FROM session LIMIT 5;"
```

### Issue: Images not uploading

**Check:**
1. `public/uploads/` directory exists
2. Directory has write permissions
3. Image size is under 5MB

```bash
# Create directory
mkdir -p public/uploads

# Set permissions
chmod 755 public/uploads
```

### Issue: Pods in CrashLoopBackOff

**Check:**
1. View pod logs
2. Check events
3. Verify image exists
4. Check secrets and configmaps

```bash
# View pod status
kubectl describe pod <pod-name> -n barkmart

# View events
kubectl get events -n barkmart --sort-by='.lastTimestamp'

# View logs
kubectl logs <pod-name> -n barkmart
```

## Common Patterns

### Add a new database column

1. Create migration:
```bash
npx sequelize-cli migration:generate --name add-column-to-table
```

2. Edit migration file in `migrations/`

3. Run migration:
```bash
npm run db:migrate
```

4. Update model in `models/`

### Add a new page

1. Create route in `routes/`
2. Create controller in `controllers/`
3. Create view in `views/`
4. Register route in `server.js`

### Add a new middleware

1. Create file in `middleware/`
2. Export middleware function
3. Use in routes or `server.js`

## Security Checklist

- [ ] SESSION_SECRET is unique and strong (32+ chars)
- [ ] POSTGRES_PASSWORD is strong
- [ ] .env is in .gitignore
- [ ] HTTPS is enabled in production
- [ ] Secrets are not committed to git
- [ ] Database backups are configured
- [ ] Resource limits are set in K8s
- [ ] Health checks are working
- [ ] Logs are being collected

## Performance Tips

1. **Database**: Add indexes to frequently queried columns
2. **Sessions**: Use Redis instead of PostgreSQL (optional)
3. **Images**: Implement image optimization
4. **Caching**: Add caching layer (Redis)
5. **CDN**: Serve static assets from CDN
6. **Database**: Use connection pooling
7. **Kubernetes**: Enable HPA for autoscaling

## URLs

### Local Development
- Application: http://localhost:3000
- Admin: http://localhost:3000/admin/dashboard

### Docker Compose
- Application: http://localhost:3000
- Admin: http://localhost:3000/admin/dashboard

### Kubernetes (with port forward)
- Application: http://localhost:3000
- Admin: http://localhost:3000/admin/dashboard

### Kubernetes (with LoadBalancer)
- Check external IP: `kubectl get svc barkmart-service -n barkmart`
- Application: http://<EXTERNAL-IP>
- Admin: http://<EXTERNAL-IP>/admin/dashboard

### Kubernetes (with Ingress)
- Application: http://your-domain.com
- Admin: http://your-domain.com/admin/dashboard

## Support

For issues:
1. Check logs first
2. Review this guide
3. See DEPLOYMENT.md for detailed troubleshooting
4. Check GitHub issues

## Useful Links

- [Express.js Documentation](https://expressjs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [Passport.js Documentation](http://www.passportjs.org/)
- [EJS Documentation](https://ejs.co/)
- [Bootstrap Documentation](https://getbootstrap.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Documentation](https://docs.docker.com/)
