<template>
  <div class="container">
    <header>
      <h1>Webshop Shell Application</h1>
      <p>Micro-Frontend Architecture Demo with Single-SPA</p>
      <p style="font-size: 0.8rem; opacity: 0.7;">Current View: {{ currentView }} | Desktop: {{ isDesktopView }}</p>
      
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
          @click="navigateTo('/products')"
          :class="{ active: isActive('/products') }"
          class="nav-button"
        >
          Products
        </button>
        <button 
          @click="navigateTo('/cart')"
          :class="{ active: isActive('/cart') }"
          class="nav-button"
        >
          Shopping Cart
          <span v-if="cartItemCount > 0" class="cart-badge">{{ cartItemCount }}</span>
        </button>
        <button 
          v-if="currentUser && cartItemCount > 0"
          @click="navigateTo('/checkout')"
          :class="{ active: isActive('/checkout') }"
          class="nav-button checkout-button"
        >
          Checkout
        </button>
        <button 
          v-if="currentUser"
          @click="navigateTo('/profile')"
          :class="{ active: isActive('/profile') }"
          class="nav-button"
        >
          Profile
        </button>
        <button 
          v-if="!currentUser"
          @click="showAuthModal = true"
          class="nav-button auth-button"
        >
          Login
        </button>
        <button 
          v-if="currentUser"
          @click="handleLogout"
          class="nav-button logout-button"
        >
          Logout
        </button>
      </nav>
    </header>
    
    <main>
      <!-- Single-SPA will handle the micro-frontend mounting here -->
      <div id="single-spa-application:product-listing"></div>
      <div id="single-spa-application:shopping-cart"></div>
      <div id="single-spa-application:product-details"></div>
      <div id="single-spa-application:checkout"></div>
      
      <!-- Profile component (local to shell) -->
      <div v-if="isActive('/profile')" class="profile-container">
        <UserProfile @logout="handleLogout" />
      </div>
    </main>
    
    <!-- Authentication Modal -->
    <div v-if="showAuthModal" class="modal-overlay" @click="showAuthModal = false">
      <div class="auth-modal" @click.stop>
        <button @click="showAuthModal = false" class="close-btn">&times;</button>
        <AuthLogin 
          v-if="authMode === 'login'"
          @login-success="handleLoginSuccess"
          @switch-to-register="authMode = 'register'"
        />
        <AuthRegister 
          v-if="authMode === 'register'"
          @register-success="handleRegisterSuccess"
          @switch-to-login="authMode = 'login'"
        />
      </div>
    </div>
    
    <footer>
      <p>&copy; 2025 Webshop Micro-Frontend Demo with Single-SPA</p>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { navigateToUrl } from 'single-spa'
import AuthLogin from './components/AuthLogin.vue'
import AuthRegister from './components/AuthRegister.vue'
import UserProfile from './components/UserProfile.vue'

export default {
  name: 'App',
  components: {
    AuthLogin,
    AuthRegister,
    UserProfile
  },
  setup() {
    const isProductListingLoaded = ref(false)
    const isShoppingCartLoaded = ref(false)
    const isProductDetailsLoaded = ref(false)
    const isCheckoutLoaded = ref(false)
    const currentView = ref('products')
    const isDesktopView = ref(window.innerWidth >= 800)
    const cartItemCount = ref(0)
    const searchQuery = ref('')
    const selectedProductId = ref(null)
    const wsRef = ref(null)
    const wsConnected = ref(false)
    const currentUser = ref(null)
    const showAuthModal = ref(false)
    const authMode = ref('login')
    
    // Create variables to store event listener callbacks
    let navigateEventHandler;
    let clearSearchHandler;
    
    // Handle window resize
    const handleResize = () => {
      isDesktopView.value = window.innerWidth >= 800
    }
    
    // Check if current route is active
    const isActive = (path) => {
      return window.location.pathname === path
    }
    
    // Navigation using Single-SPA
    const navigateTo = (path) => {
      navigateToUrl(path)
    }
    
    // Search function
    const performSearch = () => {
      console.log(`Searching for: ${searchQuery.value}`)
      // Navigate to products and trigger search
      navigateTo('/products')
      // Dispatch search event for micro-frontends
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
        
        if (event.detail.path === '/products' || event.detail.path === 'products') {
          console.log('Navigating to products view');
          navigateTo('products');
        } else if (event.detail.path === '/cart' || event.detail.path === 'cart') {
          console.log('Navigating to cart view');
          navigateTo('cart');
        } else if (event.detail.path === '/product-details' && event.detail.productId) {
          console.log(`Navigating to product details for ID: ${event.detail.productId}`);
          navigateTo('product-details', { productId: event.detail.productId });
        } else if (event.detail.path === '/checkout' || event.detail.path === 'checkout') {
          console.log('Navigating to checkout view');
          navigateTo('checkout');
        } else {
          console.log(`Unknown path: ${event.detail.path}`);
        }
      } else {
        console.log('Invalid navigation event: missing path in event detail', event);
      }
    }
    
    // Set up WebSocket connection
    const setupWebSocket = () => {
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
          if (data.type === 'cart_update') {
            cartItemCount.value = data.cartCount || 0
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }
      
      wsRef.value.onclose = () => {
        console.log('Shell: WebSocket connection closed')
        wsConnected.value = false
        // Reconnect after 3 seconds
        setTimeout(setupWebSocket, 3000)
      }
      
      wsRef.value.onerror = (error) => {
        console.error('Shell: WebSocket error:', error)
      }
    }
    
    // Update cart count
    const updateCartCount = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/cart/count', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          cartItemCount.value = data.count || 0
        }
      } catch (error) {
        console.error('Error fetching cart count:', error)
      }
    }
    
    // Handle login success
    const handleLoginSuccess = (user) => {
      currentUser.value = user
      showAuthModal.value = false
      updateCartCount()
    }
    
    // Handle register success
    const handleRegisterSuccess = (user) => {
      currentUser.value = user
      showAuthModal.value = false
      updateCartCount()
    }
    
    // Handle logout
    const handleLogout = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        })
        if (response.ok) {
          currentUser.value = null
          cartItemCount.value = 0
          navigateTo('/products')
        }
      } catch (error) {
        console.error('Error during logout:', error)
      }
    }
    
    // Check current user on mount
    const checkCurrentUser = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/auth/current-user', {
          credentials: 'include'
        })
        if (response.ok) {
          const user = await response.json()
          currentUser.value = user
          updateCartCount()
        }
      } catch (error) {
        console.error('Error checking current user:', error)
      }
    }
    
    onMounted(() => {
      console.log('Shell application mounted')
      // Set these to true once the remotes are loaded
      isProductListingLoaded.value = true
      isShoppingCartLoaded.value = true
      isProductDetailsLoaded.value = true
      isCheckoutLoaded.value = true
      
      // Check authentication status on mount
      checkCurrentUser()
      
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
      
      // Test the event listener is working
      setTimeout(() => {
        console.log('Testing navigation event listener...')
        window.dispatchEvent(new CustomEvent('navigate', { 
          detail: { path: 'test' }
        }))
      }, 1000)
      
      // Set up WebSocket connection
      setupWebSocket()
      
      // Watch for changes in currentView for debugging
      watch(currentView, (newView, oldView) => {
        console.log(`View changed from ${oldView} to ${newView}`)
      })
      
      // Clean up on component unmount
      onBeforeUnmount(() => {
        if (wsRef.value) {
          wsRef.value.close()
        }
        
        // Remove event listeners with direct references to the same handler functions
        console.log('Removing event listeners')
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('navigate', navigateEventHandler)
        
        // Remove cart update event listener
        window.removeEventListener('cart-update', updateCartCount)
      })
    })
    
    return {
      isProductListingLoaded,
      isShoppingCartLoaded,
      isProductDetailsLoaded,
      currentView,
      isDesktopView,
      cartItemCount,
      searchQuery,
      performSearch,
      selectedProductId,
      wsConnected,
      currentUser,
      showAuthModal,
      authMode,
      isActive,
      navigateTo,
      handleLoginSuccess,
      handleRegisterSuccess,
      handleLogout
    }
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

.auth-button {
  background-color: #10b981 !important;
}

.auth-button:hover {
  background-color: #059669 !important;
}

.logout-button {
  background-color: #ef4444 !important;
}

.logout-button:hover {
  background-color: #dc2626 !important;
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

/* Authentication Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.auth-modal {
  background: white;
  border-radius: 8px;
  position: relative;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  z-index: 1;
}

.close-btn:hover {
  color: #333;
}

.profile-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
}

</style>
