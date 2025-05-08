# Product Details Micro-Frontend

This is the product details micro-frontend for the Micro-Frontend Webshop project. It provides a comprehensive product detail page view that can be integrated into the shell application.

## Overview

The product details micro-frontend is responsible for:
- Displaying detailed information about a specific product
- Showing product images with a gallery view
- Presenting specifications, reviews, and shipping information
- Providing "Add to Cart" functionality
- Showing related products

## Technical Details

- **Framework**: Vue.js 3
- **Integration Method**: Webpack 5 Module Federation
- **Role**: Remote (Micro-Frontend)
- **Port**: Running on 8084

## Features

### Product Information Display
- Product name, price, and description
- Product images with gallery and hover zoom effect
- Rating and review summary
- Stock availability indicator
- Original price and discount percentage calculation

### Product Details Sections
- Tabbed interface with specifications, reviews, and shipping information
- Key features list
- Detailed product specifications organized by category

### Purchasing Options
- Quantity selector
- Add to cart button with loading state
- Save for later (wishlist) option
- Success/error message feedback

### Related Products
- Display of related products
- Quick navigation to other product details

## Implementation Details

### Module Federation Configuration

The product details component is configured as a remote in `vue.config.js`:

```javascript
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')

module.exports = {
  // ...
  publicPath: 'http://localhost:8084/',
  configureWebpack: {
    optimization: {
      splitChunks: false,
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'productDetails',
        filename: 'remoteEntry.js',
        exposes: {
          './ProductDetails': './src/components/ProductDetails.vue',
        },
        shared: {
          vue: {
            singleton: true,
          },
          axios: {
            singleton: true,
          }
        }
      })
    ]
  },
  devServer: {
    port: 8084,
    hot: true,
  }
}
```

### API Integration

The component interacts with the backend API for all product-related operations:

1. **Fetch Product Details**: `GET /api/products/:id`
2. **Add to Cart**: `POST /api/cart`
3. **Fetch Related Products**: `GET /api/products`

### Cross-Micro-Frontend Communication

The product details component participates in cross-micro-frontend communication using custom events:

1. **Cart Update Events**: When a product is added to the cart, it dispatches a `cart-updated` event that other components can listen for.

```javascript
window.dispatchEvent(new CustomEvent('cart-updated', { 
  detail: { 
    action: 'add', 
    productId: product.value.id,
    quantity: quantity.value
  }
}));
```

2. **Navigation Events**: It dispatches a `navigate` event when the user needs to navigate to other views.

```javascript
window.dispatchEvent(new CustomEvent('navigate', { 
  detail: { path: '/products' }
}));
```

### Standalone Mode vs. Shell Integration

The component detects whether it's running in standalone mode or as part of the shell application:

```javascript
const isInsideShell = ref(!!window.__POWERED_BY_FEDERATION__);
```

This allows it to adjust its behavior accordingly, such as handling navigation differently and providing a complete page layout when running standalone.

## Best Practices Demonstrated

### Micro-Frontend Patterns
1. **Autonomous Functionality**: Works independently as a standalone application
2. **Seamless Integration**: Integrates with the shell via well-defined interfaces
3. **Reusable Components**: Designed to be reused across different parts of the application
4. **Event-Based Communication**: Uses custom events for cross-component communication

### UX Patterns
1. **Progressive Disclosure**: Information is organized in tabs to avoid overwhelming users
2. **Loading States**: Clear visual feedback during data loading
3. **Error Handling**: Graceful error states with retry options
4. **Responsive Design**: Adapts to different screen sizes

## Running the Application

```bash
# Install dependencies
npm install

# Start the development server
npm run serve
```

The application will be available at http://localhost:8084.

**Note**: To test all functionality, ensure the backend server is running at http://localhost:3000.

## Integration with Shell

To integrate this micro-frontend into the shell application, update the shell's Module Federation configuration to include this remote:

```javascript
// In the shell's webpack configuration
new ModuleFederationPlugin({
  // ... other configuration
  remotes: {
    // ... other remotes
    productDetails: 'productDetails@http://localhost:8084/remoteEntry.js',
  },
})
```

Then import and use the component in the shell:

```javascript
const RemoteProductDetails = defineAsyncComponent(() => 
  import('productDetails/ProductDetails')
);
```