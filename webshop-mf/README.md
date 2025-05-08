# Micro-Frontend Webshop

A demonstration of a simple webshop built with micro-frontend architecture for a Bachelor thesis project. This project showcases how to implement micro-frontends using Webpack 5 Module Federation with Vue.js.

## Project Overview

This project demonstrates a micro-frontend architecture for an e-commerce application. It consists of:

- A **shell application** that serves as the container/host for other micro-frontends
- A **product-listing micro-frontend** that displays the available products
- A **shopping-cart micro-frontend** that manages the user's shopping cart
- A simple **backend service** that provides product data and cart management through a REST API

## Technology Stack

- **Frontend**: Vue.js 3
- **Micro-frontend Integration**: Webpack 5 Module Federation
- **Backend**: Node.js with Express.js
- **Database**: SQLite (future implementation - currently using in-memory data)
- **Styling**: Custom CSS (no frameworks for simplicity)
- **API Communication**: Axios for HTTP requests

## What are Micro-Frontends?

Micro-frontends are an architectural pattern that extends the concepts of microservices to the frontend world. The core ideas are:

1. **Breaking down the monolith**: Instead of a single, large frontend application, the UI is decomposed into smaller, more manageable pieces.
2. **Independent development**: Each team can work on its piece of the frontend independently.
3. **Technology agnostic**: Different parts of the application can potentially use different frameworks or versions.
4. **Independent deployment**: Each micro-frontend can be deployed without affecting others.
5. **Runtime integration**: The pieces come together at runtime in the user's browser, not at build time.

## Project Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User's Browser                         │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                        Shell Application                    │
│                 http://localhost:8082                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                     Header & Navigation                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌───────────────────────────┐ ┌───────────────────────────┐ │
│ │  Remote Product Listing   │ │   Remote Shopping Cart    │ │
│ │         (MFE)             │ │          (MFE)            │ │
│ └───────────────────────────┘ └───────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                         Footer                          │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────┬─────────────────────────────┬─┘
                              │                             │
                              ▼                             │
┌─────────────────────────────────────────────┐             │
│         Product Listing Micro-Frontend      │             │
│           http://localhost:8081             │             │
│ ┌─────────────────────────────────────────┐ │             │
│ │           ProductList.vue               │ │             │
│ │           (Exposed Component)           │ │             │
│ └─────────────────────────────────────────┘ │             │
└────┬─────────────────────────────────────┬──┘             │
     │                                     │                │
     │                                     ▼                ▼
     │                     ┌─────────────────────────────────┐
     │                     │ Shopping Cart Micro-Frontend    │
     │                     │     http://localhost:8083       │
     │                     │ ┌─────────────────────────────┐ │
     │                     │ │     ShoppingCart.vue        │ │
     │                     │ │     (Exposed Component)     │ │
     │                     │ └─────────────────────────────┘ │
     │                     └──────────────┬──────────────────┘
     │                                    │
     ▼                                    ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend Service                         │
│                  http://localhost:3000                       │
│ ┌─────────────────┐ ┌──────────────────┐ ┌─────────────────┐│
│ │  /api/products  │ │ /api/products/:id│ │   /api/cart     ││
│ └─────────────────┘ └──────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
webshop-mf/
├── README.md                 # Main project documentation
├── shell/                    # Vue.js host application
│   ├── node_modules/         # Dependencies
│   ├── public/               # Static assets
│   ├── src/                  # Source code
│   │   ├── assets/           # Images and other assets
│   │   ├── components/       # Vue components
│   │   │   └── FallbackProductList.vue  # Fallback UI
│   │   ├── App.vue           # Main application component
│   │   └── main.js           # Application entry point
│   ├── .gitignore            # Git ignore file
│   ├── babel.config.js       # Babel configuration
│   ├── package.json          # Dependencies and scripts
│   ├── README.md             # Shell-specific documentation
│   └── vue.config.js         # Vue CLI + Module Federation config
│
├── product-listing/          # Vue.js micro-frontend
│   ├── node_modules/         # Dependencies
│   ├── public/               # Static assets
│   ├── src/                  # Source code
│   │   ├── assets/           # Images and other assets
│   │   ├── components/       # Vue components
│   │   │   └── ProductList.vue  # Main exposed component
│   │   ├── App.vue           # Application component for standalone mode
│   │   └── main.js           # Entry point with Federation support
│   ├── .gitignore            # Git ignore file
│   ├── babel.config.js       # Babel configuration
│   ├── package.json          # Dependencies and scripts
│   ├── README.md             # Product-listing specific documentation
│   └── vue.config.js         # Vue CLI + Module Federation config
│
├── shopping-cart/            # Vue.js micro-frontend
│   ├── node_modules/         # Dependencies
│   ├── public/               # Static assets
│   ├── src/                  # Source code
│   │   ├── assets/           # Images and other assets
│   │   ├── components/       # Vue components
│   │   │   └── ShoppingCart.vue  # Main exposed component
│   │   ├── App.vue           # Application component for standalone mode
│   │   └── main.js           # Entry point with Federation support
│   ├── .gitignore            # Git ignore file
│   ├── babel.config.js       # Babel configuration
│   ├── package.json          # Dependencies and scripts
│   ├── README.md             # Shopping-cart specific documentation
│   └── vue.config.js         # Vue CLI + Module Federation config
│
└── backend/                  # Node.js/Express server
    ├── node_modules/         # Dependencies
    ├── server.js             # Express server implementation
    ├── package.json          # Dependencies and scripts
    └── README.md             # Backend-specific documentation
```

## How Webpack Module Federation Works

Module Federation is a feature of Webpack 5 that enables sharing JavaScript modules between different applications at runtime.

### Key Concepts

1. **Host vs. Remote**: 
   - **Host** (Shell): The container application that consumes remote modules
   - **Remote** (Product-listing, Shopping-cart): Applications that expose modules for consumption

2. **Module Sharing**:
   - Remote applications expose specific modules via a manifest file (`remoteEntry.js`)
   - Host applications can import these exposed modules at runtime
   - Both can share common dependencies (e.g., Vue.js)

3. **Shared Dependencies**:
   - Libraries used by multiple applications can be shared to avoid duplication
   - `singleton: true` ensures only one instance of the library exists

### Cross-Micro-Frontend Communication

In our implementation, micro-frontends can communicate in these ways:

1. **Backend Communication**: Both micro-frontends interact with the backend API
2. **UI Updates**: Actions in one micro-frontend (adding a product to cart) cause changes visible in another (shopping cart updates)
3. **Event-based**: Future implementation could use custom events or a shared state library

## Setup Process

### 1. Backend Setup

The backend is a simple Express.js server that provides product data and cart management through a REST API.

```bash
# Initialize the Node.js project
cd backend
npm init -y

# Install dependencies
npm install express cors

# Create the server.js file with Express routes
# See backend/server.js for implementation details
```

**Key Implementation Details:**
- CORS middleware enables cross-origin requests from micro-frontends
- In-memory array of product objects (could be replaced with a database)
- RESTful endpoints for retrieving product data and managing cart
- Error handling for API operations

### 2. Shell Application Setup

The shell application is a Vue.js 3 application that serves as the host for micro-frontends.

```bash
# Create a new Vue project
cd shell
vue create -m npm --merge --no-git --preset default .

# Install Webpack for Module Federation
npm install webpack webpack-cli

# Modify vue.config.js, main.js, and App.vue
# See shell directory for implementation details
```

**Key Implementation Details:**
- Modified entry point in `main.js` to support Module Federation
- Custom `vue.config.js` with ModuleFederationPlugin configuration
- `App.vue` uses `defineAsyncComponent` to load remote components
- Graceful error handling with fallback UI
- Responsive layout to display multiple micro-frontends

### 3. Product Listing Micro-frontend Setup

The product listing is a separate Vue.js application that exposes components for use in the shell application.

```bash
# Create a new Vue project
cd product-listing
vue create -m npm --merge --no-git --preset default .

# Install dependencies
npm install webpack webpack-cli axios

# Modify vue.config.js, create ProductList component, etc.
# See product-listing directory for implementation details
```

**Key Implementation Details:**
- Exposing the `ProductList.vue` component via Module Federation
- Axios for making HTTP requests to the backend
- UI for displaying and interacting with products
- Add to cart functionality with feedback messages

### 4. Shopping Cart Micro-frontend Setup

The shopping cart is a separate Vue.js application that provides cart management functionality.

```bash
# Create a new Vue project
cd shopping-cart
vue create -m npm --merge --no-git --preset default .

# Install dependencies
npm install webpack webpack-cli axios

# Modify vue.config.js, create ShoppingCart component, etc.
# See shopping-cart directory for implementation details
```

**Key Implementation Details:**
- Exposing the `ShoppingCart.vue` component via Module Federation
- Cart management functionality (view, update quantity, remove items)
- Real-time cart total calculation
- Clean, responsive UI with feedback for user actions

## Advanced Concepts

### Fallback Mechanism

The shell application implements fallback logic in case a remote fails to load:

```javascript
RemoteProductList: defineAsyncComponent(() => 
  import('productListing/ProductList')
    .catch(err => {
      console.error('Error loading remote component:', err)
      return import('./components/FallbackProductList.vue')
    })
)
```

### Shared Dependencies

All applications share Vue as a singleton to ensure consistent state:

```javascript
shared: {
  vue: {
    singleton: true,
    eager: true  // Load immediately instead of on-demand
  }
}
```

### Standalone vs. Federated Mode

Each micro-frontend can run in two modes:

1. **Standalone Mode**: Running independently for development
2. **Federated Mode**: Running as part of the shell application

This is handled in the entry point:

```javascript
// If we're not running in the context of a container, mount immediately
if (!window.__POWERED_BY_FEDERATION__) {
  mount()
}

export { mount }  // Export for use in federated mode
```

## Running the Application

To run the application, you need to start all four components in separate terminal windows:

### 1. Start the Backend

```bash
cd webshop-mf/backend
npm start
```

The backend will run on http://localhost:3000.

### 2. Start the Product Listing Micro-frontend

```bash
cd webshop-mf/product-listing
npm run serve
```

The product listing will run on http://localhost:8081.

### 3. Start the Shopping Cart Micro-frontend

```bash
cd webshop-mf/shopping-cart
npm run serve
```

The shopping cart will run on http://localhost:8083.

### 4. Start the Shell Application

```bash
cd webshop-mf/shell
npm run serve
```

The shell application will run on http://localhost:8082.

### Running in Windows PowerShell

In Windows PowerShell, each command needs to be run in a separate PowerShell window:

```powershell
# PowerShell Window 1 - Backend
cd C:\path\to\webshop-mf\backend
npm start

# PowerShell Window 2 - Product Listing
cd C:\path\to\webshop-mf\product-listing
npm run serve

# PowerShell Window 3 - Shopping Cart
cd C:\path\to\webshop-mf\shopping-cart
npm run serve

# PowerShell Window 4 - Shell
cd C:\path\to\webshop-mf\shell
npm run serve
```

Note: Replace `C:\path\to\` with your actual project path.

## Testing the Integration

1. Open http://localhost:8082 in your browser
2. The shell application should load and display both micro-frontends
3. Add products to the cart from the product listing
4. See the cart update in real time
5. Modify quantities or remove items in the cart
6. Try stopping one of the micro-frontend servers - the shell should display the fallback UI

## Troubleshooting

If you encounter issues:

1. **Port conflicts**: If any port is already in use, you can modify the port in the respective `vue.config.js` files
2. **CORS errors**: Check that the backend CORS middleware is properly configured
3. **Module Federation errors**: Ensure publicPath is set correctly in all vue.config.js files
4. **Component not loading**: Check browser console for JavaScript errors
5. **Cart API issues**: Verify that the correct endpoints are being called with proper parameters

## Thesis Context

This project demonstrates several key aspects of micro-frontend architecture that are relevant for a Bachelor thesis:

1. **Independent Development**: Each micro-frontend can be developed, tested, and deployed independently.
2. **Technology Encapsulation**: Implementation details of each micro-frontend are hidden from other parts of the application.
3. **Runtime Integration**: Components are integrated at runtime through Webpack Module Federation.
4. **Shared Dependencies**: Common libraries (e.g., Vue) are shared to avoid duplication.
5. **Resilience**: Fallback mechanisms when micro-frontends fail to load.
6. **Contract-based Development**: Micro-frontends and backend communicate through well-defined interfaces.
7. **Cross-Micro-Frontend Communication**: Different micro-frontends can interact through the backend API.

## Future Enhancements

Potential enhancements for the thesis project:

1. **Additional Micro-frontends**:
   - User authentication and profile
   - Product details page
   - Checkout process

2. **Technical Improvements**:
   - Implement SQLite database integration
   - Add authentication and authorization
   - Implement CI/CD pipelines for independent deployment
   - Add routing and navigation between micro-frontends
   - Implement styling and design system shared across micro-frontends
   - Add shared state management library

3. **Architecture Exploration**:
   - Compare with other micro-frontend approaches (iframe, Web Components)
   - Analyze performance implications
   - Evaluate build-time vs. runtime integration strategies

## Resources

- [Webpack Module Federation Documentation](https://webpack.js.org/concepts/module-federation/)
- [Vue.js Documentation](https://vuejs.org/guide/introduction.html)
- [Express.js Documentation](https://expressjs.com/en/4x/api.html)
- [Micro-Frontends.org](https://micro-frontends.org/) 