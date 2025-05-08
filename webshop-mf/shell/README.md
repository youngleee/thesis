# Shell Application (Host)

This is the shell (host) application for the Micro-Frontend Webshop project. It serves as a container that integrates various micro-frontends into a cohesive application.

## Overview

The shell application is responsible for:
- Providing the application layout and navigation
- Loading and integrating remote micro-frontends
- Handling common functionalities shared across micro-frontends
- Implementing fallback strategies for resilience
- Providing global search functionality for product discovery

## Technical Details

- **Framework**: Vue.js 3
- **Integration Method**: Webpack 5 Module Federation
- **Role**: Host (Container)
- **Component Loading**: Vue's defineAsyncComponent with error handling
- **Styling**: Global styles + component-scoped CSS
- **Port**: Running on 8082 to avoid potential port conflicts

## Understanding the Shell's Role in Micro-Frontend Architecture

The shell application plays a central role in a micro-frontend architecture:

1. **Orchestration**: It coordinates the loading and integration of micro-frontends.
2. **Common UI Elements**: It provides shared layout elements (header, footer, navigation).
3. **Routing**: It handles top-level routing to different micro-frontends.
4. **Resilience**: It implements fallback strategies when micro-frontends fail to load.
5. **Cross-Cutting Concerns**: It manages shared state, authentication, and other common concerns.
6. **Global Features**: It provides global features like search that interact with multiple micro-frontends.

## Implementation Details

### Module Federation Setup

The shell application uses Webpack Module Federation to load remote components at runtime. This configuration is defined in `vue.config.js`:

```javascript
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')

module.exports = {
  // ...
  publicPath: 'http://localhost:8082/',
  configureWebpack: {
    optimization: {
      splitChunks: false,  // Disable chunk splitting for Module Federation
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'shell',             // Name of this application
        filename: 'remoteEntry.js', // Manifest file for this app (when used as a remote)
        remotes: {
          // Define remote micro-frontends to consume
          productListing: 'productListing@http://localhost:8081/remoteEntry.js',
        },
        shared: {
          // Libraries shared between shell and remotes
          vue: {
            singleton: true,  // Only one instance of Vue should exist
            eager: true       // Load Vue immediately, not on-demand
          }
        }
      })
    ]
  },
  devServer: {
    port: 8082,
    hot: true,
  }
}
```

### Modified Entry Point

The application entry point (`main.js`) is modified to support Module Federation:

```javascript
import { createApp } from 'vue'
import App from './App.vue'

// Create a function to mount the app
const mount = () => {
  createApp(App).mount('#app')
}

// If we're not running in the context of a container, mount immediately
if (!window.__POWERED_BY_FEDERATION__) {
  mount()
}

export { mount }
```

This pattern allows the shell to be consumed by other applications if needed (though this is not currently used in our implementation).

### Dynamic Component Loading

The shell loads remote components using Vue's `defineAsyncComponent` in `App.vue`:

```javascript
import { defineAsyncComponent, ref, onMounted } from 'vue'

export default {
  name: 'App',
  setup() {
    const isProductListingLoaded = ref(false)
    
    onMounted(() => {
      isProductListingLoaded.value = true
    })
    
    return {
      isProductListingLoaded
    }
  },
  components: {
    RemoteProductList: defineAsyncComponent(() => 
      import('productListing/ProductList')
        .catch(err => {
          console.error('Error loading remote component:', err)
          return import('./components/FallbackProductList.vue')
        })
    )
  }
}
```

Key features of this implementation:

1. **Async Loading**: The component is loaded asynchronously, preventing the shell from blocking if the remote is slow to load.
2. **Error Handling**: If the remote fails to load, a fallback component is shown instead.
3. **Loading State**: The `isProductListingLoaded` flag could be used to show loading indicators.

### Error Handling and Resilience

The shell implements several error handling strategies:

1. **Component Load Failure**: If a remote component fails to load, a fallback component is shown.
2. **Network Errors**: The async component loading handles network failures.
3. **Vue Suspense**: The `Suspense` component handles asynchronous loading gracefully.

Example fallback implementation in the template:

```html
<Suspense>
  <template #default>
    <RemoteProductList v-if="isProductListingLoaded" />
    <div v-else>Loading Product Listing...</div>
  </template>
  <template #fallback>
    <div>Loading remote component...</div>
  </template>
</Suspense>
```

### Fallback Component

The fallback component (`FallbackProductList.vue`) provides a graceful degradation when the remote component cannot be loaded:

```vue
<template>
  <div class="fallback-product-list">
    <h2>Product Listing</h2>
    <div class="error-message">
      <p>Sorry, we couldn't load the product listing component.</p>
      <p>Please try refreshing the page or contact support if the problem persists.</p>
    </div>
    <!-- Skeleton UI for loading state -->
    <div class="fallback-products">
      <!-- ... -->
    </div>
  </div>
</template>
```

This provides a better user experience than showing an error or blank space.

## Module Federation Under the Hood

When the shell application runs, the following sequence occurs:

1. The shell's webpack runtime loads and initializes.
2. The ModuleFederationPlugin registers the remote entry points.
3. When the app needs to render a remote component, it:
   a. Fetches the remote's manifest (`remoteEntry.js`) if not already loaded
   b. Resolves the requested module from the manifest
   c. Loads the module asynchronously
   d. Renders the component once loaded

This all happens at runtime, not build time, allowing for true independent deployment of micro-frontends.

## Key Files

- `vue.config.js`: Configuration for Webpack Module Federation
- `src/App.vue`: Main application layout and integration of remote components
- `src/main.js`: Modified entry point to support Module Federation
- `src/components/FallbackProductList.vue`: Fallback UI for when remote components fail to load

## Running the Application

```bash
# Install dependencies
npm install

# Start the development server
npm run serve
```

The application will be available at http://localhost:8082.

**Note**: Before running the shell application, ensure the remote micro-frontends (product-listing, shopping-cart) and backend are also running.

## Windows PowerShell Instructions

When running in Windows PowerShell, use the following command:

```powershell
cd C:\path\to\webshop-mf\shell
npm run serve
```

Replace `C:\path\to\` with your actual project path.

## Development Guidelines

When developing the shell application:

1. **Focus on Integration**: The shell should focus on integration, not business logic.
2. **Minimize Shell Size**: Keep the shell lightweight, moving business logic to micro-frontends.
3. **Consider Versioning**: As the system evolves, consider versioning the contract between shell and remotes.
4. **Error Handling**: Always implement robust error handling for remote component loading.
5. **Responsive Design**: Ensure the shell layout works at all screen sizes.

## Production Considerations

For production deployment:

1. **Static Hosts**: Both shell and micro-frontends can be deployed to static hosts (S3, Netlify, etc.)
2. **URLs**: Update remote URLs to point to production hostnames
3. **CORS**: Ensure CORS is properly configured for cross-origin loading
4. **Shared Libraries**: Consider using importmap or other techniques for shared library versioning
5. **Monitoring**: Implement monitoring for remote loading failures

## Troubleshooting

Common issues and solutions:

1. **Remote Not Loading**: Check that the remote application is running and accessible at the configured URL.
2. **CORS Errors**: Ensure the remote is configured to allow cross-origin requests from the shell's domain.
3. **Shared Dependency Conflicts**: Verify that shared dependencies have compatible versions.
4. **Loading Errors**: Check the browser console for specific error messages related to Module Federation.
5. **Port 8082 in Use**: If port 8082 is already being used by another application, you can change the port in `vue.config.js`.

## Feature: Global Search

The shell application implements a global search functionality that demonstrates cross-micro-frontend communication and integration.

### Implementation Details

#### Shell-side Implementation

The search feature in the shell provides a central search bar that communicates with the product-listing micro-frontend:

```javascript
// In App.vue
const searchQuery = ref('')

// Search function
const performSearch = () => {
  console.log(`Searching for: ${searchQuery.value}`)
  // Ensure we're on the products view when searching
  if (currentView.value !== 'products') {
    currentView.value = 'products'
  }
  // The search term is passed to ProductList as a prop
  // We also broadcast a custom event for more complex scenarios
  window.dispatchEvent(new CustomEvent('search', { 
    detail: { query: searchQuery.value }
  }))
}
```

Key components:
1. **Search UI**: A responsive search bar in the shell's header
2. **State Management**: The `searchQuery` reactive reference in the shell
3. **View Control**: Automatic navigation to the products view when searching
4. **Communication**: Two methods to pass the search term to micro-frontends:
   - Props-based communication for direct parent-child relationships
   - Event-based communication for more complex scenarios

#### Micro-Frontend Implementation

The product-listing micro-frontend implements the search logic:

```javascript
// In ProductList.vue
export default {
  props: {
    searchTerm: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const allProducts = ref([])
    const products = ref([])
    
    // Filter products based on search term
    const filterProducts = (term) => {
      if (!term || term.trim() === '') {
        products.value = [...allProducts.value]
        return
      }
      
      const searchLower = term.toLowerCase()
      products.value = allProducts.value.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      )
    }
    
    // Listen for search events from shell
    const handleSearch = (event) => {
      if (event.detail && typeof event.detail.query === 'string') {
        filterProducts(event.detail.query)
      }
    }
    
    // Watch for changes in the search term prop
    watch(() => props.searchTerm, (newSearchTerm) => {
      filterProducts(newSearchTerm)
    })
    
    onMounted(() => {
      // Listen for search events from the shell
      window.addEventListener('search', handleSearch)
      
      // Clean up event listener
      return () => {
        window.removeEventListener('search', handleSearch)
      }
    })
  }
}
```

Key components:
1. **Prop Acceptance**: Accepting the `searchTerm` prop from the shell
2. **Event Listening**: Listening for `search` events from the shell
3. **Filtering Logic**: Client-side filtering of products based on name or description
4. **Reactive Updates**: Using Vue's `watch` API to react to search term changes
5. **Cleanup**: Properly removing event listeners to prevent memory leaks

### User Experience

The search feature enhances the user experience through:

1. **Prominent Search Bar**: A central, accessible search bar in the shell's header
2. **Immediate Feedback**: As users type and search, results are filtered in real-time
3. **Visual Feedback**: Clear indication of search results and search terms
4. **Empty State Handling**: Friendly UI for when no search results are found
5. **Responsive Design**: The search UI adapts to different screen sizes

### Communication Patterns

The search functionality demonstrates two communication patterns in micro-frontend architecture:

1. **Props-Based Communication** (Parent → Child):
   - The shell passes the search term directly to the product-listing component via props
   - This is a simple, direct method that works well for parent-child relationships

2. **Event-Based Communication** (Broadcast):
   - The shell dispatches a custom event with search details
   - Micro-frontends listen for these events and respond accordingly
   - This allows for more flexible communication patterns, especially for non-direct relationships

### Best Practices Demonstrated

The search implementation follows several micro-frontend best practices:

1. **Separation of Concerns**: 
   - Shell handles the UI and dispatching of search actions
   - Product-listing handles the business logic of filtering products

2. **Multiple Communication Methods**:
   - Providing both props and events for flexibility and resilience

3. **Minimal Shared State**:
   - No global state management library is required
   - Communication happens through well-defined interfaces

4. **Graceful Degradation**:
   - If a micro-frontend fails to load, the search UI remains functional
   - The UI handles empty states and loading states gracefully

## Feature: Real-time Cart Updates

The application implements a real-time cart update system that ensures immediate synchronization between micro-frontends when cart modifications occur.

### Implementation Details

#### Cross-Micro-Frontend Communication

The cart update system uses custom events to notify all components when cart changes occur:

```javascript
// When a product is added to cart in ProductList.vue
window.dispatchEvent(new CustomEvent('cart-updated', { 
  detail: { action: 'add', productId }
}));

// When cart items are updated/removed in ShoppingCart.vue
window.dispatchEvent(new CustomEvent('cart-updated', { 
  detail: { action: 'update', productId: id, quantity: newQuantity }
}));
```

#### Shell Implementation

The shell listens for cart update events and immediately refreshes the cart count:

```javascript
// In App.vue
const handleCartUpdate = (event) => {
  console.log('Cart update event received in shell:', event.detail)
  // Immediately update the cart count instead of waiting for the next poll
  updateCartCount()
}

// Add event listener
window.addEventListener('cart-updated', handleCartUpdate)
```

#### Shopping Cart Micro-Frontend Implementation

The shopping cart component listens for the same events to refresh its data:

```javascript
// In ShoppingCart.vue
const handleCartUpdate = (event) => {
  console.log('Cart update event received:', event.detail);
  fetchCart();
};

onMounted(() => {
  // Listen for cart update events
  window.addEventListener('cart-updated', handleCartUpdate);
});
```

### Communication Pattern

This implementation demonstrates a publish-subscribe pattern across micro-frontends:

1. **Publisher**: Any component that modifies the cart (Product Listing, Shopping Cart)
2. **Event Bus**: Browser's native `window` object
3. **Subscribers**: Shell and Shopping Cart components

### Benefits

1. **Real-time Updates**: Cart changes are immediately reflected across all components
2. **Loose Coupling**: Components communicate without direct dependencies
3. **Enhanced UX**: Users see immediate feedback when adding/modifying cart items
4. **Resilience**: Even if polling fails, direct events ensure synchronization

### Best Practices Demonstrated

1. **Event Bubbling**: Using the window object as an event bus for cross-component communication
2. **Clean Event Listeners**: Properly cleaning up listeners to prevent memory leaks
3. **Detailed Event Payloads**: Including action type and relevant IDs for context
4. **Dual Update Strategy**: Using both events for immediate updates and polling as a fallback
