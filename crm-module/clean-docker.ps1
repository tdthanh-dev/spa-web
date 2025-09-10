# Docker Cleanup Script for CRM Spa Dr. Oha
# Run this script to free up disk space from Docker builds

Write-Host "🧹 Starting Docker Cleanup..." -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Yellow

# Stop all containers
Write-Host "Stopping all containers..." -ForegroundColor Cyan
docker-compose down -v --rmi all 2>$null

# Remove all containers
Write-Host "Removing all containers..." -ForegroundColor Cyan
docker ps -a -q | ForEach-Object { docker rm -f $_ } 2>$null

# Remove all images
Write-Host "Removing all images..." -ForegroundColor Cyan
docker images -q | ForEach-Object { docker rmi $_ } 2>$null

# Clean volumes
Write-Host "Cleaning volumes..." -ForegroundColor Cyan
docker volume prune -f

# Clean networks
Write-Host "Cleaning networks..." -ForegroundColor Cyan
docker network prune -f

# System cleanup
Write-Host "System cleanup..." -ForegroundColor Cyan
docker system prune -a -f

# Clean Maven repository
Write-Host "Cleaning Maven repository..." -ForegroundColor Cyan
if (Test-Path "$env:USERPROFILE\.m2\repository") {
    Remove-Item "$env:USERPROFILE\.m2\repository" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Maven repository cleared" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Cleanup completed!" -ForegroundColor Green
Write-Host "📊 Current Docker usage:" -ForegroundColor Blue
docker system df

Write-Host ""
Write-Host "💡 Tips to save space:" -ForegroundColor Yellow
Write-Host "  - Use .dockerignore file"
Write-Host "  - Use multi-stage builds"
Write-Host "  - Clean regularly with this script"
Write-Host "  - Use Docker BuildKit for faster builds"
