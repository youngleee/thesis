<template>
  <div class="fallback-product-list">
    <h2>Product Listing</h2>
    <div class="error-message">
      <p>Sorry, we couldn't load the product listing component.</p>
      <p>Please try refreshing the page or contact support if the problem persists.</p>
    </div>
    <div class="fallback-products">
      <!-- Fallback static product cards -->
      <div class="product-card" v-for="n in 3" :key="n">
        <div class="placeholder-image"></div>
        <div class="placeholder-title"></div>
        <div class="placeholder-price"></div>
        <div class="placeholder-description"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FallbackProductList'
}
</script>

<style scoped>
.fallback-product-list {
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 5px;
}

.error-message {
  background-color: #fff8f8;
  border-left: 4px solid #e74c3c;
  padding: 10px 15px;
  margin-bottom: 20px;
  color: #333;
}

.fallback-products {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.product-card {
  border: 1px solid #eee;
  border-radius: 5px;
  padding: 15px;
  background-color: #f9f9f9;
}

.placeholder-image {
  height: 150px;
  background-color: #ddd;
  margin-bottom: 15px;
  border-radius: 3px;
}

.placeholder-title {
  height: 20px;
  background-color: #ddd;
  margin-bottom: 10px;
  width: 80%;
  border-radius: 3px;
}

.placeholder-price {
  height: 15px;
  background-color: #ddd;
  margin-bottom: 15px;
  width: 40%;
  border-radius: 3px;
}

.placeholder-description {
  height: 60px;
  background-color: #ddd;
  border-radius: 3px;
}
</style> 