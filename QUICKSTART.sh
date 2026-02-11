#!/bin/bash
# Quick Start Script for Thamanya Media Backend

set -e

echo "🚀 Thamanya Media Backend - Quick Start"
echo "========================================"
echo ""

# Check prerequisites
echo "✓ Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "✗ Docker not found. Please install Docker Desktop."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "✗ Node.js not found. Please install Node.js 18+."
    exit 1
fi

echo "  Docker: $(docker --version)"
echo "  Node.js: $(node --version)"
echo "  npm: $(npm --version)"
echo ""

# Step 1: Start Docker containers
echo "📦 Step 1/5: Starting Docker containers..."
docker-compose up -d
echo "  Waiting for PostgreSQL to be ready..."
sleep 5

# Check if database is ready
until docker-compose exec -T postgres pg_isready -U thamanya_user; do
    echo "  PostgreSQL not ready yet, waiting..."
    sleep 2
done
echo "✓ PostgreSQL is ready"
echo ""

# Step 2: Install dependencies
echo "📚 Step 2/5: Installing npm dependencies..."
npm install > /dev/null 2>&1
echo "✓ Dependencies installed"
echo ""

# Step 3: Seed database
echo "🌱 Step 3/5: Seeding database with 10k records..."
npm run seed > /dev/null
echo "✓ Database seeded"
echo ""

# Step 4: Build application
echo "🔨 Step 4/5: Building application..."
npm run build > /dev/null 2>&1 || echo "  (Build skipped - compile on start)"
echo "✓ Application ready"
echo ""

# Step 5: Provide instructions
echo "✅ Step 5/5: Setup complete!"
echo ""
echo "🎯 Next steps:"
echo ""
echo "1. Start the API server (in a new terminal):"
echo "   npm run start:dev"
echo ""
echo "2. Test the API:"
echo "   curl 'http://localhost:3000/api/v1/programs/search?q=drama'"
echo ""
echo "3. Run load test (after starting API):"
echo "   k6 run scripts/load-test.js"
echo ""
echo "📖 Documentation:"
echo "   - SETUP_GUIDE.md - Detailed setup instructions"
echo "   - README.md - API endpoints and commands"
echo "   - ARCHITECTURE.md - Deep dive into the design"
echo ""
echo "🐳 Docker commands:"
echo "   npm run docker:logs  - View container logs"
echo "   npm run docker:down  - Stop containers"
echo "   npm run docker:up    - Start containers"
echo ""
echo "Happy coding! 🎉"
