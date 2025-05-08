<template>
  <div class="shopping-cart">
    <div class="cart-header">
      <h2>Your Shopping Cart</h2>
    </div>
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading your cart...</p>
    </div>
    <div v-else-if="error" class="error-message">
      <i class="error-icon">⚠️</i>
      <p>Error loading cart: {{ error }}</p>
    </div>
    <div v-else-if="cart.length === 0" class="empty-cart">
      <div class="empty-cart-icon">🛒</div>
      <p>Your cart is empty</p>
      <button class="continue-shopping" @click="navigateToProductList">Continue Shopping</button>
    </div>
    <div v-else class="cart-items">
      <div v-for="item in cart" :key="item.id" class="cart-item">
        <div class="item-image-container">
          <img :src="item.image" :alt="item.name" class="item-image">
        </div>
        <div class="item-details">
          <h3 class="item-name">{{ item.name }}</h3>
          <p class="price">€{{ item.price.toFixed(2) }}</p>
        </div>
        <div class="item-controls">
          <div class="quantity-controls">
            <button class="quantity-btn decrease" @click="updateQuantity(item.id, item.quantity - 1)" :disabled="item.quantity <= 1">
              <span>-</span>
            </button>
            <span class="quantity">{{ item.quantity }}</span>
            <button class="quantity-btn increase" @click="updateQuantity(item.id, item.quantity + 1)">
              <span>+</span>
            </button>
          </div>
          <div class="item-total">
            <span class="item-total-label">Subtotal:</span>
            <span class="item-total-price">€{{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
          <button class="remove-btn" @click="removeFromCart(item.id)">
            <span class="remove-icon">×</span>
            <span>Remove</span>
          </button>
        </div>
      </div>
      <div class="cart-summary">
        <div class="summary-details">
          <div class="summary-row">
            <span>Items ({{ cart.length }}):</span>
            <span>€{{ totalPrice.toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span>Shipping:</span>
            <span>Free</span>
          </div>
          <div class="summary-divider"></div>
          <div class="cart-total">
            <span>Total:</span>
            <span class="total-price">€{{ totalPrice.toFixed(2) }}</span>
          </div>
        </div>
        <button class="checkout-btn">
          <span class="checkout-icon">✓</span>
          <span>Proceed to Checkout</span>
        </button>
        <button class="clear-cart-btn" @click="clearCart">
          <span>Clear Cart</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';

export default {
  name: 'ShoppingCart',
  setup() {
    const cart = ref([]);
    const loading = ref(true);
    const error = ref(null);

    const totalPrice = computed(() => {
      return cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    });

    const fetchCart = async () => {
      try {
        loading.value = true;
        const response = await axios.get('http://localhost:3000/api/cart');
        cart.value = response.data;
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    const updateQuantity = async (id, newQuantity) => {
      if (newQuantity < 1) return;
      
      try {
        await axios.put(`http://localhost:3000/api/cart/${id}`, { quantity: newQuantity });
        // Update local state
        const itemIndex = cart.value.findIndex(item => item.id === id);
        if (itemIndex !== -1) {
          cart.value[itemIndex].quantity = newQuantity;
        }
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('cart-updated', { 
          detail: { action: 'update', productId: id, quantity: newQuantity }
        }));
      } catch (err) {
        error.value = `Error updating quantity: ${err.message}`;
      }
    };

    const removeFromCart = async (id) => {
      try {
        await axios.delete(`http://localhost:3000/api/cart/${id}`);
        // Update local state
        cart.value = cart.value.filter(item => item.id !== id);
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('cart-updated', { 
          detail: { action: 'remove', productId: id }
        }));
      } catch (err) {
        error.value = `Error removing item: ${err.message}`;
      }
    };

    const clearCart = async () => {
      try {
        await axios.delete('http://localhost:3000/api/cart');
        cart.value = [];
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('cart-updated', { 
          detail: { action: 'clear' }
        }));
      } catch (err) {
        error.value = `Error clearing cart: ${err.message}`;
      }
    };
    
    const navigateToProductList = () => {
      // For standalone mode, redirect to product listing port
      if (!window.__POWERED_BY_FEDERATION__) {
        window.location.href = 'http://localhost:8081';
      } else {
        // When running in the shell, use the shell's navigation system
        window.dispatchEvent(new CustomEvent('navigate', { 
          detail: { path: '/products' }
        }));
      }
    };

    // Handle cart update events from other micro-frontends
    const handleCartUpdate = (event) => {
      console.log('Cart update event received:', event.detail);
      fetchCart();
    };

    onMounted(() => {
      fetchCart();
      
      // Listen for cart update events
      window.addEventListener('cart-updated', handleCartUpdate);
    });
    
    // Clean up event listeners when component is unmounted
    onBeforeUnmount(() => {
      window.removeEventListener('cart-updated', handleCartUpdate);
    });

    return {
      cart,
      loading,
      error,
      totalPrice,
      updateQuantity,
      removeFromCart,
      clearCart,
      navigateToProductList
    };
  }
};
</script>

<style scoped>
.shopping-cart {
  max-width: 900px;
  margin: 0 auto;
  padding: 25px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.cart-header {
  margin-bottom: 25px;
  border-bottom: 2px solid #f5f5f5;
  padding-bottom: 15px;
}

h2 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  text-align: left;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.cart-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.item-image-container {
  width: 100px;
  height: 100px;
  margin-right: 20px;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
  border: 1px solid #eee;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.item-image:hover {
  transform: scale(1.05);
}

.item-details {
  flex: 1;
  padding-right: 15px;
}

.item-name {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #334155;
}

.price {
  color: #e53e3e;
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0;
}

.item-controls {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  min-width: 160px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 8px;
  padding: 3px;
  border: 1px solid #e2e8f0;
}

.quantity-btn {
  background-color: #f8fafc;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.quantity-btn:hover:not(:disabled) {
  background-color: #e2e8f0;
}

.quantity-btn.decrease:hover:not(:disabled) {
  color: #e53e3e;
}

.quantity-btn.increase:hover:not(:disabled) {
  color: #38a169;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity {
  margin: 0 12px;
  font-weight: 600;
  font-size: 1rem;
  min-width: 20px;
  text-align: center;
}

.item-total {
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.item-total-label {
  color: #64748b;
  font-size: 0.85rem;
}

.item-total-price {
  font-weight: 600;
  color: #334155;
}

.remove-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background-color: #fee2e2;
  color: #e53e3e;
  border-color: #fecaca;
}

.remove-icon {
  font-size: 1.2rem;
  font-weight: bold;
}

.cart-summary {
  margin-top: 25px;
  padding: 20px;
  background-color: #f8fafc;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.summary-details {
  margin-bottom: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  color: #64748b;
}

.summary-divider {
  height: 1px;
  background-color: #e2e8f0;
  margin: 10px 0;
}

.cart-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.3rem;
  font-weight: 600;
  color: #334155;
  padding: 10px 0;
}

.total-price {
  color: #e53e3e;
}

.checkout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 14px 20px;
  width: 100%;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 1.1rem;
  margin-bottom: 12px;
  transition: background-color 0.2s ease;
}

.checkout-btn:hover {
  background-color: #2563eb;
}

.checkout-icon {
  font-size: 1rem;
}

.clear-cart-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
  padding: 10px 15px;
  width: 100%;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.clear-cart-btn:hover {
  background-color: #fee2e2;
  color: #e53e3e;
  border-color: #fecaca;
}

.empty-cart {
  text-align: center;
  padding: 40px 20px;
}

.empty-cart-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  color: #94a3b8;
}

.empty-cart p {
  margin-bottom: 25px;
  font-size: 1.2rem;
  color: #64748b;
}

.continue-shopping {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.continue-shopping:hover {
  background-color: #2563eb;
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
  border: 4px solid rgba(203, 213, 225, 0.3);
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
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #b91c1c;
  text-align: center;
  padding: 30px;
  background-color: #fee2e2;
  border-radius: 8px;
  margin: 20px 0;
  border: 1px solid #fecaca;
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 15px;
}

@media (max-width: 768px) {
  .cart-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .item-image-container {
    width: 100%;
    height: 200px;
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .item-details {
    width: 100%;
    padding-right: 0;
    margin-bottom: 15px;
  }
  
  .item-controls {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 15px;
    justify-content: space-between;
    align-items: center;
  }
  
  .quantity-controls {
    order: 1;
  }
  
  .item-total {
    order: 2;
  }
  
  .remove-btn {
    order: 3;
  }
}

@media (max-width: 480px) {
  .shopping-cart {
    padding: 15px;
  }
  
  .item-controls {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .quantity-controls, .item-total, .remove-btn {
    width: 100%;
  }
  
  .item-total {
    flex-direction: row;
    justify-content: space-between;
  }
  
  .remove-btn {
    justify-content: center;
  }
}
</style> 