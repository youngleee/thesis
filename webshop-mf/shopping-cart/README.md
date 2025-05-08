# Shopping Cart Micro-Frontend

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

This shopping cart component is part of a micro-frontend architecture, designed to work both as a standalone application and as a remote module integrated into a shell application.

### Technical Details

- **Framework**: Vue.js 3
- **Integration Method**: Webpack 5 Module Federation
- **Role**: Remote (Micro-Frontend)
- **Port**: Running on 8083

## Features

### Cart Management
- Display of cart items with product details
- Quantity adjustment controls
- Item removal functionality
- Cart summary with totals
- Empty cart state with navigation to products
- Cart clearing functionality

### Real-time Updates
- Listens for cart updates from other micro-frontends
- Auto-refreshes when cart changes occur
- Publishes cart update events when changes are made locally

### Navigation Integration
- "Continue Shopping" functionality
- Adapts navigation method based on context (shell vs. standalone)

## Implementation Details

### Module Federation Configuration

The shopping cart is configured as a remote in `vue.config.js`:

```javascript
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')

module.exports = {
  // ...
  publicPath: 'http://localhost:8083/',
  configureWebpack: {
    optimization: {
      splitChunks: false,
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'shoppingCart',
        filename: 'remoteEntry.js',
        exposes: {
          './ShoppingCart': './src/components/ShoppingCart.vue',
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
    port: 8083,
    hot: true,
  }
}
```

### Real-time Cart Updates

The shopping cart component implements a real-time update system using custom events:

#### Event Listening

```javascript
// Handle cart update events from other micro-frontends
const handleCartUpdate = (event) => {
  console.log('Cart update event received:', event.detail);
  fetchCart();
};

onMounted(() => {
  fetchCart();
  
  // Listen for cart update events
  window.addEventListener('cart-updated', handleCartUpdate);
});

// Clean up event listeners when component is unmounted
onBeforeUnmount(() => {
  window.removeEventListener('cart-updated', handleCartUpdate);
});
```

#### Event Publishing

The component dispatches cart update events when changes are made:

```javascript
// When updating item quantity
const updateQuantity = async (id, newQuantity) => {
  if (newQuantity < 1) return;
  
  try {
    await axios.put(`http://localhost:3000/api/cart/${id}`, { quantity: newQuantity });
    // Update local state
    const itemIndex = cart.value.findIndex(item => item.id === id);
    if (itemIndex !== -1) {
      cart.value[itemIndex].quantity = newQuantity;
    }
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('cart-updated', { 
      detail: { action: 'update', productId: id, quantity: newQuantity }
    }));
  } catch (err) {
    error.value = `Error updating quantity: ${err.message}`;
  }
};

// Similar events are dispatched for removeFromCart and clearCart operations
```

### Navigation Integration

The component adapts its navigation behavior based on whether it's running in the shell or standalone:

```javascript
const navigateToProductList = () => {
  // For standalone mode, redirect to product listing port
  if (!window.__POWERED_BY_FEDERATION__) {
    window.location.href = 'http://localhost:8081';
  } else {
    // When running in the shell, use the shell's navigation system
    window.dispatchEvent(new CustomEvent('navigate', { 
      detail: { path: '/products' }
    }));
  }
};
```

## Cart API Integration

The component interacts with the backend API for all cart operations:

1. **Fetch Cart**: `GET /api/cart`
2. **Update Quantity**: `PUT /api/cart/:productId`
3. **Remove Item**: `DELETE /api/cart/:productId`
4. **Clear Cart**: `DELETE /api/cart`

## Cross-Micro-Frontend Communication

### Event Types

1. **cart-updated**: Dispatched when cart contents change
   - Contains action type (`add`, `update`, `remove`, `clear`)
   - Includes relevant IDs and quantities

2. **navigate**: Dispatched for navigation requests
   - Contains target path information

### Communication Pattern

The shopping cart implements a publish-subscribe pattern:
- **Publisher**: Dispatches events when local cart changes occur
- **Subscriber**: Listens for events from other components (e.g., product listing)
- **Event Bus**: Uses the browser's `window` object

## Best Practices Demonstrated

1. **Clean Event Handling**: Proper setup and cleanup of event listeners
2. **Contextual Behavior**: Adapts functionality based on execution context
3. **Optimistic UI Updates**: Updates local state before waiting for API response
4. **Error Handling**: Graceful error states with helpful messages
5. **Loading States**: Visual feedback during API operations

## Running the Application

```bash
# Install dependencies
npm install

# Start the development server
npm run serve
```

The application will be available at http://localhost:8083.

**Note**: To test all functionality, ensure the backend server is running at http://localhost:3000 and, if testing in standalone mode, the product listing at http://localhost:8081. 