#!/bin/bash

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Starting MAU Development Environment${NC}"
echo "======================================"
echo ""

# Check PostgreSQL
if ! docker ps | grep -q mau-postgres-local; then
    echo "Starting PostgreSQL..."
    docker-compose -f docker-compose.local.yml up -d postgres-mau
    sleep 3
fi

echo -e "${GREEN}✓ PostgreSQL running${NC}"

# Export environment variables for backend
export DB_NAME=maudb
export DB_USER=mau_user
export DB_PASSWORD=mau_local_password_123
export DB_HOST=localhost
export DB_PORT=5433
export SECRET_KEY="django-insecure-local-dev-key-DO-NOT-USE-IN-PRODUCTION"
export DEBUG=True

# Start backend in background
echo "Starting Django backend on port 8000..."
cd backend
source venv/bin/activate
python manage.py runserver 8000 > /tmp/mau-backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"

# Start frontend in background
echo "Starting Vue frontend on port 3001..."
cd frontend
pnpm dev > /tmp/mau-frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

echo ""
echo -e "${GREEN}======================================"
echo "✓ MAU Development Environment Ready!"
echo "======================================${NC}"
echo ""
echo "Access the application:"
echo "  Frontend: http://localhost:3001"
echo "  Backend API: http://localhost:8000/mau/api/"
echo "  Django Admin: http://localhost:8000/admin/"
echo ""
echo "View logs:"
echo "  Backend: tail -f /tmp/mau-backend.log"
echo "  Frontend: tail -f /tmp/mau-frontend.log"
echo ""
echo "Stop servers:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo "  Or: pkill -f 'python manage.py runserver'"
echo "      pkill -f 'vite'"
echo ""
