#!/bin/bash

# KnoRa Unified Run Script
# Starts both backend (Rust) and frontend (Next.js) in parallel

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}       KnoRa - Unified Run Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to start backend
start_backend() {
    echo -e "${YELLOW}Starting Backend (Rust)...${NC}"
    cd "$BACKEND_DIR"

    if [ -f "Cargo.toml" ]; then
        cargo run &
        BACKEND_PID=$!
        echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
    else
        echo -e "${RED}✗ Backend Cargo.toml not found${NC}"
        exit 1
    fi
}

# Function to start frontend
start_frontend() {
    echo -e "${YELLOW}Starting Frontend (Next.js)...${NC}"
    cd "$FRONTEND_DIR"

    if [ -f "package.json" ]; then
        npm run dev &
        FRONTEND_PID=$!
        echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
    else
        echo -e "${RED}✗ Frontend package.json not found${NC}"
        exit 1
    fi
}

# Function to cleanup on exit
cleanup() {
    echo -e "${YELLOW}Shutting down...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    echo -e "${GREEN}✓ All services stopped${NC}"
}

# Setup trap to catch exit signals
trap cleanup EXIT INT TERM

# Start both services
start_backend
start_frontend

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}     Both Services Running Successfully${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Backend:  http://localhost:8000"
echo -e "Frontend: http://localhost:3000"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both services${NC}"
echo ""

# Wait for all background processes
wait
