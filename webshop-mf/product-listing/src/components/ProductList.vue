<template>
  <div class="product-list-container">
    <!-- Toast notification for added products -->
    <div v-if="showToast" class="toast-notification" :class="{ 'show': showToast }">
      <div class="toast-content">
        <span class="toast-icon">✓</span>
        <span class="toast-message">{{toastMessage}}</span>
      </div>
    </div>

    <!-- Header with search results and cart button -->
    <div class="product-list-header">
      <div class="header-left">
        <div v-if="searchTerm" class="search-results-info">
          <p>{{ filteredProducts.length }} results for "{{ searchTerm }}"</p>
          <button @click="clearSearch" class="clear-search-button">Clear Search</button>
        </div>
        <div v-else class="products-title">
          <h2>Products</h2>
        </div>
      </div>

      <div class="cart-controls">
        <button @click="viewCart" class="view-cart-button">
          <span class="cart-icon">🛒</span>
          <span v-if="cartItemCount > 0" class="cart-count">{{ cartItemCount }}</span>
          View Cart
        </button>
      </div>
    </div>

    <!-- No results message -->
    <div v-if="filteredProducts.length === 0" class="no-results">
      <h2>No Products Found</h2>
      <p>We couldn't find any products matching your search. Please try a different search term.</p>
      <button @click="clearSearch" class="clear-search-button">Clear Search</button>
    </div>
    
    <!-- Product grid -->
    <div v-else class="product-grid">
      <!-- Animation element for cart addition -->
      <div v-if="animatingProduct" class="cart-animation" :style="animationStyle">
        <div class="cart-animation-icon">🛒</div>
      </div>

      <div v-for="product in filteredProducts" :key="product.id" class="product-card" :class="{ 'highlight-animation': product.isHighlighted }" @click="navigateToProductDetails(product.id)">
        <div class="product-image-container">
          <img :src="product.image" :alt="product.name" class="product-image" />
        </div>
        <div class="product-info">
          <h3 class="product-name">{{ product.name }}</h3>
          <p class="product-price">${{ product.price.toFixed(2) }}</p>
          <p class="product-description">{{ product.description }}</p>
        </div>
        <button @click.stop="addToCart(product, $event)" class="add-to-cart-button" :class="{ 'added': product.isAddedAnimation }">
          {{ product.isAddedAnimation ? 'Added! ✓' : 'Add to Cart' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive, watch, onUnmounted } from 'vue'

export default {
  name: 'ProductList',
  props: {
    searchTerm: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const products = ref([])
    const filteredProducts = ref([])
    const error = ref(null)
    const loading = ref(true)
    const cartItemCount = ref(0)
    const showToast = ref(false)
    const toastMessage = ref('')
    const animatingProduct = ref(null)
    const animationStyle = ref({})
    
    // Reactive state for API requests
    const apiState = reactive({
      retries: 0,
      maxRetries: 3,
      backoffTime: 1000, // Starting backoff time in ms
    })
    
    // Define cleanup function that will be assigned later
    let searchEventHandler
    let cartUpdatedHandler
    const cleanup = () => {
      if (searchEventHandler) {
        window.removeEventListener('search', searchEventHandler)
      }
      if (cartUpdatedHandler) {
        window.removeEventListener('cart-updated', cartUpdatedHandler)
      }
    }
    
    // Function to filter products based on search term
    const filterProducts = () => {
      if (!props.searchTerm || props.searchTerm.trim() === '') {
        filteredProducts.value = products.value
        return
      }
      
      const searchTermLower = props.searchTerm.toLowerCase()
      filteredProducts.value = products.value.filter(product => {
        return (
          product.name.toLowerCase().includes(searchTermLower) || 
          product.description.toLowerCase().includes(searchTermLower)
        )
      })
    }
    
    // Clear search function
    const clearSearch = () => {
      // Emit an event that the shell can listen for to clear the search input
      window.dispatchEvent(new CustomEvent('clear-search', { 
        detail: { message: 'Search cleared from ProductList' }
      }))
      
      // Reset filtered products to show all products
      filteredProducts.value = products.value
    }
    
    // Function to fetch products from the API
    const fetchProducts = async () => {
      loading.value = true
      error.value = null
      
      try {
        const response = await fetch('http://localhost:3000/api/products')
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        
        products.value = await response.json()
        
        // Add animation properties to each product
        products.value.forEach(product => {
          product.isAddedAnimation = false
          product.isHighlighted = false
        })
        
        filteredProducts.value = [...products.value] // Initialize filtered products
        
        // Apply initial filter if searchTerm is provided
        if (props.searchTerm) {
          filterProducts()
        }
        
        console.log(`Fetched ${products.value.length} products`)
        loading.value = false
      } catch (err) {
        console.error('Error fetching products:', err)
        error.value = err.message
        loading.value = false
        
        // Implement exponential backoff for retries
        if (apiState.retries < apiState.maxRetries) {
          apiState.retries++
          const backoff = apiState.backoffTime * Math.pow(2, apiState.retries - 1)
          console.log(`Retrying in ${backoff}ms (attempt ${apiState.retries} of ${apiState.maxRetries})`)
          
          setTimeout(fetchProducts, backoff)
        }
      }
    }
    
    // Function to fetch current cart info
    const fetchCartInfo = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/cart')
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        
        const cartData = await response.json()
        cartItemCount.value = cartData.reduce((total, item) => total + item.quantity, 0)
      } catch (err) {
        console.error('Error fetching cart info:', err)
      }
    }
    
    // Function to add product to cart
    const addToCart = async (product, event) => {
      try {
        // Apply visual feedback - method 1: Button text change
        product.isAddedAnimation = true
        
        // Apply visual feedback - method 2: Card highlight
        product.isHighlighted = true
        
        // Apply visual feedback - method 3: Animation flying to cart
        if (event) {
          const buttonRect = event.target.getBoundingClientRect()
          
          // Find the cart button element - using the more specific selector
          const cartButton = document.querySelector('.view-cart-button')
          if (cartButton) {
            const cartRect = cartButton.getBoundingClientRect()
            
            // Start animation
            animationStyle.value = {
              top: `${buttonRect.top}px`,
              left: `${buttonRect.left}px`,
              opacity: '1'
            }
            animatingProduct.value = product
            
            // Animate to cart position
            setTimeout(() => {
              animationStyle.value = {
                top: `${cartRect.top + (cartRect.height / 2) - 20}px`,
                left: `${cartRect.left + (cartRect.width / 2) - 20}px`,
                transform: 'scale(0.5)',
                opacity: '0'
              }
            }, 50)
          }
        }
        
        // Send API request
        const response = await fetch('http://localhost:3000/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId: product.id, quantity: 1 }),
        })
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        
        // Update cart count
        cartItemCount.value += 1
        
        // Apply visual feedback - method 4: Toast notification
        toastMessage.value = `${product.name} added to cart!`
        showToast.value = true
        
        // Reset animations after appropriate delays
        setTimeout(() => {
          product.isAddedAnimation = false
          product.isHighlighted = false
          showToast.value = false
        }, 2000)
        
        setTimeout(() => {
          if (animatingProduct.value === product) {
            animatingProduct.value = null
          }
        }, 800)
        
        // Dispatch event for the shell (and other MFEs) that the cart has been updated
        window.dispatchEvent(new CustomEvent('cart-updated', { 
          detail: { productId: product.id, quantity: 1 }
        }))
        
        console.log(`Added ${product.name} to cart`)
      } catch (err) {
        console.error('Error adding to cart:', err)
        product.isAddedAnimation = false
        product.isHighlighted = false
        
        // Show error toast
        toastMessage.value = `Error adding ${product.name} to cart!`
        showToast.value = true
        setTimeout(() => {
          showToast.value = false
        }, 3000)
      }
    }
    
    // Function to navigate to product details
    const navigateToProductDetails = (productId) => {
      console.log(`Navigating to product details for product ID: ${productId}`)
      
      // Dispatch a navigation event for the shell to handle
      window.dispatchEvent(new CustomEvent('navigate', { 
        detail: { 
          path: '/product-details',
          productId: productId
        }
      }))
    }
    
    // Function to view cart
    const viewCart = () => {
      console.log('Trying to navigate to shopping cart');
      
      // Try multiple approaches for maximum compatibility
      
      // Method 1: Use the exposed shell navigation function
      if (window.shellNavigateTo) {
        console.log('Using shellNavigateTo global function');
        window.shellNavigateTo('cart');
        return; // Exit early if this works
      }
      
      // Method 2: Dispatch a custom event
      console.log('Dispatching navigate event');
      const navigateEvent = new CustomEvent('navigate', { 
        detail: { 
          path: '/cart'
        },
        bubbles: true,
        cancelable: true
      });
      window.dispatchEvent(navigateEvent);
      
      // Method 3: Try to access shell app directly
      try {
        if (window.__shell_app && typeof window.__shell_app.setView === 'function') {
          console.log('Using direct shell app access');
          window.__shell_app.setView('cart');
        }
      } catch (err) {
        console.error('Error using direct shell app access:', err);
      }
    }
    
    // Listen for search events from the shell
    onMounted(() => {
      console.log('ProductList component mounted')
      
      // Fetch products when the component mounts
      fetchProducts()
      
      // Fetch initial cart data
      fetchCartInfo()
      
      // Add debug to check for event listeners on the window object
      console.log('Checking window object:', window);
      console.log('Window parent:', window.parent);
      console.log('Is window top?', window === window.top);
      
      // Define the search event handler
      searchEventHandler = (event) => {
        console.log('Search event received in ProductList:', event.detail)
        if (event.detail && event.detail.query) {
          // This is a fallback - normally search term would come through props
          filterProducts()
        }
      }
      
      // Define the cart updated event handler
      cartUpdatedHandler = () => {
        fetchCartInfo()
      }
      
      // Listen for search events from the shell
      window.addEventListener('search', searchEventHandler)
      
      // Listen for cart update events
      window.addEventListener('cart-updated', cartUpdatedHandler)
    })
    
    // Register cleanup function to run when component is unmounted
    onUnmounted(cleanup)
    
    // Watch for changes in the searchTerm prop
    watch(() => props.searchTerm, (newSearchTerm, oldSearchTerm) => {
      console.log(`Search term changed from "${oldSearchTerm}" to "${newSearchTerm}"`)
      filterProducts()
    })
    
    return {
      products,
      filteredProducts,
      error,
      loading,
      cartItemCount,
      showToast,
      toastMessage,
      animatingProduct,
      animationStyle,
      addToCart,
      clearSearch,
      navigateToProductDetails,
      viewCart
    }
  }
}
</script>

<style scoped>
.product-list-container {
  padding: 20px;
  font-family: 'Arial', sans-serif;
  position: relative;
}

.product-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
}

.products-title h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.search-results-info {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.view-cart-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
  transition: all 0.3s;
  position: relative;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  z-index: 10; /* Ensure it's above other elements for animation targeting */
}

.view-cart-button:hover {
  background-color: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.view-cart-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.view-cart-button .cart-icon {
  font-size: 20px;
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #ff4757;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.clear-search-button {
  padding: 6px 12px;
  background-color: #e2e2e2;
  color: #333;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  margin-left: 10px;
}

.clear-search-button:hover {
  background-color: #d0d0d0;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  position: relative;
}

.product-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.product-image-container {
  height: 200px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.product-info {
  padding: 15px;
  flex-grow: 1;
}

.product-name {
  margin: 0 0 10px;
  font-size: 18px;
  color: #333;
}

.product-price {
  font-weight: bold;
  font-size: 16px;
  color: #4a4a4a;
  margin: 5px 0;
}

.product-description {
  color: #666;
  font-size: 14px;
  margin: 8px 0;
  line-height: 1.4;
  /* Limit description to 3 lines */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.add-to-cart-button {
  width: 100%;
  padding: 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.add-to-cart-button:hover {
  background-color: #45a049;
}

.add-to-cart-button.added {
  background-color: #2c974b;
}

.no-results {
  text-align: center;
  padding: 40px 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin: 20px 0;
}

.no-results h2 {
  color: #333;
  margin-bottom: 15px;
}

.no-results p {
  color: #666;
  margin-bottom: 20px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* Toast notification styling */
.toast-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #4CAF50;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  transform: translateX(120%);
  transition: transform 0.3s ease-in-out;
}

.toast-notification.show {
  transform: translateX(0);
}

.toast-content {
  display: flex;
  align-items: center;
}

.toast-icon {
  margin-right: 10px;
  font-size: 18px;
}

.toast-message {
  font-weight: 500;
}

/* Cart animation */
.cart-animation {
  position: fixed;
  z-index: 1000;
  transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.cart-animation-icon {
  background-color: #4CAF50;
  color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  font-size: 20px;
}

/* Product highlight animation */
@keyframes highlight {
  0% { box-shadow: 0 0 0 rgba(76, 175, 80, 0); }
  50% { box-shadow: 0 0 20px rgba(76, 175, 80, 0.8); }
  100% { box-shadow: 0 0 0 rgba(76, 175, 80, 0); }
}

.highlight-animation {
  animation: highlight 1s ease-out;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 15px;
  }
  
  .product-image-container {
    height: 180px;
  }
  
  .product-list-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-left {
    margin-bottom: 10px;
  }
  
  .view-cart-button {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
  
  .search-results-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}

.cart-controls {
  display: flex;
  align-items: center;
}

.cart-direct-link {
  font-size: 12px;
  color: #666;
  text-decoration: underline;
  cursor: pointer;
}

.cart-direct-link:hover {
  color: #4CAF50;
}
</style>