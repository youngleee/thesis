# PowerShell script to start all WebShop micro-frontend components

Write-Host "Starting WebShop Micro-Frontend Application..." -ForegroundColor Cyan

# Define the project root directory
$rootDir = $PSScriptRoot

# Function to start a component in a new PowerShell window
function Start-Component {
    param (
        [string]$Name,
        [string]$Path,
        [string]$Command
    )
    
    Write-Host "Starting $Name..." -ForegroundColor Green
    
    # Create the full command with proper path
    $fullPath = Join-Path -Path $rootDir -ChildPath $Path
    $fullCommand = "cd '$fullPath'; $Command; Read-Host 'Press Enter to exit'"
    
    # Start a new PowerShell window with the command
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $fullCommand -WindowStyle Normal
}

# Start each component in a separate window
Start-Component -Name "Backend Server" -Path "backend" -Command "npm run dev"

# Wait a moment for the backend to initialize
Start-Sleep -Seconds 3

# Start all frontend components
Start-Component -Name "Shell Application" -Path "shell" -Command "npm run serve"
Start-Component -Name "Product Listing" -Path "product-listing" -Command "npm run serve"
Start-Component -Name "Product Details" -Path "product-details" -Command "npm run serve"
Start-Component -Name "Shopping Cart" -Path "shopping-cart" -Command "npm run serve"
Start-Component -Name "Checkout" -Path "checkout" -Command "npm run serve"

Write-Host "All components started successfully!" -ForegroundColor Cyan
Write-Host "Access the application at http://localhost:8082" -ForegroundColor Yellow
Write-Host "Backend API available at http://localhost:3000" -ForegroundColor Yellow

# Launch the default browser to the shell application
Start-Process "http://localhost:8082" 