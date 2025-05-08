<template>
  <div class="product-list">
    <div class="product-list-header">
      <h2>Product Listing</h2>
      <button v-if="!isInsideShell" @click="navigateToCart" class="view-cart-btn">
        <span class="cart-icon">🛒</span>
        View Cart
      </button>
    </div>
    
    <div v-if="searchTerm" class="search-results">
      <p>Showing results for: <span class="search-term">{{ searchTerm }}</span></p>
      <p v-if="products.length === 0" class="no-results">No products found matching your search.</p>
    </div>
    
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading products...</p>
    </div>
    <div v-else-if="error" class="error-message">Error loading products: {{ error }}</div>
    <div v-else-if="products.length === 0" class="no-products">
      <div class="no-products-icon">🔍</div>
      <p>No products found matching your search criteria.</p>
      <p>Try a different search term or browse our catalog.</p>
    </div>
    <div v-else class="products-grid">
      <div v-for="product in products" :key="product.id" class="product-card">
        <img :src="product.image" :alt="product.name" class="product-image">
        <h3>{{ product.name }}</h3>
        <p class="price">€{{ product.price.toFixed(2) }}</p>
        <p class="description">{{ product.description }}</p>
        <button 
          class="add-to-cart" 
          @click="addToCart(product.id)"
          :disabled="addingToCart[product.id]"
        >
          {{ addingToCart[product.id] ? 'Adding...' : 'Add to Cart' }}
        </button>
      </div>
    </div>
    <div v-if="cartMessage" class="cart-message" :class="{ 'error': cartError }">
      {{ cartMessage }}
      <button v-if="!cartError" @click="navigateToCart" class="view-cart-link">View Cart</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive, watch } from 'vue'
import axios from 'axios'

export default {
  name: 'ProductList',
  props: {
    searchTerm: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const allProducts = ref([])
    const products = ref([])
    const loading = ref(true)
    const error = ref(null)
    const cartMessage = ref('')
    const cartError = ref(false)
    const addingToCart = reactive({})
    const isInsideShell = ref(!!window.__POWERED_BY_FEDERATION__)

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

    const fetchProducts = async () => {
      try {
        loading.value = true
        const response = await axios.get('http://localhost:3000/api/products')
        allProducts.value = response.data
        products.value = [...allProducts.value] // Initialize filtered products with all products
        filterProducts(props.searchTerm) // Apply initial filter if searchTerm is provided
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    // Listen for search events from shell
    const handleSearch = (event) => {
      if (event.detail && typeof event.detail.query === 'string') {
        filterProducts(event.detail.query)
      }
    }

    const addToCart = async (productId) => {
      try {
        // Set loading state for this product
        addingToCart[productId] = true
        
        // Call the API to add the product to the cart
        await axios.post('http://localhost:3000/api/cart', {
          productId,
          quantity: 1
        })
        
        // Show success message
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
        cartMessage.value = `Error adding to cart: ${err.message}`
        cartError.value = true
        
        // Clear the error message after 5 seconds
        setTimeout(() => {
          cartMessage.value = ''
        }, 5000)
      } finally {
        // Clear loading state
        addingToCart[productId] = false
      }
    }
    
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

    // Watch for changes in the search term prop
    watch(() => props.searchTerm, (newSearchTerm) => {
      console.log(`Search term changed to: ${newSearchTerm}`)
      filterProducts(newSearchTerm)
    })

    onMounted(() => {
      fetchProducts()
      
      // Listen for search events from the shell
      window.addEventListener('search', handleSearch)
      
      // Clean up event listener
      return () => {
        window.removeEventListener('search', handleSearch)
      }
    })

    return {
      products,
      loading,
      error,
      addToCart,
      cartMessage,
      cartError,
      addingToCart,
      navigateToCart,
      isInsideShell
    }
  }
}
</script>

<style scoped>
.product-list {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

.product-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.view-cart-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.view-cart-btn:hover {
  background-color: #2563eb;
}

.cart-icon {
  font-size: 1.1rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.product-card {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  background: white;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
}

h2 {
  color: #334155;
  margin: 0;
  text-align: left;
  font-size: 1.8rem;
}

h3 {
  margin-top: 0;
  color: #334155;
  font-size: 1.2rem;
}

.price {
  color: #e53e3e;
  font-weight: 600;
  font-size: 1.2rem;
  margin: 10px 0;
}

.description {
  color: #64748b;
  margin-bottom: 15px;
  font-size: 0.9rem;
  line-height: 1.4;
}

.add-to-cart {
  background-color: #10b981;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  width: 100%;
  transition: background-color 0.2s;
}

.add-to-cart:hover {
  background-color: #059669;
}

.add-to-cart:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(59, 130, 246, 0.2);
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading p {
  color: #64748b;
  font-size: 1.1rem;
}

.error-message {
  color: #b91c1c;
  text-align: center;
  padding: 30px;
  background-color: #fee2e2;
  border-radius: 8px;
  margin: 20px 0;
  border: 1px solid #fecaca;
}

.cart-message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #10b981;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slide-in 0.3s ease-out;
  display: flex;
  align-items: center;
  gap: 12px;
}

.cart-message.error {
  background-color: #ef4444;
}

.view-cart-link {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background-color 0.2s;
}

.view-cart-link:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 600px) {
  .product-list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .view-cart-btn {
    width: 100%;
    justify-content: center;
  }
}

.search-results {
  background-color: #f1f5f9;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.95rem;
  color: #64748b;
}

.search-term {
  font-weight: 600;
  color: #334155;
}

.no-results {
  color: #ef4444;
  margin-top: 8px;
  margin-bottom: 0;
}

.no-products {
  text-align: center;
  padding: 40px 20px;
  background-color: #f8fafc;
  border-radius: 10px;
  margin: 20px 0;
}

.no-products-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  color: #94a3b8;
}

.no-products p {
  color: #64748b;
  margin: 10px 0;
}
</style> 