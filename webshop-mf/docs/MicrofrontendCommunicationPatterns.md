# Micro-Frontend Communication Patterns

This document outlines the various communication patterns implemented in the WebShop micro-frontend architecture to enable seamless interaction between independent frontend components.

## Overview of Communication Challenges

Micro-frontend architectures introduce unique communication challenges:

1. **Isolation vs Integration**: Components need to be isolated for independent development but integrated for a seamless user experience
2. **State Synchronization**: Multiple components may need access to the same data
3. **Navigation Coordination**: Components need to trigger navigation in the shell application
4. **Cross-Origin Limitations**: Security restrictions can limit direct communication
5. **Resilience Requirements**: Communication must be robust against failures

## Implemented Communication Patterns

The WebShop application implements several complementary communication patterns:

### 1. Props and Events (Parent-Child Communication)

**Implementation**: The shell passes data to micro-frontends via props and listens for events they emit.

**Example**:
```javascript
// In Shell's App.vue
<RemoteProductList :searchTerm="searchQuery" />

// In ProductList component
props: {
  searchTerm: {
    type: String,
    default: ''
  }
}
```

**Best for**: Simple parent-child data passing without complex state management.

### 2. Custom Browser Events

**Implementation**: Components dispatch and listen for custom events on the window object.

**Example**:
```javascript
// Dispatching an event (in ProductList.vue)
window.dispatchEvent(new CustomEvent('navigate', { 
  detail: { path: '/cart' }
}));

// Listening for events (in App.vue)
window.addEventListener('navigate', navigateEventHandler);
```

**Best for**: Indirect communication between components that don't have direct references to each other.

### 3. WebSockets for Real-Time Updates

**Implementation**: All components connect to the same WebSocket server and receive broadcast messages.

**Example**:
```javascript
// In component setup:
wsRef.value = new WebSocket('ws://localhost:3000');

wsRef.value.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'CART_UPDATE') {
    // Update local state
  }
};
```

**Best for**: Real-time updates and notifications that need to reach multiple components simultaneously.

### 4. Global Function Exposure

**Implementation**: Critical functions are exposed on the window object for direct access.

**Example**:
```javascript
// In Shell's App.vue:
window.shellNavigateTo = navigateTo;

// In ProductList.vue:
if (window.shellNavigateTo) {
  window.shellNavigateTo('cart');
}
```

**Best for**: Critical operations like navigation where reliability is paramount.

### 5. Direct Object Access

**Implementation**: Component instances are exposed globally for direct method calls.

**Example**:
```javascript
// In Shell's App.vue:
window.__shell_app = {
  setView: (view) => {
    currentView.value = view;
  }
};

// In ProductList.vue:
if (window.__shell_app && typeof window.__shell_app.setView === 'function') {
  window.__shell_app.setView('cart');
}
```

**Best for**: Advanced scenarios where full access to component methods is needed.

### 6. URL Parameter Synchronization

**Implementation**: State is reflected in URL parameters, which components can read on initialization.

**Example**:
```javascript
// In Shell's App.vue:
const initFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const viewParam = urlParams.get('view');
  if (viewParam === 'cart') {
    currentView.value = 'cart';
  }
};

// When navigating:
const url = new URL(window.location);
url.searchParams.set('view', 'cart');
window.history.pushState({}, '', url);
```

**Best for**: Bookmarkable state that should persist across page refreshes.

### 7. Local Storage / Session Storage

**Implementation**: State is stored in browser storage for cross-component access.

**Example**:
```javascript
// Storing navigation target:
sessionStorage.setItem('navTarget', 'cart');

// Reading in another component:
const navTarget = sessionStorage.getItem('navTarget');
if (navTarget === 'cart') {
  // Navigate to cart
}
```

**Best for**: Temporary state that should persist across micro-frontend boundaries but not necessarily across sessions.

## Multi-Layered Approach for Navigation

For critical operations like navigation between micro-frontends, we implemented a multi-layered approach:

```javascript
const viewCart = () => {
  // Method 1: Global function
  if (window.shellNavigateTo) {
    window.shellNavigateTo('cart');
    return;
  }
  
  // Method 2: Custom event
  window.dispatchEvent(new CustomEvent('navigate', { 
    detail: { path: '/cart' }
  }));
  
  // Method 3: Direct object access
  try {
    if (window.__shell_app && typeof window.__shell_app.setView === 'function') {
      window.__shell_app.setView('cart');
    }
  } catch (err) {
    console.error('Error using direct object access:', err);
  }
  
  // Method 4: Session storage fallback (for page refreshes)
  try {
    sessionStorage.setItem('navTarget', 'cart');
  } catch (err) {
    console.error('Error using session storage:', err);
  }
};
```

This approach ensures maximum resilience by trying multiple communication methods in sequence.

## Lessons Learned

1. **Favor Simplicity**: Start with the simplest appropriate communication pattern
2. **Add Layers for Resilience**: Critical operations benefit from multiple approaches
3. **Consider Browser Limitations**: Event propagation can be unpredictable across iframes
4. **Verbose Logging**: Add detailed logs to trace communication flows
5. **Establish Conventions**: Define clear patterns for different types of communication

## Future Communication Enhancements

1. **Message Bus**: Implement a dedicated communication bus for more structured event handling
2. **Shared State Library**: Consider Redux or other state management libraries for shared state
3. **Communication Protocol**: Define a formal protocol for all micro-frontend communication
4. **Service Workers**: Use service workers as communication relays between micro-frontends
5. **Web Workers**: Offload intensive processing to web workers to keep the UI responsive

By implementing these patterns and continuing to refine our approach, we ensure that the micro-frontend architecture remains robust while maintaining the independence of each component. 