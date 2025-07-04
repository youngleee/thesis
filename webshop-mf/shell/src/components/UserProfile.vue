<template>
  <div class="user-profile">
    <div class="profile-container">
      <div class="profile-header">
        <h2>User Profile</h2>
        <button @click="handleLogout" class="logout-btn">Logout</button>
      </div>
      
      <div v-if="isLoading" class="loading">
        <div class="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
      
      <div v-else-if="error" class="error-message">
        {{ error }}
        <button @click="loadUserProfile" class="retry-btn">Retry</button>
      </div>
      
      <div v-else-if="user" class="profile-content">
        <div class="profile-section">
          <h3>Account Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Username:</label>
              <span>{{ user.username }}</span>
            </div>
            <div class="info-item">
              <label>Email:</label>
              <span>{{ user.email }}</span>
            </div>
            <div class="info-item">
              <label>Member since:</label>
              <span>{{ formatDate(user.created_at) }}</span>
            </div>
          </div>
        </div>
        
        <div class="profile-section">
          <h3>Shopping Cart</h3>
          <div class="cart-summary">
            <p>Items in cart: <strong>{{ cartItemCount }}</strong></p>
            <button @click="navigateToCart" class="view-cart-btn">
              View Cart
            </button>
          </div>
        </div>
        
        <div class="profile-section">
          <h3>Order History</h3>
          <div class="coming-soon">
            <p>Order history will be available when we implement the order management system.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserProfile',
  emits: ['logout'],
  data() {
    return {
      user: null,
      isLoading: true,
      error: '',
      cartItemCount: 0
    }
  },
  async mounted() {
    await this.loadUserProfile()
    await this.loadCartCount()
  },
  methods: {
    async loadUserProfile() {
      this.isLoading = true
      this.error = ''
      
      try {
        const response = await fetch('http://localhost:3000/api/auth/me', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          this.user = data.user
        } else {
          this.error = 'Failed to load user profile'
        }
      } catch (err) {
        console.error('Error loading profile:', err)
        this.error = 'Network error. Please try again.'
      } finally {
        this.isLoading = false
      }
    },
    
    async loadCartCount() {
      try {
        const response = await fetch('http://localhost:3000/api/cart', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          this.cartItemCount = data.length || 0
        }
      } catch (err) {
        console.error('Error loading cart count:', err)
      }
    },
    
    async handleLogout() {
      try {
        await fetch('http://localhost:3000/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        })
        this.$emit('logout')
      } catch (err) {
        console.error('Error logging out:', err)
        // Still emit logout to clear local state
        this.$emit('logout')
      }
    },
    
    navigateToCart() {
      // Use the global navigation function
      if (window.shellNavigateTo) {
        window.shellNavigateTo('cart')
      }
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.user-profile {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.profile-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-header {
  background: #2196f3;
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-header h2 {
  margin: 0;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.loading {
  text-align: center;
  padding: 3rem;
}

.loading-spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #2196f3;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #d32f2f;
  background: #ffebee;
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem;
  text-align: center;
}

.retry-btn {
  background: #d32f2f;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 1rem;
}

.profile-content {
  padding: 2rem;
}

.profile-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

.profile-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.profile-section h3 {
  color: #333;
  margin-bottom: 1rem;
}

.info-grid {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.info-item label {
  font-weight: 500;
  color: #555;
}

.cart-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.view-cart-btn {
  background: #4caf50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.view-cart-btn:hover {
  background: #388e3c;
}

.coming-soon {
  text-align: center;
  padding: 2rem;
  color: #666;
  background: #f8f9fa;
  border-radius: 4px;
}
</style> 