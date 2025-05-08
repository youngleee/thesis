<template>
  <div class="app">
    <header>
      <h1>Product Listing Micro-Frontend</h1>
      <p class="subtitle">Running in standalone mode</p>
    </header>
    <main>
      <ProductList />
    </main>
    <footer>
      <p>&copy; 2023 Webshop Micro-Frontend Demo</p>
    </footer>
  </div>
</template>

<script>
import ProductList from './components/ProductList.vue'

export default {
  name: 'App',
  components: {
    ProductList
  }
}
</script>

<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
}

.app {
  max-width: 1280px;
  margin: 0 auto;
}

header {
  background-color: #2196f3;
  color: white;
  padding: 20px;
  text-align: center;
  margin-bottom: 30px;
  border-radius: 0 0 5px 5px;
}

h1 {
  margin: 0;
}

.subtitle {
  margin-top: 5px;
  opacity: 0.8;
}

main {
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

footer {
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 0.9rem;
}
</style>
