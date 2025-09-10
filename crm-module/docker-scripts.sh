#!/bin/bash

# Docker Management Scripts for CRM Spa Dr. Oha
# Usage: ./docker-scripts.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to check if docker-compose files exist
check_compose_files() {
    if [ ! -f "docker-compose.yml" ]; then
        print_error "docker-compose.yml not found!"
        exit 1
    fi
}

# Function to check if external containers are running
check_external_containers() {
    print_info "Checking external containers..."

    # Check PostgreSQL container (97cbc867ca58)
    if ! docker ps --filter "id=97cbc867ca58" --format "table {{.ID}}\t{{.Names}}\t{{.Status}}" | grep -q "97cbc867ca58"; then
        print_warning "PostgreSQL container (97cbc867ca58) is not running!"
        print_info "Please ensure PostgreSQL container is running on port 5432"
    else
        print_success "PostgreSQL container (97cbc867ca58) is running"
    fi

    # Check Redis container (6b5a88614450)
    if ! docker ps --filter "id=6b5a88614450" --format "table {{.ID}}\t{{.Names}}\t{{.Status}}" | grep -q "6b5a88614450"; then
        print_warning "Redis container (6b5a88614450) is not running!"
        print_info "Please ensure Redis container is running on port 6379"
    else
        print_success "Redis container (6b5a88614450) is running"
    fi
}

# Main functions
start() {
    print_info "Checking external containers before starting..."
    check_external_containers

    print_info "Starting CRM Spa containers (app, pgadmin, redis-commander)..."
    docker-compose up -d
    print_success "Containers started successfully!"
    print_info "Application will be available at: http://localhost:8081"
    print_info "PgAdmin will be available at: http://localhost:5050"
    print_info "Redis Commander will be available at: http://localhost:8082"
    print_warning "Note: Using external PostgreSQL (97cbc867ca58) and Redis (6b5a88614450) containers"
}

stop() {
    print_info "Stopping CRM Spa containers..."
    docker-compose down
    print_success "Containers stopped successfully!"
}

restart() {
    print_info "Restarting CRM Spa containers..."
    docker-compose restart
    print_success "Containers restarted successfully!"
}

build() {
    print_info "Building CRM Spa application..."
    docker-compose build --no-cache
    print_success "Build completed successfully!"
}

logs() {
    if [ -z "$2" ]; then
        print_info "Showing logs for all services (press Ctrl+C to exit)..."
        docker-compose logs -f
    else
        print_info "Showing logs for service: $2 (press Ctrl+C to exit)..."
        docker-compose logs -f "$2"
    fi
}

status() {
    print_info "CRM Spa Container Status:"
    docker-compose ps
    echo ""

    print_info "External Containers Status:"
    echo "PostgreSQL (97cbc867ca58):"
    docker ps --filter "id=97cbc867ca58" --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo "Redis (6b5a88614450):"
    docker ps --filter "id=6b5a88614450" --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""

    print_info "Health Check:"
    if curl -f http://localhost:8081/actuator/health >/dev/null 2>&1; then
        print_success "Application is healthy!"
    else
        print_error "Application health check failed!"
    fi
}

clean() {
    print_warning "This will remove all containers, volumes, and images!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleaning up Docker resources..."
        docker-compose down -v --rmi all
        docker system prune -f
        print_success "Cleanup completed!"
    else
        print_info "Cleanup cancelled."
    fi
}

shell() {
    if [ -z "$2" ]; then
        print_info "Opening shell in app container..."
        docker-compose exec app sh
    else
        print_info "Opening shell in $2 container..."
        docker-compose exec "$2" sh
    fi
}

database() {
    print_info "Connecting to PostgreSQL database..."
    docker-compose exec postgres psql -U postgres -d crm_spa
}

redis_cli() {
    print_info "Connecting to Redis..."
    docker-compose exec redis redis-cli
}

# Main script logic
case "${1:-help}" in
    start)
        check_docker
        check_compose_files
        start
        ;;
    stop)
        check_docker
        check_compose_files
        stop
        ;;
    restart)
        check_docker
        check_compose_files
        restart
        ;;
    build)
        check_docker
        check_compose_files
        build
        ;;
    logs)
        check_docker
        check_compose_files
        logs "$@"
        ;;
    status)
        check_docker
        check_compose_files
        status
        ;;
    clean)
        check_docker
        check_compose_files
        clean
        ;;
    shell)
        check_docker
        check_compose_files
        shell "$@"
        ;;
    db|database)
        check_docker
        check_compose_files
        database
        ;;
    redis)
        check_docker
        check_compose_files
        redis_cli
        ;;
    help|*)
        echo "CRM Spa Docker Management Script"
        echo ""
        echo "Usage: $0 [command] [options]"
        echo ""
        echo "Commands:"
        echo "  start          Start all containers"
        echo "  stop           Stop all containers"
        echo "  restart        Restart all containers"
        echo "  build          Build the application"
        echo "  logs [service] Show logs (all services or specific service)"
        echo "  status         Show container status and health"
        echo "  clean          Remove all containers, volumes, and images"
        echo "  shell [service] Open shell in container (default: app)"
        echo "  db|database    Connect to PostgreSQL database"
        echo "  redis          Connect to Redis CLI"
        echo "  help           Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 start          # Start the entire stack"
        echo "  $0 logs app       # Show application logs"
        echo "  $0 shell postgres # Open shell in database container"
        echo "  $0 status         # Check health of all services"
        ;;
esac
