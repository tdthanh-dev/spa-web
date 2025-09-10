# Makefile for CRM Spa Dr. Oha Docker Deployment
.PHONY: help build up down restart logs status clean dev prod test

# Default target
help: ## Show this help message
	@echo "CRM Spa Dr. Oha - Docker Deployment Makefile"
	@echo ""
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Development commands
build: ## Build the application
	@echo "Building CRM Spa application..."
	./docker-scripts.sh build

up: ## Start all services in development mode
	@echo "Starting CRM Spa in development mode..."
	./docker-scripts.sh start

down: ## Stop all services
	@echo "Stopping CRM Spa services..."
	./docker-scripts.sh stop

restart: ## Restart all services
	@echo "Restarting CRM Spa services..."
	./docker-scripts.sh restart

logs: ## Show logs from all services
	@echo "Showing logs from all services..."
	./docker-scripts.sh logs

status: ## Show status of all services
	@echo "Checking service status..."
	./docker-scripts.sh status

clean: ## Remove all containers and volumes
	@echo "Cleaning up Docker resources..."
	./docker-scripts.sh clean

# Production commands
prod-build: ## Build for production
	@echo "Building CRM Spa for production..."
	docker build -t crm-spa:latest .

prod-up: ## Start services in production mode
	@echo "Starting CRM Spa in production mode..."
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

prod-down: ## Stop production services
	@echo "Stopping production services..."
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

prod-logs: ## Show production logs
	@echo "Showing production logs..."
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Testing commands
test: ## Run tests
	@echo "Running tests..."
	docker-compose exec app ./mvnw test

test-integration: ## Run integration tests
	@echo "Running integration tests..."
	docker-compose exec app ./mvnw verify

# Database commands
db-connect: ## Connect to database
	@echo "Connecting to PostgreSQL..."
	./docker-scripts.sh database

db-backup: ## Backup database
	@echo "Creating database backup..."
	docker-compose exec postgres pg_dump -U postgres crm_spa > backup_$(shell date +%Y%m%d_%H%M%S).sql

db-restore: ## Restore database from backup
	@echo "Restoring database from backup..."
	@echo "Usage: make db-restore FILE=backup_file.sql"
	@if [ -z "$(FILE)" ]; then \
		echo "Please specify FILE variable. Example: make db-restore FILE=backup.sql"; \
		exit 1; \
	fi
	docker-compose exec -T postgres psql -U postgres crm_spa < $(FILE)

# Utility commands
shell: ## Open shell in app container
	@echo "Opening shell in app container..."
	./docker-scripts.sh shell

shell-db: ## Open shell in database container
	@echo "Opening shell in database container..."
	./docker-scripts.sh shell postgres

health: ## Check application health
	@echo "Checking application health..."
	curl -f http://localhost:8081/actuator/health && echo "✅ Application is healthy" || echo "❌ Application is not healthy"

# Development setup
setup-dev: ## Setup development environment
	@echo "Setting up development environment..."
	@echo "1. Make sure Docker is running"
	@echo "2. Ensure external containers are running:"
	@echo "   - PostgreSQL: 97cbc867ca58 (port 5432)"
	@echo "   - Redis: 6b5a88614450 (port 6379)"
	@echo "3. Copy env-example.txt to .env and configure"
	@echo "4. Run 'make build && make up'"
	@echo "5. Access application at http://localhost:8081"

# Production deployment
deploy-prod: ## Deploy to production
	@echo "Deploying to production..."
	@echo "1. Configure production environment variables"
	@echo "2. Build production image: make prod-build"
	@echo "3. Deploy: make prod-up"
	@echo "4. Check status: make prod-logs"

# Quick start for new developers
quick-start: ## Quick start for new developers
	@echo "🚀 Quick Start Guide for CRM Spa Dr. Oha"
	@echo ""
	@echo "1. Prerequisites:"
	@echo "   - Docker & Docker Compose installed"
	@echo "   - External containers running:"
	@echo "     * PostgreSQL: 97cbc867ca58 (port 5432)"
	@echo "     * Redis: 6b5a88614450 (port 6379)"
	@echo "   - Ports 8081, 5050, 8082 free"
	@echo ""
	@echo "2. Setup:"
	@echo "   make setup-dev"
	@echo ""
	@echo "3. Start application:"
	@echo "   make up"
	@echo ""
	@echo "4. Access points:"
	@echo "   - Application: http://localhost:8081"
	@echo "   - API Docs:    http://localhost:8081/swagger-ui.html"
	@echo "   - Database:    http://localhost:5050 (admin@crm-spa.com/admin123)"
	@echo "   - Redis:       http://localhost:8082"
	@echo ""
	@echo "5. Useful commands:"
	@echo "   make logs     # View logs"
	@echo "   make status   # Check status"
	@echo "   make shell    # Open app shell"
	@echo "   make db-connect # Connect to database"
	@echo ""
	@echo "⚠️  Note: Using external PostgreSQL and Redis containers"
	@echo "Happy coding! 🎉"
