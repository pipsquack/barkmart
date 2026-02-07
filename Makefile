.PHONY: help build run stop dev db-create db-migrate db-seed db-reset docker-build docker-push k8s-deploy k8s-delete clean

# Variables
IMAGE_NAME ?= barkmart
IMAGE_TAG ?= latest
REGISTRY ?= your-registry.example.com
NAMESPACE ?= barkmart

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Local Development
install: ## Install dependencies
	npm install

dev: ## Run development server with nodemon
	npm run dev

db-create: ## Create local PostgreSQL database
	createdb barkmart || echo "Database may already exist"

db-migrate: ## Run database migrations
	npm run db:migrate

db-seed: ## Seed database with sample data
	npm run db:seed

db-reset: ## Reset database (undo all, migrate, seed)
	npm run db:reset

clean: ## Clean node_modules and uploads
	rm -rf node_modules
	rm -rf public/uploads/*

# Docker
docker-build: ## Build Docker image
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .

docker-tag: ## Tag image for registry
	docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)

docker-push: docker-tag ## Push image to registry
	docker push $(REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)

docker-run: ## Run with Docker Compose
	docker-compose up -d

docker-stop: ## Stop Docker Compose
	docker-compose down

docker-logs: ## View Docker Compose logs
	docker-compose logs -f

docker-clean: ## Remove Docker containers and volumes
	docker-compose down -v

# Kubernetes
k8s-deploy: ## Full Kubernetes deployment with Kustomize
	@echo "Deploying with Kustomize..."
	@echo "Reading secrets from .env file..."
	kubectl apply -k k8s/
	@echo "Waiting for PostgreSQL to be ready..."
	@kubectl wait --for=condition=ready pod -l app=postgres -n $(NAMESPACE) --timeout=120s || true
	@echo "Deployment complete!"
	@echo "Run 'make k8s-status' to check status"

k8s-build: ## Build Kustomize output (dry-run)
	kubectl kustomize k8s/

k8s-status: ## Check deployment status
	kubectl get all -n $(NAMESPACE)

k8s-logs-app: ## View application logs
	kubectl logs -f -l app=barkmart -n $(NAMESPACE)

k8s-logs-postgres: ## View PostgreSQL logs
	kubectl logs -f -l app=postgres -n $(NAMESPACE)

k8s-logs-init: ## View database init job logs
	kubectl logs -f job/barkmart-db-init -n $(NAMESPACE)

k8s-shell-app: ## Shell into application pod
	kubectl exec -it -n $(NAMESPACE) $$(kubectl get pod -n $(NAMESPACE) -l app=barkmart -o jsonpath='{.items[0].metadata.name}') -- sh

k8s-shell-postgres: ## Shell into PostgreSQL pod
	kubectl exec -it -n $(NAMESPACE) $$(kubectl get pod -n $(NAMESPACE) -l app=postgres -o jsonpath='{.items[0].metadata.name}') -- sh

k8s-port-forward: ## Port forward application to localhost:3000
	kubectl port-forward -n $(NAMESPACE) svc/barkmart-service 3000:80

k8s-delete: ## Delete all Kubernetes resources
	kubectl delete namespace $(NAMESPACE)

k8s-restart-app: ## Restart application pods
	kubectl rollout restart deployment/barkmart-app -n $(NAMESPACE)

# Combined targets
build-and-push: docker-build docker-push ## Build and push Docker image

deploy-all: build-and-push k8s-deploy ## Build, push, and deploy to Kubernetes
