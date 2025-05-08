<template>
  <div class="product-details">
    <!-- Loading, error and empty states -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading product details...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h3>Error Loading Product</h3>
      <p>{{ error }}</p>
      <button @click="fetchProduct" class="retry-button">Try Again</button>
    </div>
    
    <div v-else-if="!product.id" class="no-product">
      <div class="no-product-icon">🔍</div>
      <h3>Product Not Found</h3>
      <p>The requested product could not be found or has been removed.</p>
      <button @click="navigateToProducts" class="back-to-products">Browse Products</button>
    </div>
    
    <!-- Product details content -->
    <div v-else class="product-content">
      <!-- Breadcrumb navigation -->
      <div class="breadcrumb">
        <span @click="navigateToProducts" class="breadcrumb-link">Products</span>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">{{ product.name }}</span>
      </div>
      
      <div class="product-layout">
        <!-- Product images gallery -->
        <div class="product-gallery">
          <div class="main-image-container">
            <img :src="currentImage" :alt="product.name" class="main-image" />
            <div class="image-zoom-hint">
              <span class="zoom-icon">🔍</span>
              <span class="zoom-text">Hover to zoom</span>
            </div>
          </div>
          
          <div class="thumbnails">
            <div 
              v-for="(image, index) in productImages" 
              :key="index" 
              class="thumbnail" 
              :class="{ active: currentImageIndex === index }"
              @click="setCurrentImage(index)"
            >
              <img :src="image" :alt="`${product.name} - view ${index + 1}`" />
            </div>
          </div>
        </div>
        
        <!-- Product information -->
        <div class="product-info">
          <h1 class="product-name">{{ product.name }}</h1>
          
          <div class="product-meta">
            <div class="rating">
              <span class="stars">★★★★<span class="gray-star">★</span></span>
              <span class="reviews-count">({{ reviewsCount }} reviews)</span>
            </div>
            <div class="product-id">
              <span class="label">Product ID:</span>
              <span class="value">{{ product.id }}</span>
            </div>
          </div>
          
          <div class="product-price">
            <span class="current-price">€{{ product.price.toFixed(2) }}</span>
            <span v-if="originalPrice > product.price" class="original-price">€{{ originalPrice.toFixed(2) }}</span>
            <span v-if="discountPercentage" class="discount-badge">-{{ discountPercentage }}%</span>
          </div>
          
          <div class="availability">
            <span class="in-stock">✓ In Stock</span>
            <span class="free-shipping">Free shipping</span>
          </div>
          
          <div class="product-description">
            <p>{{ product.description }}</p>
          </div>
          
          <div class="divider"></div>
          
          <!-- Add to cart section -->
          <div class="add-to-cart-section">
            <div class="quantity-selector">
              <button 
                @click="decrementQuantity" 
                class="quantity-btn"
                :disabled="quantity <= 1"
              >-</button>
              <input 
                type="number" 
                v-model.number="quantity" 
                min="1" 
                class="quantity-input"
              />
              <button 
                @click="incrementQuantity" 
                class="quantity-btn"
              >+</button>
            </div>
            
            <button 
              @click="addToCart" 
              class="add-to-cart-btn"
              :disabled="addingToCart"
            >
              {{ addingToCart ? 'Adding...' : 'Add to Cart' }}
            </button>
            
            <button class="wishlist-btn">
              <span class="wishlist-icon">♡</span>
              <span class="wishlist-text">Save for Later</span>
            </button>
          </div>
          
          <div v-if="cartMessage" class="cart-message" :class="{ error: cartError }">
            {{ cartMessage }}
          </div>
          
          <div class="product-features">
            <h3>Key Features</h3>
            <ul>
              <li v-for="(feature, index) in productFeatures" :key="index">
                {{ feature }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- Product tabs -->
      <div class="product-tabs">
        <div class="tabs-header">
          <button 
            v-for="tab in tabs" 
            :key="tab.id" 
            @click="activeTab = tab.id"
            class="tab-button"
            :class="{ active: activeTab === tab.id }"
          >
            {{ tab.name }}
          </button>
        </div>
        
        <div class="tab-content">
          <!-- Specifications tab -->
          <div v-if="activeTab === 'specifications'" class="specifications-tab">
            <div v-for="(group, groupName) in specifications" :key="groupName" class="specs-group">
              <h4>{{ groupName }}</h4>
              <div class="specs-list">
                <div v-for="(value, key) in group" :key="key" class="spec-item">
                  <span class="spec-name">{{ key }}</span>
                  <span class="spec-value">{{ value }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Reviews tab -->
          <div v-else-if="activeTab === 'reviews'" class="reviews-tab">
            <div v-if="reviews.length === 0" class="no-reviews">
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
            <div v-else class="reviews-list">
              <div v-for="(review, index) in reviews" :key="index" class="review">
                <div class="review-header">
                  <span class="review-stars">{{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}</span>
                  <span class="review-author">{{ review.author }}</span>
                  <span class="review-date">{{ review.date }}</span>
                </div>
                <div class="review-title">{{ review.title }}</div>
                <div class="review-content">{{ review.content }}</div>
              </div>
            </div>
          </div>
          
          <!-- Shipping tab -->
          <div v-else-if="activeTab === 'shipping'" class="shipping-tab">
            <h4>Shipping Information</h4>
            <p>Free standard shipping on all orders.</p>
            <div class="shipping-options">
              <div class="shipping-option">
                <h5>Standard Shipping (Free)</h5>
                <p>Delivery in 3-5 business days</p>
              </div>
              <div class="shipping-option">
                <h5>Express Shipping (€9.99)</h5>
                <p>Delivery in 1-2 business days</p>
              </div>
            </div>
            <div class="shipping-info">
              <p>All orders are processed within 1-2 business days. Orders placed on weekends or holidays will be processed on the next business day.</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Related products -->
      <div class="related-products">
        <h2>You May Also Like</h2>
        <div class="related-products-grid">
          <div v-for="(relatedProduct, index) in relatedProducts" :key="index" class="related-product">
            <img :src="relatedProduct.image" :alt="relatedProduct.name" class="related-product-image" />
            <h3 class="related-product-name">{{ relatedProduct.name }}</h3>
            <div class="related-product-price">€{{ relatedProduct.price.toFixed(2) }}</div>
            <button @click="viewProductDetails(relatedProduct.id)" class="view-details-btn">View Details</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';

export default {
  name: 'ProductDetails',
  props: {
    productId: {
      type: [Number, String],
      default: null
    }
  },
  setup(props) {
    // State variables
    const product = ref({});
    const loading = ref(true);
    const error = ref(null);
    const quantity = ref(1);
    const addingToCart = ref(false);
    const cartMessage = ref('');
    const cartError = ref(false);
    const currentImageIndex = ref(0);
    const activeTab = ref('specifications');
    const relatedProducts = ref([]);
    const isInsideShell = ref(!!window.__POWERED_BY_FEDERATION__);
    
    // Mock data (in a real app, this would come from API)
    const reviews = ref([
      {
        author: 'Jane Smith',
        rating: 5,
        date: '2023-04-15',
        title: 'Excellent product!',
        content: 'This product exceeded my expectations. The quality is outstanding and it arrived earlier than expected.'
      },
      {
        author: 'John Doe',
        rating: 4,
        date: '2023-03-22',
        title: 'Very good, but has minor issues',
        content: 'Overall I am satisfied with this product. It works as advertised but has a few minor quirks that could be improved.'
      }
    ]);
    
    const specifications = reactive({
      'General': {
        'Brand': 'Premium Brand',
        'Model': 'XYZ-2023',
        'Year': '2023'
      },
      'Dimensions': {
        'Width': '30 cm',
        'Height': '25 cm',
        'Depth': '10 cm',
        'Weight': '1.2 kg'
      },
      'Materials': {
        'Main Material': 'High-grade aluminum',
        'Finish': 'Matte black'
      }
    });
    
    const tabs = [
      { id: 'specifications', name: 'Specifications' },
      { id: 'reviews', name: 'Reviews' },
      { id: 'shipping', name: 'Shipping' }
    ];
    
    // Computed properties
    const productImages = computed(() => {
      if (!product.value || !product.value.image) return [];
      // In a real app, we would have multiple images for each product
      // Here we're simulating it with the same image
      return [
        product.value.image,
        product.value.image,
        product.value.image
      ];
    });
    
    const currentImage = computed(() => {
      if (productImages.value.length === 0) return '';
      return productImages.value[currentImageIndex.value];
    });
    
    const reviewsCount = computed(() => {
      return reviews.value.length;
    });
    
    const originalPrice = computed(() => {
      // Simulate original price being higher (as if there's a discount)
      if (!product.value || !product.value.price) return 0;
      return product.value.price * 1.15; // 15% higher
    });
    
    const discountPercentage = computed(() => {
      if (originalPrice.value <= product.value.price) return null;
      const discount = ((originalPrice.value - product.value.price) / originalPrice.value) * 100;
      return Math.round(discount);
    });
    
    const productFeatures = computed(() => {
      if (!product.value || !product.value.description) return [];
      // Generate fake features based on the product description
      // In a real app, these would come from the API
      const desc = product.value.description;
      return [
        `Premium quality ${desc.split(' ').slice(0, 3).join(' ')}`,
        'Durable and long-lasting construction',
        'Easy to clean and maintain',
        'Contemporary design that fits any space',
        'Manufactured with eco-friendly processes'
      ];
    });
    
    // Methods
    const fetchProduct = async () => {
      const id = props.productId || getProductIdFromUrl();
      if (!id) {
        error.value = 'No product ID provided';
        loading.value = false;
        return;
      }
      
      try {
        loading.value = true;
        error.value = null;
        
        const response = await axios.get(`http://localhost:3000/api/products/${id}`);
        product.value = response.data;
        
        // Fetch related products
        fetchRelatedProducts();
      } catch (err) {
        console.error('Error fetching product:', err);
        error.value = err.message || 'Failed to load product details';
      } finally {
        loading.value = false;
      }
    };
    
    const fetchRelatedProducts = async () => {
      try {
        // In a real app, we would fetch related products from an API endpoint
        // Here we're simplifying by getting a few random products
        const response = await axios.get('http://localhost:3000/api/products');
        // Get 3 random products that are not the current one
        relatedProducts.value = response.data
          .filter(p => p.id !== product.value.id)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
      } catch (err) {
        console.error('Error fetching related products:', err);
        // Don't set an error state as this is not critical
        relatedProducts.value = [];
      }
    };
    
    const getProductIdFromUrl = () => {
      // Get product ID from URL in case it wasn't passed as a prop
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('id');
    };
    
    const setCurrentImage = (index) => {
      currentImageIndex.value = index;
    };
    
    const incrementQuantity = () => {
      quantity.value++;
    };
    
    const decrementQuantity = () => {
      if (quantity.value > 1) {
        quantity.value--;
      }
    };
    
    const addToCart = async () => {
      if (!product.value || !product.value.id) return;
      
      try {
        addingToCart.value = true;
        cartMessage.value = '';
        cartError.value = false;
        
        // Call API to add product to cart
        await axios.post('http://localhost:3000/api/cart', {
          productId: product.value.id,
          quantity: quantity.value
        });
        
        // Show success message
        cartMessage.value = `${quantity.value} item(s) added to your cart!`;
        
        // Dispatch cart-updated event for cross-micro-frontend communication
        window.dispatchEvent(new CustomEvent('cart-updated', { 
          detail: { 
            action: 'add', 
            productId: product.value.id,
            quantity: quantity.value
          }
        }));
        
        // Clear message after a delay
        setTimeout(() => {
          cartMessage.value = '';
        }, 3000);
      } catch (err) {
        console.error('Error adding to cart:', err);
        cartMessage.value = `Error adding to cart: ${err.message}`;
        cartError.value = true;
        
        // Clear error message after a longer delay
        setTimeout(() => {
          cartMessage.value = '';
        }, 5000);
      } finally {
        addingToCart.value = false;
      }
    };
    
    const navigateToProducts = () => {
      // For standalone mode, redirect to product listing port
      if (!isInsideShell.value) {
        window.location.href = 'http://localhost:8081';
      } else {
        // When running in the shell, use the shell's navigation system
        window.dispatchEvent(new CustomEvent('navigate', { 
          detail: { path: '/products' }
        }));
      }
    };
    
    const viewProductDetails = (productId) => {
      // For standalone mode
      if (!isInsideShell.value) {
        window.location.href = `index.html?id=${productId}`;
      } else {
        // When running in the shell
        // Update URL and re-fetch product details
        // In a more complex app, this might be handled by router
        const url = new URL(window.location);
        url.searchParams.set('id', productId);
        window.history.pushState({}, '', url);
        
        // Reset state and fetch the new product
        product.value = {};
        currentImageIndex.value = 0;
        activeTab.value = 'specifications';
        fetchProduct();
      }
    };
    
    // Lifecycle hooks
    onMounted(() => {
      fetchProduct();
      
      // Listen for URL changes
      window.addEventListener('popstate', fetchProduct);
    });
    
    onBeforeUnmount(() => {
      window.removeEventListener('popstate', fetchProduct);
    });
    
    return {
      product,
      loading,
      error,
      reviews,
      reviewsCount,
      specifications,
      tabs,
      productImages,
      currentImage,
      currentImageIndex,
      activeTab,
      quantity,
      addingToCart,
      cartMessage,
      cartError,
      originalPrice,
      discountPercentage,
      productFeatures,
      relatedProducts,
      fetchProduct,
      setCurrentImage,
      incrementQuantity,
      decrementQuantity,
      addToCart,
      navigateToProducts,
      viewProductDetails
    };
  }
};
</script>

<style scoped>
/* Base styles */
.product-details {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  color: #333;
}

/* Loading and error states */
.loading-container, .error-container, .no-product {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px;
  margin: 40px auto;
  background-color: #f9fafb;
  border-radius: 12px;
  max-width: 600px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(59, 130, 246, 0.1);
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon, .no-product-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.error-container h3, .no-product h3 {
  color: #1f2937;
  margin: 0 0 15px;
  font-size: 1.5rem;
}

.error-container p, .no-product p {
  color: #6b7280;
  margin: 0 0 20px;
  line-height: 1.5;
}

.retry-button, .back-to-products {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.retry-button:hover, .back-to-products:hover {
  background-color: #2563eb;
}

/* Breadcrumb navigation */
.breadcrumb {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 0.95rem;
  color: #6b7280;
}

.breadcrumb-link {
  color: #3b82f6;
  cursor: pointer;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: #2563eb;
  text-decoration: underline;
}

.breadcrumb-separator {
  margin: 0 8px;
}

.breadcrumb-current {
  color: #4b5563;
  font-weight: 500;
}

/* Product layout */
.product-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 50px;
}

@media (max-width: 768px) {
  .product-layout {
    grid-template-columns: 1fr;
  }
}

/* Product gallery */
.product-gallery {
  position: relative;
}

.main-image-container {
  position: relative;
  margin-bottom: 15px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.main-image {
  width: 100%;
  height: auto;
  display: block;
  aspect-ratio: 4/3;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.main-image-container:hover .main-image {
  transform: scale(1.03);
}

.image-zoom-hint {
  position: absolute;
  bottom: 15px;
  right: 15px;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 6px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.85rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.zoom-icon {
  font-size: 1.1rem;
}

.thumbnails {
  display: flex;
  gap: 10px;
}

.thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.thumbnail:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.thumbnail.active {
  border-color: #3b82f6;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Product information */
.product-name {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 15px;
  line-height: 1.2;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 0.95rem;
}

.rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stars {
  color: #f59e0b;
  letter-spacing: 1px;
}

.gray-star {
  color: #d1d5db;
}

.reviews-count {
  color: #6b7280;
}

.product-id {
  color: #6b7280;
}

.product-id .label {
  margin-right: 5px;
  font-weight: 500;
}

.product-price {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 20px;
}

.current-price {
  font-size: 1.8rem;
  font-weight: 700;
  color: #111827;
}

.original-price {
  font-size: 1.2rem;
  color: #9ca3af;
  text-decoration: line-through;
}

.discount-badge {
  background-color: #ef4444;
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 12px;
}

.availability {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  font-size: 0.95rem;
}

.in-stock {
  color: #10b981;
  font-weight: 500;
}

.free-shipping {
  color: #6b7280;
}

.product-description {
  margin-bottom: 25px;
  line-height: 1.6;
  color: #4b5563;
}

.divider {
  height: 1px;
  background-color: #e5e7eb;
  margin: 25px 0;
}

/* Add to cart section */
.add-to-cart-section {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  overflow: hidden;
}

.quantity-btn {
  background-color: #f3f4f6;
  border: none;
  color: #4b5563;
  font-size: 1.2rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.quantity-btn:hover {
  background-color: #e5e7eb;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-input {
  width: 50px;
  text-align: center;
  border: none;
  font-size: 1rem;
  padding: 0;
  height: 36px;
  -moz-appearance: textfield;
}

.quantity-input::-webkit-outer-spin-button,
.quantity-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.add-to-cart-btn {
  flex: 1;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0 20px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-to-cart-btn:hover {
  background-color: #2563eb;
}

.add-to-cart-btn:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.wishlist-btn {
  background-color: #f3f4f6;
  color: #4b5563;
  border: none;
  border-radius: 6px;
  padding: 0 15px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.wishlist-btn:hover {
  background-color: #e5e7eb;
}

.wishlist-icon {
  font-size: 1.2rem;
}

.cart-message {
  background-color: #10b981;
  color: white;
  padding: 12px 15px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 0.95rem;
  animation: fadeIn 0.3s ease;
}

.cart-message.error {
  background-color: #ef4444;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Product features */
.product-features {
  margin-top: 30px;
}

.product-features h3 {
  font-size: 1.2rem;
  margin: 0 0 15px;
  color: #111827;
}

.product-features ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.product-features li {
  position: relative;
  padding-left: 25px;
  margin-bottom: 10px;
  line-height: 1.5;
  color: #4b5563;
}

.product-features li:before {
  content: "✓";
  position: absolute;
  left: 0;
  color: #10b981;
  font-weight: bold;
}

/* Product tabs */
.product-tabs {
  margin-bottom: 50px;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 25px;
}

.tab-button {
  background: none;
  border: none;
  padding: 12px 25px;
  font-size: 1rem;
  color: #6b7280;
  cursor: pointer;
  position: relative;
  font-weight: 500;
}

.tab-button.active {
  color: #3b82f6;
}

.tab-button.active:after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #3b82f6;
}

.tab-content {
  padding: 10px 0;
}

/* Specifications tab */
.specs-group {
  margin-bottom: 30px;
}

.specs-group h4 {
  font-size: 1.1rem;
  margin: 0 0 15px;
  color: #111827;
}

.specs-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 10px 30px;
}

.spec-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
}

.spec-name {
  color: #6b7280;
  font-weight: 500;
}

.spec-value {
  color: #111827;
  font-weight: 400;
  text-align: right;
}

/* Reviews tab */
.no-reviews {
  text-align: center;
  padding: 30px 0;
  color: #6b7280;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.review {
  background-color: #f9fafb;
  padding: 20px;
  border-radius: 10px;
}

.review-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.review-stars {
  color: #f59e0b;
  margin-right: 10px;
}

.review-author {
  font-weight: 600;
  color: #4b5563;
  margin-right: 10px;
}

.review-date {
  color: #9ca3af;
}

.review-title {
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
  font-size: 1.05rem;
}

.review-content {
  color: #4b5563;
  line-height: 1.6;
}

/* Shipping tab */
.shipping-tab h4 {
  font-size: 1.2rem;
  margin: 0 0 15px;
  color: #111827;
}

.shipping-tab p {
  margin: 0 0 20px;
  line-height: 1.6;
  color: #4b5563;
}

.shipping-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.shipping-option {
  background-color: #f9fafb;
  padding: 15px;
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
}

.shipping-option h5 {
  margin: 0 0 8px;
  color: #111827;
  font-size: 1.05rem;
}

.shipping-option p {
  margin: 0;
  font-size: 0.95rem;
}

.shipping-info {
  padding-top: 10px;
  border-top: 1px solid #e5e7eb;
}

/* Related products */
.related-products {
  margin-bottom: 40px;
}

.related-products h2 {
  font-size: 1.5rem;
  margin: 0 0 25px;
  color: #111827;
}

.related-products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 25px;
}

.related-product {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.related-product:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.05);
}

.related-product-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.related-product-name {
  font-size: 1.1rem;
  margin: 15px 15px 8px;
  color: #111827;
}

.related-product-price {
  font-size: 1.05rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 15px 10px;
}

.view-details-btn {
  background-color: #f3f4f6;
  color: #1f2937;
  border: none;
  width: 100%;
  padding: 10px 0;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.view-details-btn:hover {
  background-color: #e5e7eb;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .product-layout {
    gap: 30px;
  }
}

@media (max-width: 768px) {
  .add-to-cart-section {
    flex-wrap: wrap;
  }
  
  .quantity-selector {
    width: 100%;
  }
  
  .add-to-cart-btn, .wishlist-btn {
    flex: 1 0 auto;
  }
  
  .tabs-header {
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: 5px;
  }
  
  .tab-button {
    padding: 10px 15px;
  }
}

@media (max-width: 640px) {
  .product-layout {
    gap: 20px;
  }
  
  .product-name {
    font-size: 1.6rem;
  }
  
  .related-products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  .shipping-options {
    grid-template-columns: 1fr;
  }
}
</style>