# Running the WebShop Micro-Frontend Application

This document provides detailed instructions for running the WebShop micro-frontend application, including setup, startup procedures, and troubleshooting common issues.

## Prerequisites

- Node.js (v14.x or higher)
- NPM (v6.x or higher)
- Windows PowerShell or Command Prompt
- [DB Browser for SQLite](https://sqlitebrowser.org/) (optional, for database inspection)

## Installation

Before running the application, ensure all dependencies are installed:

```powershell
# Navigate to the project root
cd webshop-mf

# Install all dependencies (including all micro-frontends)
npm run install-all
```

This command will install dependencies for:
- Root project (including concurrently)
- Backend server
- Shell application
- Product listing micro-frontend
- Product details micro-frontend
- Shopping cart micro-frontend

## Running the Application

### Option 1: Using the Batch File (Easiest)

The simplest way to start the application is to double-click the `start-app.bat` file located in the project root. This will:
1. Open PowerShell with the appropriate execution policy
2. Run the `start-all.ps1` script, which launches all components in separate windows

### Option 2: Using PowerShell Scripts

Several PowerShell scripts are provided for different startup scenarios:

1. **Run all components in separate windows**:
   ```powershell
   .\start-all.ps1
   ```
   This launches each component (backend, shell, product listing, product details, shopping cart) in its own window, making it easy to monitor individual logs.

2. **Run all components in a single window**:
   ```powershell
   .\start-all-single-window.ps1
   ```
   This uses the `concurrently` package to run all components in the current PowerShell window.

3. **Run only the backend**:
   ```powershell
   .\start-backend.ps1
   ```
   This starts only the backend server with SQLite integration and offers to open the database in DB Browser.

### Option 3: Using NPM Scripts

You can also use the NPM scripts defined in the root `package.json`:

```powershell
# Start all components concurrently in a single window
npm run start-all

# Start individual components
npm run start-backend
npm run start-shell
npm run start-product-listing
npm run start-product-details
npm run start-shopping-cart
```

## Application URLs

Once running, the application is accessible at:
- **Main Application**: http://localhost:8082
- **Backend API**: http://localhost:3000
- **WebSocket Server**: ws://localhost:3000

## Troubleshooting

### Concurrently Not Found

If you see an error like:
```
'concurrently' is not recognized as an internal or external command, operable program or batch file.
```

This means the `concurrently` package is missing. Fix it by running:
```powershell
cd webshop-mf
npm install --save-dev concurrently
```

### Port Already in Use

If you see an error like:
```
Error: listen EADDRINUSE: address already in use :::3000
```

This means another application is using the required port. You can:
1. Stop the other application using the port
2. Edit the configuration to use a different port:
   - For backend: Modify the port in `backend/server.js`
   - For frontend components: Modify the port in each component's `vue.config.js`

### Windows PowerShell Execution Policy

If PowerShell scripts won't run due to execution policy restrictions:
```
...cannot be loaded because running scripts is disabled on this system.
```

Run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Or use the bypass flag for a single execution:
```powershell
PowerShell -ExecutionPolicy Bypass -File .\start-all.ps1
```

### WebSocket Connection Issues

If components aren't receiving real-time updates:
1. Check that the backend server is running
2. Open browser developer tools and check for WebSocket errors in the Console
3. Verify that `ws://localhost:3000` is accessible

The application has built-in fallback mechanisms - if WebSockets are unavailable, it will automatically fall back to polling for updates.

### SQLite Database Issues

If you encounter SQLite errors:
1. Ensure the `backend/data` directory exists
2. Check file permissions on the `backend/data` directory
3. Try deleting the existing database file and let the application recreate it:
   ```powershell
   Remove-Item -Path webshop-mf\backend\data\webshop.db
   ```

## Development Tips

### Viewing SQLite Database

To inspect the SQLite database:
1. Install [DB Browser for SQLite](https://sqlitebrowser.org/)
2. Run the `start-backend.ps1` script and choose 'y' when prompted to open DB Browser
3. Or manually open `webshop-mf/backend/data/webshop.db` in DB Browser

### Monitoring WebSocket Messages

To monitor WebSocket messages:
1. Open browser developer tools (F12)
2. Go to the Network tab
3. Filter by "WS" to show WebSocket connections
4. Click on the WebSocket connection to view messages in real-time

## Stopping the Application

- For separate windows: Close each PowerShell window or press Ctrl+C in each
- For single window: Press Ctrl+C and confirm to terminate all processes 