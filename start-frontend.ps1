# Frontend Startup Script
Write-Host "🚀 Starting Safety Management System Frontend..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

# Navigate to frontend directory
Set-Location "DATN_FONTEND"

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found. Are you in the correct directory?" -ForegroundColor Red
    exit 1
}

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
}

# Create .env.local file if it doesn't exist
if (-not (Test-Path ".env.local")) {
    Write-Host "📝 Creating .env.local file..." -ForegroundColor Yellow
    @"
# Environment Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_BASE_URL=http://localhost:3000
VITE_APP_NAME=Safety Management System
VITE_APP_VERSION=1.0.0

# Features
VITE_ENABLE_WEBSOCKET=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_REAL_TIME_UPDATES=true

# Development
VITE_LOG_LEVEL=info
VITE_ENABLE_CONSOLE_LOGS=true

# Kafka UI (for monitoring)
VITE_KAFKA_UI_URL=http://localhost:8080
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ .env.local file created" -ForegroundColor Green
}

# Start development server
Write-Host "🌐 Starting development server..." -ForegroundColor Yellow
Write-Host "📱 Frontend will be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔌 WebSocket will connect to: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📊 Kafka UI will be available at: http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm run dev
