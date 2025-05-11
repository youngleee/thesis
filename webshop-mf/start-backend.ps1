# PowerShell script to start the WebShop backend server with SQLite integration

Write-Host "Starting WebShop Backend Server with SQLite..." -ForegroundColor Cyan

# Define the project root directory
$rootDir = $PSScriptRoot
$backendDir = Join-Path -Path $rootDir -ChildPath "backend"

# Navigate to the backend directory
Set-Location -Path $backendDir

# Check if node_modules exists, if not run npm install
if (-not (Test-Path -Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm install
}

# Make sure the data directory exists for SQLite database
$dataDir = Join-Path -Path $backendDir -ChildPath "data"
if (-not (Test-Path -Path $dataDir)) {
    Write-Host "Creating data directory for SQLite..." -ForegroundColor Green
    New-Item -ItemType Directory -Path $dataDir
}

# Function to open SQLite database in DB Browser if available
function Open-SQLiteBrowser {
    param (
        [string]$DatabasePath
    )
    
    # Check for common DB Browser for SQLite installation paths
    $dbBrowserPaths = @(
        "C:\Program Files\DB Browser for SQLite\DB Browser for SQLite.exe",
        "C:\Program Files (x86)\DB Browser for SQLite\DB Browser for SQLite.exe"
    )
    
    foreach ($path in $dbBrowserPaths) {
        if (Test-Path -Path $path) {
            Write-Host "Opening SQLite database in DB Browser..." -ForegroundColor Green
            Start-Process -FilePath $path -ArgumentList $DatabasePath
            return $true
        }
    }
    
    Write-Host "DB Browser for SQLite not found. If you want to view the database, install it from https://sqlitebrowser.org/" -ForegroundColor Yellow
    return $false
}

# Start the backend server
Write-Host "Starting backend server..." -ForegroundColor Green
Write-Host "Server will be available at http://localhost:3000" -ForegroundColor Yellow
Write-Host "WebSocket server will be available at ws://localhost:3000" -ForegroundColor Yellow
Write-Host "SQLite database will be created at $dataDir\webshop.db" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server when done" -ForegroundColor Red
Write-Host ""

# Check if user wants to open DB Browser
$openDbBrowser = Read-Host "Would you like to open the SQLite database in DB Browser when ready? (y/n)"
$shouldOpenDbBrowser = $openDbBrowser -eq "y" -or $openDbBrowser -eq "Y"

# Start the backend server
npm run dev

# This will only execute if npm run dev terminates normally
if ($shouldOpenDbBrowser) {
    $dbPath = Join-Path -Path $dataDir -ChildPath "webshop.db"
    if (Test-Path -Path $dbPath) {
        Open-SQLiteBrowser -DatabasePath $dbPath
    }
} 