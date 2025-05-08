<template>
  <div id="app">
    <header class="app-header">
      <div class="logo">
        <span class="logo-icon">🛒</span>
        <h1>Shopping Cart</h1>
      </div>
      <div class="header-actions">
        <button class="header-button" @click="navigateToProductList">
          <span class="button-icon">←</span>
          <span>Back to Shop</span>
        </button>
      </div>
    </header>
    <main class="app-content">
      <ShoppingCart />
    </main>
    <footer class="app-footer">
      <p>&copy; 2025 WebShop Micro-Frontends - Shopping Cart Module</p>
    </footer>
  </div>
</template>

<script>
import ShoppingCart from './components/ShoppingCart.vue';

export default {
  name: 'App',
  components: {
    ShoppingCart
  },
  methods: {
    navigateToProductList() {
      // For standalone mode, redirect to product listing port
      if (!window.__POWERED_BY_FEDERATION__) {
        window.location.href = 'http://localhost:8081';
      } else {
        // When running in the shell, use the shell's navigation system
        // This custom event will be captured by the shell application
        window.dispatchEvent(new CustomEvent('navigate', { 
          detail: { path: '/products' }
        }));
      }
    }
  }
};
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: #f1f5f9;
  color: #334155;
}

#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 1.8rem;
  color: #3b82f6;
}

.app-header h1 {
  font-size: 1.6rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.header-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.header-button:hover {
  background-color: #e2e8f0;
  color: #334155;
}

.button-icon {
  font-size: 1rem;
}

.app-content {
  flex: 1;
  padding: 30px 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.app-footer {
  background-color: #ffffff;
  padding: 16px 24px;
  text-align: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.03);
  margin-top: 40px;
}

.app-footer p {
  color: #94a3b8;
  font-size: 0.9rem;
}

@media (max-width: 480px) {
  .app-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
    padding: 12px 16px;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .header-button {
    width: 100%;
    justify-content: center;
  }
  
  .app-content {
    padding: 20px 12px;
  }
}
</style> 