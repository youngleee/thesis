# PowerShell script to start all WebShop micro-frontend components in a single window

Write-Host "Starting WebShop Micro-Frontend Application..." -ForegroundColor Cyan
Write-Host "All components will start in this window using concurrently" -ForegroundColor Yellow

# Define the project root directory and navigate to it
$rootDir = $PSScriptRoot
Set-Location -Path $rootDir

# Make sure all dependencies are installed
Write-Host "Checking if concurrently is installed..." -ForegroundColor Green
$packageJson = Get-Content -Path "package.json" -Raw | ConvertFrom-Json
$hasConcurrently = $packageJson.devDependencies.concurrently -ne $null

if (-not $hasConcurrently) {
    Write-Host "Installing concurrently package..." -ForegroundColor Yellow
    npm install --save-dev concurrently
}

# Run the start-all script from package.json
Write-Host "Starting all components..." -ForegroundColor Green
npm run start-all

# The script will continue running until manually terminated
Write-Host "Press Ctrl+C to stop all components when done" -ForegroundColor Red 