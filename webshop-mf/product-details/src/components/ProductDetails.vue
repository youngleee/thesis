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
/* ... */
</style>