#!/bin/bash

echo "===================================="
echo "Malnutrition Tracker - Setup Script"
echo "===================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js is not installed!${NC}"
    echo "Please download and install from: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}Node.js is installed ✓${NC}"
echo ""

# Check if Expo CLI is installed
echo "Checking Expo CLI..."
if ! command -v expo &> /dev/null; then
    echo "Installing Expo CLI globally..."
    npm install -g expo-cli
fi
echo -e "${GREEN}Expo CLI is ready ✓${NC}"
echo ""

# Install project dependencies
echo "Installing project dependencies..."
echo "This may take a few minutes..."
npm install
echo -e "${GREEN}Dependencies installed ✓${NC}"
echo ""

echo "===================================="
echo "Setup Complete!"
echo "===================================="
echo ""
echo "To start the app, run: npm start"
echo ""
echo "Options:"
echo "- Press 'a' for Android Emulator"
echo "- Press 'i' for iOS Simulator (Mac only)"
echo "- Scan QR code with Expo Go app on your phone"
echo ""
