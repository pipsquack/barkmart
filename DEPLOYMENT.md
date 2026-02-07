# BarkMart - Deployment Guide

This guide covers deployment options for the BarkMart application.

## Table of Contents

1. [Local Development](#local-development)
2. [Docker Compose](#docker-compose)
3. [Kubernetes Deployment](#kubernetes-deployment)
4. [Production Considerations](#production-considerations)

---

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your local database credentials
   ```

3. **Create database**
   ```bash
   createdb barkmart
   # OR
   make db-create
   ```

4. **Run migrations and seeds**
   ```bash
   npm run db:migrate
   npm run db:seed
   # OR
   make db-migrate db-seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   # OR
   make dev
   ```

6. **Access the application**
   - Open http://localhost:3000

---

## Docker Compose

Docker Compose provides an easy way to run the application with PostgreSQL in containers.

### Prerequisites

- Docker
- Docker Compose

### Quick Start

1. **Start all services**
   ```bash
   docker-compose up -d
   # OR
   make docker-run
   ```

2. **View logs**
   ```bash
   docker-compose logs -f
   # OR
   make docker-logs
   ```

3. **Access the application**
   - Open http://localhost:3000

4. **Stop services**
   ```bash
   docker-compose down
   # OR
   make docker-stop
   ```

### Notes

- Database data is persisted in a Docker volume
- Migrations and seeds run automatically on startup
- Configuration is in `docker-compose.yml`

---

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (minikube, GKE, EKS, AKS, etc.)
- kubectl configured
- Docker registry access (Docker Hub, GCR, ECR, etc.)

### Step 1: Build and Push Docker Image

1. **Build the image**
   ```bash
   docker build -t barkmart:latest .
   # OR
   make docker-build
   ```

2. **Tag for your registry**
   ```bash
   docker tag barkmart:latest your-registry.example.com/barkmart:latest
   # OR
   make docker-tag REGISTRY=your-registry.example.com
   ```

3. **Push to registry**
   ```bash
   docker push your-registry.example.com/barkmart:latest
   # OR
   make docker-push REGISTRY=your-registry.example.com
   ```

### Step 2: Update Kubernetes Manifests

1. **Update image references**

   Edit `k8s/app-deployment.yaml` and `k8s/db-init-job.yaml`:
   ```yaml
   image: your-registry.example.com/barkmart:latest
   ```

2. **Update secrets** (IMPORTANT!)

   Edit `k8s/secret.yaml` and change:
   - `POSTGRES_PASSWORD`
   - `SESSION_SECRET`
   - `DATABASE_URL` (update password)

3. **Update domain** (if using Ingress)

   Edit `k8s/ingress.yaml`:
   ```yaml
   host: your-domain.com
   ```

### Step 3: Deploy to Kubernetes

#### Option A: Manual Deployment

```bash
# 1. Create namespace
kubectl apply -f k8s/namespace.yaml

# 2. Apply ConfigMap and Secrets
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# 3. Deploy PostgreSQL
kubectl apply -f k8s/postgres-pvc.yaml
kubectl apply -f k8s/postgres-deployment.yaml

# 4. Wait for PostgreSQL to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n barkmart --timeout=120s

# 5. Run database initialization
kubectl apply -f k8s/db-init-job.yaml

# 6. Wait for init job to complete
kubectl wait --for=condition=complete job/barkmart-db-init -n barkmart --timeout=300s

# 7. Deploy application
kubectl apply -f k8s/app-deployment.yaml

# 8. (Optional) Deploy Ingress
kubectl apply -f k8s/ingress.yaml
```

#### Option B: Using Makefile

```bash
# Deploy everything
make k8s-deploy

# Or step by step
make k8s-create-namespace
make k8s-apply-config
make k8s-deploy-postgres
# Wait for PostgreSQL...
make k8s-init-db
make k8s-deploy-app
make k8s-deploy-ingress
```

#### Option C: Using Kustomize

```bash
kubectl apply -k k8s/
```

### Step 4: Verify Deployment

1. **Check pod status**
   ```bash
   kubectl get pods -n barkmart
   # OR
   make k8s-status
   ```

2. **View application logs**
   ```bash
   kubectl logs -f -l app=barkmart -n barkmart
   # OR
   make k8s-logs-app
   ```

3. **View database init logs**
   ```bash
   kubectl logs -f job/barkmart-db-init -n barkmart
   # OR
   make k8s-logs-init
   ```

### Step 5: Access the Application

#### Option A: LoadBalancer Service

If using `type: LoadBalancer` in the service:
```bash
kubectl get service barkmart-service -n barkmart
# Get the EXTERNAL-IP and access http://<EXTERNAL-IP>
```

#### Option B: Port Forwarding (for testing)

```bash
kubectl port-forward -n barkmart svc/barkmart-service 3000:80
# OR
make k8s-port-forward
```

Access http://localhost:3000

#### Option C: Ingress

If you configured Ingress, access via your domain:
```
http://your-domain.com
```

---

## Production Considerations

### Security

1. **Change default secrets**
   - Update `POSTGRES_PASSWORD` in `k8s/secret.yaml`
   - Generate a strong `SESSION_SECRET` (32+ characters)
   - Use Kubernetes Secrets properly or a secrets management solution

2. **Enable HTTPS**
   - Configure TLS in Ingress
   - Use cert-manager for automatic certificate management
   - Update `k8s/ingress.yaml` with TLS configuration

3. **Network Policies**
   - Implement network policies to restrict traffic
   - Only allow app pods to access PostgreSQL

4. **Image Security**
   - Scan images for vulnerabilities
   - Use specific image tags, not `latest`
   - Use private registry with access controls

### High Availability

1. **Database**
   - Use managed PostgreSQL (RDS, Cloud SQL, Azure Database)
   - Or set up PostgreSQL HA cluster
   - Configure automated backups

2. **Application**
   - Increase replica count in `k8s/app-deployment.yaml`
   - Configure HorizontalPodAutoscaler
   - Use PodDisruptionBudget

3. **Storage**
   - Use ReadWriteMany PVC for uploads (NFS, EFS, etc.)
   - Or use object storage (S3, GCS, Azure Blob)
   - Configure backup strategy

### Monitoring and Logging

1. **Application Monitoring**
   - Add Prometheus metrics
   - Configure Grafana dashboards
   - Set up alerting

2. **Logging**
   - Use centralized logging (ELK, Loki, Cloudwatch)
   - Configure log rotation
   - Set appropriate log levels

3. **Health Checks**
   - Liveness and readiness probes are configured
   - Monitor probe failures
   - Set up uptime monitoring

### Performance

1. **Database**
   - Configure connection pooling
   - Add database indexes
   - Monitor slow queries

2. **Caching**
   - Add Redis for sessions (optional)
   - Implement application-level caching
   - Use CDN for static assets

3. **Resource Limits**
   - Tune resource requests/limits
   - Monitor actual usage
   - Configure autoscaling

### Backup and Disaster Recovery

1. **Database Backups**
   - Automated daily backups
   - Point-in-time recovery capability
   - Test restore procedures

2. **Application State**
   - Backup uploaded files
   - Document configuration
   - Version control all manifests

### CI/CD

Example GitHub Actions workflow:

```yaml
name: Deploy to Kubernetes

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Build and push image
        run: |
          docker build -t ${{ secrets.REGISTRY }}/barkmart:${{ github.sha }} .
          docker push ${{ secrets.REGISTRY }}/barkmart:${{ github.sha }}

      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/barkmart-app \
            barkmart=${{ secrets.REGISTRY }}/barkmart:${{ github.sha }} \
            -n barkmart
```

### Cost Optimization

1. **Right-sizing**
   - Monitor resource usage
   - Adjust requests/limits
   - Use spot/preemptible instances

2. **Scaling**
   - Configure autoscaling
   - Scale down during off-hours
   - Use cluster autoscaler

---

## Useful Commands

### Kubernetes

```bash
# View all resources
kubectl get all -n barkmart

# Describe pod
kubectl describe pod <pod-name> -n barkmart

# Get logs
kubectl logs <pod-name> -n barkmart

# Execute command in pod
kubectl exec -it <pod-name> -n barkmart -- sh

# Restart deployment
kubectl rollout restart deployment/barkmart-app -n barkmart

# Scale deployment
kubectl scale deployment/barkmart-app --replicas=3 -n barkmart

# Delete everything
kubectl delete namespace barkmart
```

### Database Management

```bash
# Connect to PostgreSQL
kubectl exec -it <postgres-pod> -n barkmart -- psql -U barkmart

# Backup database
kubectl exec <postgres-pod> -n barkmart -- pg_dump -U barkmart barkmart > backup.sql

# Restore database
kubectl exec -i <postgres-pod> -n barkmart -- psql -U barkmart barkmart < backup.sql
```

---

## Troubleshooting

### Pods not starting

1. Check pod status: `kubectl describe pod <pod-name> -n barkmart`
2. Check events: `kubectl get events -n barkmart --sort-by='.lastTimestamp'`
3. Check logs: `kubectl logs <pod-name> -n barkmart`

### Database connection issues

1. Verify PostgreSQL is running: `kubectl get pods -l app=postgres -n barkmart`
2. Check service: `kubectl get svc postgres-service -n barkmart`
3. Verify DATABASE_URL in secret
4. Check logs: `kubectl logs -l app=barkmart -n barkmart`

### Image pull errors

1. Verify image exists in registry
2. Check image name in deployment
3. Verify registry credentials (if private)
4. Check imagePullSecrets configuration

---

## Support

For issues and questions:
- Create an issue in the repository
- Check logs first
- Provide pod descriptions and logs when reporting issues
