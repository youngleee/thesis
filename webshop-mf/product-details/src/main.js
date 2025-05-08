import { createApp } from 'vue'
import App from './App.vue'

// Bootstrap for standalone or dev mode
// In production as a micro-frontend, this won't be executed since the shell will import the exposed component directly
const mount = () => {
  createApp(App).mount('#app')
}

// Execute the mounting function immediately in dev mode or if running standalone
// This allows us to run the micro-frontend by itself for development
if (!window.__POWERED_BY_FEDERATION__) {
  mount()
}

// For Module Federation - this allows the micro-frontend to be used by the shell
export { mount }
