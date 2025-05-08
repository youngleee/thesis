<template>
  <div class="app-container">
    <header>
      <h1>Product Details</h1>
      <p>Product Details Micro-Frontend</p>
    </header>
    
    <main>
      <ProductDetails />
    </main>
    
    <footer>
      <p>&copy; 2025 Webshop Micro-Frontend Demo</p>
    </footer>
  </div>
</template>

<script>
import ProductDetails from './components/ProductDetails.vue'

export default {
  name: 'App',
  components: {
    ProductDetails
  }
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #f1f5f9;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background-color: #3b82f6;
  color: white;
  padding: 20px;
  text-align: center;
}

header h1 {
  margin: 0;
  font-size: 2rem;
}

header p {
  margin: 8px 0 0;
  opacity: 0.8;
}

main {
  flex: 1;
  padding: 20px;
}

footer {
  background-color: #f1f5f9;
  color: #64748b;
  text-align: center;
  padding: 20px;
  border-top: 1px solid #e2e8f0;
}
</style>
