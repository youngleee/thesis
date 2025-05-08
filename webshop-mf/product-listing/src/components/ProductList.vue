<template>
  <div class="product-list">
    <div class="product-list-header">
      <h2>Discover Premium Products</h2>
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
      <p>Discovering amazing products for you...</p>
    </div>
    <div v-else-if="error" class="error-message">Error loading products: {{ error }}</div>
    <div v-else-if="products.length === 0" class="no-products">
      <div class="no-products-icon">🔍</div>
      <p>No products found matching your search criteria.</p>
      <p>Try a different search term or browse our catalog.</p>
    </div>
    <div v-else>
      <div class="product-category">
        <p class="category-label">Featured Collection</p>
        <div class="products-grid">
          <div v-for="product in products" :key="product.id" class="product-card">
            <div class="product-image-container">
              <img :src="product.image" :alt="product.name" class="product-image">
              <div class="quick-actions">
                <button 
                  class="add-to-cart" 
                  @click="addToCart(product.id)"
                  :disabled="addingToCart[product.id]"
                >
                  {{ addingToCart[product.id] ? 'Adding...' : 'Add to Cart' }}
                </button>
              </div>
            </div>
            <div class="product-info">
              <h3>{{ product.name }}</h3>
              <div class="rating">
                <span class="stars">★★★★<span class="gray-star">★</span></span>
                <span class="reviews-count">({{ Math.floor(Math.random() * 100) + 10 }})</span>
              </div>
              <p class="price">€{{ product.price.toFixed(2) }}</p>
              <p class="description">{{ product.description }}</p>
              <div class="product-tags">
                <span class="tag">Premium</span>
                <span class="tag">In Stock</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="cartMessage" class="cart-message" :class="{ 'error': cartError }">
      {{ cartMessage }}
      <button v-if="!cartError" @click="navigateToCart" class="view-cart-link">View Cart</button>
    </div>
    
    <div class="testimonial-section">
      <h3>What Our Customers Say</h3>
      <div class="testimonials">
        <div class="testimonial">
          <div class="testimonial-stars">★★★★★</div>
          <p class="testimonial-text">"The quality of these products exceeded my expectations. Fast shipping and excellent customer service!"</p>
          <p class="testimonial-author">— Sarah M.</p>
        </div>
        <div class="testimonial">
          <div class="testimonial-stars">★★★★★</div>
          <p class="testimonial-text">"I've been a loyal customer for years. The premium selection keeps me coming back!"</p>
          <p class="testimonial-author">— David K.</p>
        </div>
      </div>
    </div>
    
    <div class="newsletter">
      <div class="newsletter-content">
        <h3>Join Our Community</h3>
        <p>Subscribe to get exclusive offers, free giveaways, and product launches.</p>
        <div class="newsletter-form">
          <input type="email" placeholder="Your email address" class="newsletter-input">
          <button class="newsletter-button">Subscribe</button>
        </div>
      </div>
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
/* Base Styles */
.product-list {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  font-family: 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  color: #334155;
}

/* Header */
.product-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

h2 {
  color: #1e293b;
  margin: 0;
  text-align: left;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.025em;
}

.view-cart-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
}

.view-cart-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 14px rgba(37, 99, 235, 0.25);
}

.cart-icon {
  font-size: 1.1rem;
}

/* Product Category Section */
.product-category {
  margin-bottom: 40px;
}

.category-label {
  font-size: 1.2rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 15px;
  position: relative;
  padding-left: 12px;
}

.category-label::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  height: 18px;
  width: 4px;
  background-color: #3b82f6;
  transform: translateY(-50%);
  border-radius: 2px;
}

/* Product Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.product-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: white;
  display: flex;
  flex-direction: column;
  position: relative;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
}

.product-image-container {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4/3;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.quick-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px;
  background: linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
}

.product-card:hover .quick-actions {
  opacity: 1;
  transform: translateY(0);
}

/* Product Info */
.product-info {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
}

.rating {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 5px;
}

.stars {
  color: #f59e0b;
  letter-spacing: 2px;
}

.gray-star {
  color: #cbd5e1;
}

.reviews-count {
  font-size: 0.85rem;
  color: #64748b;
}

.price {
  color: #f43f5e;
  font-weight: 700;
  font-size: 1.4rem;
  margin: 10px 0;
}

.description {
  color: #64748b;
  margin-bottom: 15px;
  font-size: 0.95rem;
  line-height: 1.5;
  flex-grow: 1;
}

.product-tags {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.tag {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  background-color: #f1f5f9;
  color: #64748b;
}

/* Add to cart button */
.add-to-cart {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  width: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(5, 150, 105, 0.2);
}

.add-to-cart:hover {
  background: linear-gradient(135deg, #059669, #047857);
  box-shadow: 0 6px 15px rgba(5, 150, 105, 0.25);
}

.add-to-cart:disabled {
  background: linear-gradient(135deg, #94a3b8, #64748b);
  cursor: not-allowed;
}

/* Loading state */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(59, 130, 246, 0.1);
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 25px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading p {
  color: #64748b;
  font-size: 1.2rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

/* Error Message */
.error-message {
  color: #b91c1c;
  text-align: center;
  padding: 35px;
  background-color: #fee2e2;
  border-radius: 10px;
  margin: 30px 0;
  border: 1px solid #fecaca;
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.1);
}

/* Cart Message Notification */
.cart-message {
  position: fixed;
  bottom: 25px;
  right: 25px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 15px 25px;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  align-items: center;
  gap: 15px;
  font-weight: 500;
}

.cart-message.error {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
}

.view-cart-link {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.view-cart-link:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
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

/* Search Results */
.search-results {
  background-color: #f8fafc;
  padding: 15px 20px;
  border-radius: 10px;
  margin-bottom: 25px;
  font-size: 1rem;
  color: #64748b;
  border-left: 4px solid #3b82f6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-term {
  font-weight: 700;
  color: #1e293b;
}

.no-results {
  color: #ef4444;
  margin-top: 10px;
  margin-bottom: 0;
  font-weight: 500;
}

/* Empty State */
.no-products {
  text-align: center;
  padding: 60px 20px;
  background-color: #f8fafc;
  border-radius: 12px;
  margin: 30px 0;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.no-products-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  color: #94a3b8;
}

.no-products p {
  color: #64748b;
  margin: 10px 0;
  font-size: 1.1rem;
}

/* Testimonials Section */
.testimonial-section {
  margin-top: 60px;
  margin-bottom: 60px;
  background-color: #f8fafc;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
}

.testimonial-section h3 {
  text-align: center;
  color: #1e293b;
  font-size: 1.6rem;
  margin-bottom: 30px;
}

.testimonials {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

.testimonial {
  background-color: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.testimonial-stars {
  color: #f59e0b;
  margin-bottom: 15px;
  font-size: 1.2rem;
  letter-spacing: 2px;
}

.testimonial-text {
  color: #334155;
  font-size: 1rem;
  line-height: 1.6;
  font-style: italic;
  margin-bottom: 15px;
}

.testimonial-author {
  color: #64748b;
  font-weight: 600;
  text-align: right;
  margin: 0;
}

/* Newsletter Section */
.newsletter {
  margin-top: 60px;
  margin-bottom: 40px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.2);
  color: white;
}

.newsletter-content {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.newsletter h3 {
  color: white;
  font-size: 1.8rem;
  margin-bottom: 15px;
}

.newsletter p {
  opacity: 0.9;
  margin-bottom: 25px;
  font-size: 1.1rem;
  line-height: 1.6;
}

.newsletter-form {
  display: flex;
  gap: 10px;
  max-width: 500px;
  margin: 0 auto;
}

.newsletter-input {
  flex: 1;
  padding: 12px 20px;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.newsletter-button {
  background-color: white;
  color: #2563eb;
  font-weight: 600;
  padding: 0 25px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.newsletter-button:hover {
  background-color: #f8fafc;
  transform: translateY(-2px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .product-list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  
  .view-cart-btn {
    width: 100%;
    justify-content: center;
  }
  
  .testimonials {
    grid-template-columns: 1fr;
  }
  
  .newsletter-form {
    flex-direction: column;
  }
  
  .newsletter-button {
    width: 100%;
    padding: 12px;
  }
}

@media (max-width: 480px) {
  h2 {
    font-size: 1.6rem;
  }
  
  .product-list {
    padding: 15px;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .newsletter {
    padding: 30px 20px;
  }
}
</style>