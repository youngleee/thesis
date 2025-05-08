# Product Listing Micro-Frontend

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Micro-Frontend Architecture

This product listing component is part of a micro-frontend architecture, designed to work both as a standalone application and as a remote module integrated into a shell application.

### Technical Details

- **Framework**: Vue.js 3
- **Integration Method**: Webpack 5 Module Federation
- **Role**: Remote (Micro-Frontend)
- **Port**: Running on 8081

## Features

### Product Display
- Responsive grid layout of products
- Product images, names, prices, and descriptions
- Loading and error states
- Empty state for when no products are found

### Search Functionality
- Accepts search terms as props from the shell
- Listens for custom search events
- Filters products by name and description
- Provides visual feedback for search results

### Cart Integration
- "Add to Cart" functionality for each product
- Visual feedback when a product is added (success message)
- Error handling for failed cart operations
- Navigation to cart view

## Implementation Details

### Module Federation Configuration

The product listing is configured as a remote in `vue.config.js`:

```javascript
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')

module.exports = {
  // ...
  publicPath: 'http://localhost:8081/',
  configureWebpack: {
    optimization: {
      splitChunks: false,
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'productListing',
        filename: 'remoteEntry.js',
        exposes: {
          './ProductList': './src/components/ProductList.vue',
        },
        shared: {
          vue: {
            singleton: true,
          }
        }
      })
    ]
  },
  devServer: {
    port: 8081,
    hot: true,
  }
}
```

### Cart Integration

The product listing component integrates with the shopping cart through a well-defined API and event system:

#### API Integration

```javascript
const addToCart = async (productId) => {
  try {
    // Set loading state for this product
    addingToCart[productId] = true
    
    // Call the API to add the product to the cart
    await axios.post('http://localhost:3000/api/cart', {
      productId,
      quantity: 1
    })
    
    // Show success message and dispatch event
    cartMessage.value = 'Product added to cart!'
    cartError.value = false
    
    // Dispatch a custom event to notify the shell and other micro-frontends
    window.dispatchEvent(new CustomEvent('cart-updated', { 
      detail: { action: 'add', productId }
    }))
    
    // Clear the message after 3 seconds
    setTimeout(() => {
      cartMessage.value = ''
    }, 3000)
  } catch (err) {
    // Error handling
    cartMessage.value = `Error adding to cart: ${err.message}`
    cartError.value = true
  } finally {
    // Clear loading state
    addingToCart[productId] = false
  }
}
```

#### Event-Based Communication

The product listing component participates in cross-micro-frontend communication using custom events:

1. **Cart Update Events**: When a product is added to the cart, it dispatches a `cart-updated` event that other components can listen for.

2. **Navigation Events**: It dispatches a `navigate` event when the user clicks "View Cart" to navigate to the cart view.

```javascript
const navigateToCart = () => {
  // For standalone mode, redirect to shopping cart port
  if (!window.__POWERED_BY_FEDERATION__) {
    window.location.href = 'http://localhost:8083';
  } else {
    // When running in the shell, use the shell's navigation system
    window.dispatchEvent(new CustomEvent('navigate', { 
      detail: { path: '/cart' }
    }));
  }
};
```

### Adaptive Mode Detection

The component detects whether it's running in standalone mode or as part of the shell application:

```javascript
const isInsideShell = ref(!!window.__POWERED_BY_FEDERATION__)
```

This allows it to adjust its behavior accordingly, such as showing/hiding the "View Cart" button and handling navigation differently.

## Best Practices Demonstrated

### Micro-Frontend Patterns

1. **Autonomous Functionality**: Works independently as a standalone application
2. **Seamless Integration**: Integrates with the shell via well-defined interfaces
3. **Adaptive Rendering**: Adjusts UI based on context (shell vs. standalone)
4. **Event-Based Communication**: Uses custom events for cross-component communication

### UX Patterns

1. **Loading States**: Shows spinners during data fetching
2. **Error Handling**: Gracefully displays errors with helpful messages
3. **Empty States**: Provides friendly UI when no products match search criteria
4. **Feedback Messages**: Shows toast notifications for cart operations

## Running the Application

```bash
# Install dependencies
npm install

# Start the development server
npm run serve
```

The application will be available at http://localhost:8081.

**Note**: To test all functionality, ensure the backend server is running at http://localhost:3000.
