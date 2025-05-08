<template>
  <div class="product-list-container">
    <!-- Search results info -->
    <div v-if="searchTerm" class="search-results-info">
      <p>{{ filteredProducts.length }} results for "{{ searchTerm }}"</p>
      <button @click="clearSearch" class="clear-search-button">Clear Search</button>
    </div>

    <!-- No results message -->
    <div v-if="filteredProducts.length === 0" class="no-results">
      <h2>No Products Found</h2>
      <p>We couldn't find any products matching your search. Please try a different search term.</p>
      <button @click="clearSearch" class="clear-search-button">Clear Search</button>
    </div>
    
    <!-- Product grid -->
    <div v-else class="product-grid">
      <div v-for="product in filteredProducts" :key="product.id" class="product-card" @click="navigateToProductDetails(product.id)">
        <div class="product-image-container">
          <img :src="product.image" :alt="product.name" class="product-image" />
        </div>
        <div class="product-info">
          <h3 class="product-name">{{ product.name }}</h3>
          <p class="product-price">${{ product.price.toFixed(2) }}</p>
          <p class="product-description">{{ product.description }}</p>
        </div>
        <button @click.stop="addToCart(product)" class="add-to-cart-button">
          Add to Cart
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive, watch } from 'vue'

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
    
    // Reactive state for API requests
    const apiState = reactive({
      retries: 0,
      maxRetries: 3,
      backoffTime: 1000, // Starting backoff time in ms
    })
    
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
    
    // Function to add product to cart
    const addToCart = async (product) => {
      try {
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
        
        // Dispatch event for the shell (and other MFEs) that the cart has been updated
        window.dispatchEvent(new CustomEvent('cart-updated', { 
          detail: { productId: product.id, quantity: 1 }
        }))
        
        console.log(`Added ${product.name} to cart`)
      } catch (err) {
        console.error('Error adding to cart:', err)
        // Handle error - in a real app we might show a toast or notification
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
    
    // Listen for search events from the shell
    onMounted(() => {
      console.log('ProductList component mounted')
      
      // Fetch products when the component mounts
      fetchProducts()
      
      // Listen for search events from the shell
      window.addEventListener('search', (event) => {
        console.log('Search event received in ProductList:', event.detail)
        if (event.detail && event.detail.query) {
          // This is a fallback - normally search term would come through props
          filterProducts()
        }
      })
    })
    
    // Clean up event listeners when component is unmounted
    const cleanup = () => {
      window.removeEventListener('search', () => {})
    }
    
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
      addToCart,
      clearSearch,
      navigateToProductDetails
    }
  }
}
</script>

<style scoped>
.product-list-container {
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

.search-results-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
}

.clear-search-button:hover {
  background-color: #d0d0d0;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
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
  transition: background-color 0.2s;
}

.add-to-cart-button:hover {
  background-color: #45a049;
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 15px;
  }
  
  .product-image-container {
    height: 180px;
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
</style>