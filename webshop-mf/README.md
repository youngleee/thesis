# WebShop Micro-Frontend Application

A micro-frontend demo application showcasing real-time WebSocket communication for thesis research.

## Project Overview

This project demonstrates a micro-frontend architecture for an e-commerce application with real-time communication using WebSockets. The application consists of several independent micro-frontends:

- **Shell**: Container application that orchestrates and loads other micro-frontends
- **Product Listing**: Displays products and allows users to browse the catalog
- **Product Details**: Shows detailed information about a specific product
- **Shopping Cart**: Manages the user's shopping cart with real-time updates

The backend service provides both RESTful API endpoints and WebSocket communication, with data persistence using SQLite.

## Key Features

- Micro-frontend architecture using Webpack 5 Module Federation
- Real-time communication between micro-frontends via WebSockets
- SQLite database for persistent data storage
- Resilient design with fallback mechanisms for offline scenarios
- Independent development and deployment of each micro-frontend
- Shared dependencies to reduce bundle sizes
- Comprehensive documentation for thesis purposes

## Prerequisites

- Node.js (v14+)
- npm (v6+)
- Windows PowerShell or Command Prompt
- [DB Browser for SQLite](https://sqlitebrowser.org/) (optional, for database inspection)

## Installation

Clone the repository and install dependencies:

```powershell
# Clone the repository
git clone <your-repo-url>
cd webshop-mf

# Install dependencies for all projects
npm run install-all
```

## Running the Application

### Quickest Method
Double-click the `start-app.bat` file in the project root to launch all components.

### Using PowerShell Scripts
Several PowerShell scripts are provided for different scenarios:

```powershell
# Start all components in separate windows
.\start-all.ps1

# Start all components in a single window
.\start-all-single-window.ps1

# Start only the backend server
.\start-backend.ps1
```

### Using NPM Scripts
You can also use npm scripts:

```powershell
# Start all services with a single command
npm run start-all

# Or start each component individually
npm run start-backend
npm run start-shell
npm run start-product-listing
npm run start-product-details
npm run start-shopping-cart
```

For detailed instructions and troubleshooting, see [Running the Application](./docs/RunningTheApplication.md).

## Accessing the Application

Once all services are running, you can access the application at:

- **Shell (Main Application)**: [http://localhost:8082](http://localhost:8082)
- **Product Listing (Standalone)**: [http://localhost:8083](http://localhost:8083)
- **Product Details (Standalone)**: [http://localhost:8084](http://localhost:8084)
- **Shopping Cart (Standalone)**: [http://localhost:8085](http://localhost:8085)
- **Backend API**: [http://localhost:3000](http://localhost:3000)
- **WebSocket Server**: [ws://localhost:3000](ws://localhost:3000)

## Project Scripts

To facilitate installation and running of all micro-frontends, we need to create appropriate scripts.

### Install these scripts in the root `package.json`:

```json
{
  "name": "webshop-mf",
  "version": "1.0.0",
  "description": "WebShop Micro-Frontend Demo with WebSocket Integration",
  "scripts": {
    "install-all": "npm install && npm run install-backend && npm run install-shell && npm run install-product-listing && npm run install-product-details && npm run install-shopping-cart",
    "install-backend": "cd backend && npm install",
    "install-shell": "cd shell && npm install",
    "install-product-listing": "cd product-listing && npm install",
    "install-product-details": "cd product-details && npm install", 
    "install-shopping-cart": "cd shopping-cart && npm install",
    "start-all": "concurrently \"npm run start-backend\" \"npm run start-shell\" \"npm run start-product-listing\" \"npm run start-product-details\" \"npm run start-shopping-cart\"",
    "start-backend": "cd backend && npm run dev",
    "start-shell": "cd shell && npm run serve",
    "start-product-listing": "cd product-listing && npm run serve",
    "start-product-details": "cd product-details && npm run serve",
    "start-shopping-cart": "cd shopping-cart && npm run serve"
  },
  "devDependencies": {
    "concurrently": "^7.6.0"
  }
}
```

## Documentation

Comprehensive documentation for this project can be found in the `/docs` directory:

- [Main Documentation Index](./docs/README.md)
- [WebSocket Integration](./docs/WebSocketIntegration.md)
- [WebSocket Communication Flow](./docs/WebSocketFlow.md)
- [Running the Application](./docs/RunningTheApplication.md) - Detailed setup and troubleshooting guide

## Testing WebSocket Functionality

1. Open the application in multiple browser tabs
2. Add or remove items from the cart in one tab
3. Observe real-time updates in all other tabs without refreshing

You can also observe the WebSocket communication:
1. Open browser DevTools
2. Go to the Network tab
3. Filter by "WS" to see WebSocket connections
4. Click on the connection to view the messages being exchanged

## Project Structure

```
webshop-mf/
├── backend/                  # Backend server with REST API and WebSocket
│   └── data/                 # SQLite database directory
├── shell/                    # Container application
├── product-listing/          # Product catalog micro-frontend
├── product-details/          # Product details micro-frontend
├── shopping-cart/            # Shopping cart micro-frontend
├── docs/                     # Documentation for thesis
│   ├── README.md
│   ├── WebSocketIntegration.md
│   ├── WebSocketFlow.md
│   └── RunningTheApplication.md
├── start-all.ps1             # PowerShell script to start all components in separate windows
├── start-all-single-window.ps1 # PowerShell script to start all components in one window
├── start-backend.ps1         # PowerShell script to start only the backend
├── start-app.bat             # Windows batch file for easy startup
└── README.md                 # This file
```

## Thesis Research

This project serves as a practical implementation for research on micro-frontend architectures with real-time communication. The implementation demonstrates how WebSockets can be effectively used to synchronize state across independently deployed frontend applications, and how SQLite provides a lightweight yet effective solution for data persistence.

## License

MIT 