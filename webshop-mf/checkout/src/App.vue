<template>
  <div id="app">
    <Checkout />
  </div>
</template>

<script>
import Checkout from './components/Checkout.vue'

export default {
  name: 'App',
  components: {
    Checkout
  }
}
</script>

<style>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
  padding: 0;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background-color: #f8f9fa;
}
</style> 