<template>
  <div class="container">
    <header>
      <h1>Webshop Shell Application</h1>
      <p>Micro-Frontend Architecture Demo</p>
      
      <div class="search-container">
        <div class="search-bar">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search products..." 
            @keyup.enter="performSearch"
          >
          <button class="search-button" @click="performSearch">
            <span class="search-icon">🔍</span>
          </button>
        </div>
      </div>
      
      <nav class="navigation">
        <button 
          @click="navigateTo('products')"
          :class="{ active: currentView === 'products' }"
          class="nav-button"
        >
          Products
        </button>
        <button 
          @click="navigateTo('cart')"
          :class="{ active: currentView === 'cart' }"
          class="nav-button"
        >
          Shopping Cart
          <span v-if="cartItemCount > 0" class="cart-badge">{{ cartItemCount }}</span>
        </button>
      </nav>
    </header>
    
    <main>
      <!-- For desktop view, show both components side by side -->
      <div class="layout-grid" v-if="isDesktopView">
        <!-- Product Listing MFE -->
        <div class="product-listing-container">
          <Suspense>
            <template #default>
              <RemoteProductList v-if="isProductListingLoaded" :searchTerm="searchQuery" />
              <div v-else class="loading-container">
                <div class="loading-spinner"></div>
                <p>Loading Product Listing...</p>
              </div>
            </template>
            <template #fallback>
              <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Loading product listing component...</p>
              </div>
            </template>
          </Suspense>
        </div>
        
        <!-- Shopping Cart MFE -->
        <div class="shopping-cart-container">
          <Suspense>
            <template #default>
              <RemoteShoppingCart v-if="isShoppingCartLoaded" />
              <div v-else class="loading-container">
                <div class="loading-spinner"></div>
                <p>Loading Shopping Cart...</p>
              </div>
            </template>
            <template #fallback>
              <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Loading shopping cart component...</p>
              </div>
            </template>
          </Suspense>
        </div>
      </div>
      
      <!-- For mobile view, show only the active component -->
      <div v-else>
        <!-- Product Listing MFE -->
        <div v-if="currentView === 'products'" class="product-listing-container">
          <Suspense>
            <template #default>
              <RemoteProductList v-if="isProductListingLoaded" :searchTerm="searchQuery" />
              <div v-else class="loading-container">
                <div class="loading-spinner"></div>
                <p>Loading Product Listing...</p>
              </div>
            </template>
            <template #fallback>
              <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Loading product listing component...</p>
              </div>
            </template>
          </Suspense>
        </div>
        
        <!-- Shopping Cart MFE -->
        <div v-if="currentView === 'cart'" class="shopping-cart-container">
          <Suspense>
            <template #default>
              <RemoteShoppingCart v-if="isShoppingCartLoaded" />
              <div v-else class="loading-container">
                <div class="loading-spinner"></div>
                <p>Loading Shopping Cart...</p>
              </div>
            </template>
            <template #fallback>
              <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Loading shopping cart component...</p>
              </div>
            </template>
          </Suspense>
        </div>
        
        <!-- Product Details MFE -->
        <div v-if="currentView === 'product-details'" class="product-details-container">
          <Suspense>
            <template #default>
              <RemoteProductDetails v-if="isProductDetailsLoaded" :productId="selectedProductId" />
              <div v-else class="loading-container">
                <div class="loading-spinner"></div>
                <p>Loading Product Details...</p>
              </div>
            </template>
            <template #fallback>
              <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Loading product details component...</p>
              </div>
            </template>
          </Suspense>
        </div>
      </div>
    </main>
    
    <footer>
      <p>&copy; 2025 Webshop Micro-Frontend Demo</p>
    </footer>
  </div>
</template>

<script>
import { defineAsyncComponent, ref, onMounted, onBeforeUnmount } from 'vue'

export default {
  name: 'App',
  setup() {
    const isProductListingLoaded = ref(false)
    const isShoppingCartLoaded = ref(false)
    const isProductDetailsLoaded = ref(false)
    const currentView = ref('products')
    const isDesktopView = ref(window.innerWidth >= 800)
    const cartItemCount = ref(0)
    const searchQuery = ref('')
    const selectedProductId = ref(null)
    const wsRef = ref(null)
    const wsConnected = ref(false)
    
    // Create variables to store event listener callbacks
    let navigateEventHandler;
    let clearSearchHandler;
    
    // Handle window resize
    const handleResize = () => {
      isDesktopView.value = window.innerWidth >= 800
    }
    
    // Enhanced navigation function
    const navigateTo = (view, params) => {
      console.log(`Navigation clicked: ${view}`, params)
      currentView.value = view
      
      if (view === 'product-details' && params && params.productId) {
        selectedProductId.value = params.productId
        
        // Update URL to reflect the product being viewed
        const url = new URL(window.location)
        url.searchParams.set('view', 'product-details')
        url.searchParams.set('id', params.productId)
        window.history.pushState({}, '', url)
      } else if (view === 'cart') {
        // Update URL for cart view
        const url = new URL(window.location)
        url.searchParams.set('view', 'cart')
        url.searchParams.delete('id') // Remove product ID if present
        window.history.pushState({}, '', url)
      } else if (view === 'products') {
        // Update URL for products view
        const url = new URL(window.location)
        url.searchParams.delete('view')
        url.searchParams.delete('id')
        window.history.pushState({}, '', url)
      }
    }
    
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
    
    // Handle navigation events from micro-frontends
    const handleNavigation = (event) => {
      console.log('Navigation event received in shell:', event);
      console.log('Navigation event detail:', event.detail);
      
      if (event.detail && event.detail.path) {
        console.log(`Processing navigation to path: ${event.detail.path}`);
        
        if (event.detail.path === '/products') {
          console.log('Navigating to products view');
          navigateTo('products');
        } else if (event.detail.path === '/cart') {
          console.log('Navigating to cart view');
          navigateTo('cart');
        } else if (event.detail.path === '/product-details' && event.detail.productId) {
          console.log(`Navigating to product details for ID: ${event.detail.productId}`);
          navigateTo('product-details', { productId: event.detail.productId });
        } else {
          console.log(`Unknown path: ${event.detail.path}`);
        }
      } else {
        console.log('Invalid navigation event: missing path in event detail', event);
      }
    }
    
    // Handle cart update events from micro-frontends (legacy support)
    const handleCartUpdate = (event) => {
      console.log('Cart update event received in shell:', event.detail)
      // Only use if WebSocket is not connected
      if (!wsConnected.value) {
        updateCartCount()
      }
    }
    
    // Set up WebSocket connection
    const setupWebSocket = () => {
      // Close existing connection if any
      if (wsRef.value && wsRef.value.readyState !== WebSocket.CLOSED) {
        wsRef.value.close()
      }
      
      wsRef.value = new WebSocket('ws://localhost:3000')
      
      wsRef.value.onopen = () => {
        console.log('Shell: WebSocket connection established')
        wsConnected.value = true
      }
      
      wsRef.value.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'CART_UPDATE') {
            console.log('Shell: WebSocket cart update received', data.data.length)
            cartItemCount.value = data.data.length || 0
          }
        } catch (err) {
          console.error('Shell: Error processing WebSocket message:', err)
        }
      }
      
      wsRef.value.onclose = (event) => {
        console.log('Shell: WebSocket connection closed', event.code, event.reason)
        wsConnected.value = false
        
        // Fall back to polling if WebSocket fails
        if (!event.wasClean) {
          console.log('Shell: Falling back to polling for cart updates')
          startCartPolling()
        }
      }
      
      wsRef.value.onerror = (err) => {
        console.error('Shell: WebSocket error:', err)
        wsConnected.value = false
      }
    }
    
    // Update cart count from REST API (fallback)
    const updateCartCount = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/cart')
        const data = await response.json()
        cartItemCount.value = data.length || 0
        console.log(`Cart items: ${cartItemCount.value}`)
      } catch (err) {
        console.error('Error fetching cart data:', err)
        cartItemCount.value = 0
      }
    }
    
    // Polling interval reference
    let cartInterval = null
    
    // Start cart polling (fallback mechanism)
    const startCartPolling = () => {
      // Clear existing interval if any
      if (cartInterval) {
        clearInterval(cartInterval)
      }
      
      // Initial fetch
      updateCartCount()
      
      // Set up polling
      cartInterval = setInterval(updateCartCount, 5000)
    }
    
    // Stop cart polling
    const stopCartPolling = () => {
      if (cartInterval) {
        clearInterval(cartInterval)
        cartInterval = null
      }
    }
    
    // Check URL for initial view and product ID
    const initFromUrl = () => {
      console.log('Initializing from URL parameters');
      const urlParams = new URLSearchParams(window.location.search);
      const viewParam = urlParams.get('view');
      const productIdParam = urlParams.get('id');
      
      console.log('URL parameters:', { view: viewParam, id: productIdParam });
      
      if (viewParam === 'product-details' && productIdParam) {
        console.log(`Setting view to product-details with ID: ${productIdParam}`);
        selectedProductId.value = productIdParam;
        currentView.value = 'product-details';
        
        // Add debug output to verify the state changes
        console.log('After setting state:', { 
          currentView: currentView.value, 
          selectedProductId: selectedProductId.value 
        });
      } else if (viewParam === 'cart') {
        console.log('Setting view to cart');
        currentView.value = 'cart';
      } else if (viewParam === 'products') {
        console.log('Setting view to products');
        currentView.value = 'products';
      }
      
      // Check if we have a stored navigation target in sessionStorage
      try {
        const navTarget = sessionStorage.getItem('navTarget');
        if (navTarget) {
          console.log(`Found navigation target in sessionStorage: ${navTarget}`);
          
          if (navTarget === 'cart') {
            console.log('Setting view to cart from sessionStorage');
            currentView.value = 'cart';
          } else if (navTarget.startsWith('product-details:')) {
            // Handle product detail navigation from session storage
            const productId = navTarget.split(':')[1];
            if (productId) {
              console.log(`Setting view to product-details with ID: ${productId} from sessionStorage`);
              selectedProductId.value = productId;
              currentView.value = 'product-details';
            }
          }
          
          // Clear the stored target after using it
          sessionStorage.removeItem('navTarget');
        }
      } catch (err) {
        console.error('Error reading from sessionStorage:', err);
      }
    }
    
    onMounted(() => {
      console.log('Shell application mounted')
      // Set these to true once the remotes are loaded
      isProductListingLoaded.value = true
      isShoppingCartLoaded.value = true
      isProductDetailsLoaded.value = true
      
      // Expose the navigation function globally for direct access from micro-frontends
      console.log('Exposing shell navigation function globally')
      window.shellNavigateTo = navigateTo
      
      // Expose the app instance for direct manipulation if needed
      window.__shell_app = {
        setView: (view) => {
          console.log(`Direct view set to: ${view}`)
          currentView.value = view
        }
      }
      
      // Initialize view from URL if applicable
      initFromUrl()
      
      console.log('Setting up event listeners in Shell application...')
      
      // Add event listeners with explicit this binding
      window.addEventListener('resize', handleResize)
      
      // Store the navigation event handler in a variable for later removal
      navigateEventHandler = (event) => {
        console.log('Navigation event received in App.vue:', event.detail)
        handleNavigation(event)
      };
      
      // Navigation event handler with extra logging
      console.log('Adding navigate event listener')
      window.addEventListener('navigate', navigateEventHandler)
      
      window.addEventListener('cart-updated', handleCartUpdate)
      window.addEventListener('popstate', initFromUrl)
      
      // Store the clear search handler in a variable for later removal
      clearSearchHandler = () => {
        searchQuery.value = ''
      };
      window.addEventListener('clear-search', clearSearchHandler)
      
      // Test if event listener is working by dispatching a test event
      console.log('Testing event listener with dummy event...')
      window.dispatchEvent(new CustomEvent('navigate-test', { 
        detail: { test: 'This is a test event' }
      }))
      
      // Set up WebSocket connection
      setupWebSocket()
      
      // Clean up on component unmount
      onBeforeUnmount(() => {
        stopCartPolling()
        
        // Close WebSocket connection
        if (wsRef.value) {
          wsRef.value.close()
          wsRef.value = null
        }
        
        // Remove event listeners with direct references to the same handler functions
        console.log('Removing event listeners')
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('navigate', navigateEventHandler)
        window.removeEventListener('cart-updated', handleCartUpdate)
        window.removeEventListener('popstate', initFromUrl)
        window.removeEventListener('clear-search', clearSearchHandler)
      })
    })
    
    return {
      isProductListingLoaded,
      isShoppingCartLoaded,
      isProductDetailsLoaded,
      currentView,
      isDesktopView,
      cartItemCount,
      navigateTo,
      searchQuery,
      performSearch,
      selectedProductId,
      wsConnected
    }
  },
  components: {
    RemoteProductList: defineAsyncComponent(() => 
      import('productListing/ProductList')
        .catch(err => {
          console.error('Error loading product listing component:', err)
          return import('./components/FallbackProductList.vue')
        })
    ),
    RemoteShoppingCart: defineAsyncComponent(() => 
      import('shoppingCart/ShoppingCart')
        .catch(err => {
          console.error('Error loading shopping cart component:', err)
          // We could create a FallbackShoppingCart.vue component
          // For now, just return a simple component
          return {
            template: `
              <div class="fallback-cart">
                <h2>Shopping Cart</h2>
                <div class="error-message">
                  <p>Sorry, we couldn't load the shopping cart component.</p>
                  <p>Please try refreshing the page.</p>
                </div>
              </div>
            `,
            setup() {
              return {}
            }
          }
        })
    ),
    RemoteProductDetails: defineAsyncComponent(() => 
      import('productDetails/ProductDetails')
        .catch(err => {
          console.error('Error loading product details component:', err)
          return {
            template: `
              <div class="fallback-product-details">
                <h2>Product Details</h2>
                <div class="error-message">
                  <p>Sorry, we couldn't load the product details component.</p>
                  <p>Please try refreshing the page.</p>
                </div>
              </div>
            `,
            setup() {
              return {}
            }
          }
        })
    )
  }
}
</script>

<style>
body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f1f5f9;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  background-color: #3b82f6;
  color: white;
  padding: 20px 20px 30px;
  text-align: center;
  margin-bottom: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
}

header p {
  margin: 8px 0 20px;
  opacity: 0.9;
}

.search-container {
  margin: 20px auto;
  max-width: 500px;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 30px;
  padding: 5px 10px 5px 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.search-bar:focus-within {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

.search-bar input {
  flex: 1;
  border: none;
  padding: 10px 0;
  font-size: 1rem;
  background: transparent;
  color: #334155;
  outline: none;
}

.search-bar input::placeholder {
  color: #94a3b8;
}

.search-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #3b82f6;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: transform 0.2s ease;
}

.search-button:hover {
  transform: scale(1.1);
}

.search-icon {
  font-size: 1.2rem;
}

.navigation {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.nav-button {
  position: relative;
  background-color: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  padding: 12px 25px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 140px;
  user-select: none;  /* Prevent text selection */
  outline: none;      /* Remove outline */
  border: 2px solid transparent;
}

.nav-button:hover {
  background-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.nav-button:active {
  transform: translateY(0);
  background-color: rgba(255, 255, 255, 0.35);
}

.nav-button.active {
  background-color: rgba(255, 255, 255, 0.3);
  font-weight: 600;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #ef4444;
  color: white;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.layout-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.product-listing-container,
.shopping-cart-container {
  min-height: 200px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(59, 130, 246, 0.2);
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fallback-cart {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.error-message {
  color: #b91c1c;
  padding: 15px;
  background-color: #fee2e2;
  border-radius: 4px;
  margin-top: 15px;
  border: 1px solid #fecaca;
}

footer {
  text-align: center;
  margin-top: 40px;
  padding: 20px;
  color: #64748b;
  border-top: 1px solid #e2e8f0;
}

/* Responsive layout */
@media (max-width: 800px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }
  
  .shopping-cart-container {
    order: -1; /* Show cart first on mobile */
  }
  
  .navigation {
    flex-wrap: wrap;
  }
  
  .nav-button {
    flex: 1;
    min-width: 120px;
  }
}

@media (max-width: 480px) {
  header {
    padding: 15px 15px 25px;
  }
  
  h1 {
    font-size: 1.6rem;
  }
  
  .navigation {
    margin-top: 15px;
    gap: 10px;
  }
  
  .nav-button {
    padding: 10px 15px;
    font-size: 0.9rem;
    width: 100%;
  }
}

@media (max-width: 600px) {
  .search-container {
    width: 100%;
  }
  
  .search-bar input {
    font-size: 0.9rem;
  }
}

/* Additional styles for product details */
.product-details-container {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  min-height: 200px;
}

.fallback-product-details {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

</style>
