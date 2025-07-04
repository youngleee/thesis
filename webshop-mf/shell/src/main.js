import { createApp } from 'vue'
import { registerApplication, start } from 'single-spa'
import App from './App.vue'

// Create a function to mount the app
const mount = () => {
  createApp(App).mount('#app')
}

// Register the shell application
registerApplication({
  name: 'shell',
  app: () => Promise.resolve({ 
    bootstrap: () => Promise.resolve(),
    mount: () => Promise.resolve(),
    unmount: () => Promise.resolve()
  }),
  activeWhen: () => true // Shell is always active
})

// Register remote micro-frontends
registerApplication({
  name: 'product-listing',
  app: () => import('productListing/ProductList'),
  activeWhen: (location) => location.pathname === '/products' || location.pathname === '/'
})

registerApplication({
  name: 'shopping-cart',
  app: () => import('shoppingCart/ShoppingCart'),
  activeWhen: (location) => location.pathname === '/cart'
})

registerApplication({
  name: 'product-details',
  app: () => import('productDetails/ProductDetails'),
  activeWhen: (location) => location.pathname.startsWith('/product/')
})

registerApplication({
  name: 'checkout',
  app: () => import('checkout/Checkout'),
  activeWhen: (location) => location.pathname === '/checkout'
})

// Start Single-SPA
start()

// If we're not running in the context of a container, mount immediately
if (!window.__POWERED_BY_FEDERATION__) {
  mount()
}

export { mount }
