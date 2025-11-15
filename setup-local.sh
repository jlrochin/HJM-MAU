#!/bin/bash

set -e

echo "🚀 MAU - Setup Local Development"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "docker-compose.local.yml" ]; then
    echo -e "${RED}Error: docker-compose.local.yml not found${NC}"
    echo "Please run this script from the MAU root directory"
    exit 1
fi

echo -e "${BLUE}Step 1: Setting up Backend (Django)${NC}"
echo "-----------------------------------"

# Create virtualenv if it doesn't exist
if [ ! -d "backend/venv" ]; then
    echo "Creating Python virtual environment..."
    cd backend
    python3 -m venv venv
    cd ..
fi

# Activate virtualenv and install dependencies
echo "Installing Python dependencies..."
cd backend
source venv/bin/activate
pip install --upgrade pip
pip install -r ../requirements.txt
cd ..

echo -e "${GREEN}✓ Backend dependencies installed${NC}"
echo ""

echo -e "${BLUE}Step 2: Setting up Frontend (Vue)${NC}"
echo "-----------------------------------"

cd frontend

# Install dependencies with pnpm
echo "Installing Node dependencies with pnpm..."
pnpm install

cd ..

echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
echo ""

echo -e "${BLUE}Step 3: Starting PostgreSQL with Docker${NC}"
echo "-------------------------------------------"

# Start only PostgreSQL
docker-compose -f docker-compose.local.yml up -d postgres-mau

echo "Waiting for PostgreSQL to be ready..."
sleep 5

echo -e "${GREEN}✓ PostgreSQL is running${NC}"
echo ""

echo -e "${BLUE}Step 4: Running Django Migrations${NC}"
echo "-----------------------------------"

cd backend
source venv/bin/activate

# Export environment variables
export DB_NAME=maudb
export DB_USER=mau_user
export DB_PASSWORD=mau_local_password_123
export DB_HOST=localhost
export DB_PORT=5433
export SECRET_KEY=django-insecure-local-dev-key-DO-NOT-USE-IN-PRODUCTION-123456789
export DEBUG=True

echo "Running migrations..."
python manage.py migrate

echo -e "${GREEN}✓ Migrations completed${NC}"
echo ""

# Create superuser if needed
echo -e "${BLUE}Create Django superuser? (y/n)${NC}"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    python manage.py createsuperuser
fi

cd ..

echo ""
echo -e "${GREEN}=================================="
echo "✓ Setup Complete!"
echo "==================================${NC}"
echo ""
echo "To start development:"
echo ""
echo "Backend (Terminal 1):"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python manage.py runserver 8000"
echo ""
echo "Frontend (Terminal 2):"
echo "  cd frontend"
echo "  pnpm dev"
echo ""
echo "PostgreSQL is already running via Docker."
echo "Access at: http://localhost:3001"
echo "API at: http://localhost:8000/mau/api/"
echo ""
