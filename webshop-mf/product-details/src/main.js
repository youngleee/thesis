import { createApp } from 'vue'
import App from './App.vue'

// Create a function to mount the app
const mount = () => {
  createApp(App).mount('#app')
}

// Single-SPA lifecycle functions
export async function bootstrap() {
  console.log('Product Details: bootstrap')
}

export async function mount(props) {
  console.log('Product Details: mount', props)
  createApp(App).mount('#single-spa-application\\:product-details')
}

export async function unmount() {
  console.log('Product Details: unmount')
  // Clean up if needed
}

// If we're not running in the context of a container, mount immediately
if (!window.__POWERED_BY_FEDERATION__) {
  mount()
}

export { mount }
