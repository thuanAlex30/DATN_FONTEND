@echo off
echo 🚀 Starting Safety Management System Frontend...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Navigate to frontend directory
cd DATN_FONTEND

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ package.json not found. Are you in the correct directory?
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
)

REM Create .env.local file if it doesn't exist
if not exist ".env.local" (
    echo 📝 Creating .env.local file...
    (
        echo # Environment Configuration
        echo VITE_API_BASE_URL=http://localhost:3000/api
        echo VITE_WS_BASE_URL=http://localhost:3000
        echo VITE_APP_NAME=Safety Management System
        echo VITE_APP_VERSION=1.0.0
        echo.
        echo # Features
        echo VITE_ENABLE_WEBSOCKET=true
        echo VITE_ENABLE_NOTIFICATIONS=true
        echo VITE_ENABLE_REAL_TIME_UPDATES=true
        echo.
        echo # Development
        echo VITE_LOG_LEVEL=info
        echo VITE_ENABLE_CONSOLE_LOGS=true
        echo.
        echo # Kafka UI ^(for monitoring^)
        echo VITE_KAFKA_UI_URL=http://localhost:8080
    ) > .env.local
    echo ✅ .env.local file created
)

REM Start development server
echo 🌐 Starting development server...
echo 📱 Frontend will be available at: http://localhost:5173
echo 🔌 WebSocket will connect to: http://localhost:3000
echo 📊 Kafka UI will be available at: http://localhost:8080
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev
