# WebSocket Communication Flow in Micro-Frontend Architecture

This document provides a visual explanation of how WebSockets are used for real-time communication in our micro-frontend architecture.

## System Architecture with WebSockets

```
┌───────────────────────────────────────────────────────────────────┐
│                        Browser Environment                         │
│                                                                   │
│  ┌───────────────┐     ┌───────────────┐     ┌───────────────┐    │
│  │               │     │               │     │               │    │
│  │  Shell App    │     │  Product      │     │  Shopping     │    │
│  │  (Container)  │     │  List MFE     │     │  Cart MFE     │    │
│  │               │     │               │     │               │    │
│  └───────┬───────┘     └───────┬───────┘     └───────┬───────┘    │
│          │                     │                     │            │
│          │     Custom Events   │                     │            │
│          ◄─────────────────────►                     │            │
│          │                                           │            │
│          │     Custom Events   │                     │            │
│          ◄─────────────────────────────────────────►             │
│          │                                                        │
└──────────┼─────────────────────┼─────────────────────┼────────────┘
           │                     │                     │
           │                     │                     │
           │                     │                     │
           ▼                     ▼                     ▼
   ┌───────────────────────────────────────────────────────┐
   │                                                       │
   │              WebSocket Connection Pool                │
   │                                                       │
   └───────────────────────┬───────────────────────────────┘
                           │
                           │
                           ▼
   ┌───────────────────────────────────────────────────────┐
   │                                                       │
   │                 Backend Server                        │
   │                 (Express + WS)                        │
   │                                                       │
   └───────────────────────┬───────────────────────────────┘
                           │
                           │
                           ▼
   ┌───────────────────────────────────────────────────────┐
   │                                                       │
   │                 In-Memory Data Store                  │
   │                 (Cart & Products)                     │
   │                                                       │
   └───────────────────────────────────────────────────────┘
```

## Communication Sequence

This sequence diagram illustrates the flow of communication when performing cart operations:

```
┌───────┐          ┌───────┐          ┌───────┐          ┌───────┐          ┌───────┐
│ User  │          │Product │          │Shopping│          │Backend │          │ Shell │
│       │          │List MFE│          │Cart MFE│          │Server  │          │ App   │
└───┬───┘          └───┬───┘          └───┬───┘          └───┬───┘          └───┬───┘
    │                  │                  │                  │                  │
    │ Click "Add to    │                  │                  │                  │
    │ Cart"            │                  │                  │                  │
    │ ─────────────────>                  │                  │                  │
    │                  │                  │                  │
    │                  │ POST /api/cart   │                  │                  │
    │                  │ ─────────────────────────────────────>                  │
    │                  │                  │                  │                  │
    │                  │                  │                  │ Process Request  │
    │                  │                  │                  │ ───────────────  │
    │                  │                  │                  │                  │
    │                  │                  │                  │ Broadcast via WS │
    │                  │                  │                  │ ─────────────────>
    │                  │                  │                  │                  │
    │                  │                  │ Broadcast via WS │                  │
    │                  │                  │ <─────────────────                  │
    │                  │                  │                  │                  │
    │                  │ Broadcast via WS │                  │                  │
    │                  │ <─────────────────────────────────────                  │
    │                  │                  │                  │                  │
    │                  │ 200 OK Response  │                  │                  │
    │                  │ <─────────────────────────────────────                  │
    │                  │                  │                  │                  │
    │                  │ Update UI        │                  │                  │
    │                  │ ───────────────  │                  │                  │
    │                  │                  │                  │                  │
    │                  │ Dispatch Custom  │                  │                  │
    │                  │ Event (legacy)   │                  │                  │
    │                  │ ──────────────────────────────────────────────────────> │
    │                  │                  │                  │                  │
    │                  │                  │ Update Cart UI   │                  │
    │                  │                  │ via WS message   │                  │
    │                  │                  │ ───────────────  │                  │
    │                  │                  │                  │                  │ Update Cart 
    │                  │                  │                  │                  │ Count Badge
    │                  │                  │                  │                  │ ───────────
    │                  │                  │                  │                  │
    │                  │                  │                  │                  │
┌───┴───┐          ┌───┴───┐          ┌───┴───┐          ┌───┴───┐          ┌───┴───┐
│ User  │          │Product │          │Shopping│          │Backend │          │ Shell │
│       │          │List MFE│          │Cart MFE│          │Server  │          │ App   │
└───────┘          └───────┘          └───────┘          └───────┘          └───────┘
```

## WebSocket Connection Lifecycle

Each micro-frontend component and the shell establish their own WebSocket connections:

### 1. Connection Establishment

```javascript
// In any component (Shell, ShoppingCart, etc.)
const wsRef = ref(null);
const isConnected = ref(false);

// Set up WebSocket connection
const setupWebSocket = () => {
  wsRef.value = new WebSocket('ws://localhost:3000');
  
  wsRef.value.onopen = () => {
    isConnected.value = true;
    console.log('WebSocket connection established');
  };
  
  // Additional handlers...
};

onMounted(() => {
  setupWebSocket();
});
```

### 2. Message Handling

```javascript
wsRef.value.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    console.log('WebSocket message received:', data);
    
    if (data.type === 'CART_UPDATE') {
      // Different components handle the update differently:
      
      // Shopping Cart component updates the full cart data
      cart.value = data.data;
      
      // Shell only updates the cart count
      cartItemCount.value = data.data.length || 0;
    }
  } catch (err) {
    console.error('Error processing WebSocket message:', err);
  }
};
```

### 3. Connection Error Handling

```javascript
// Exponential backoff for reconnection
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

wsRef.value.onclose = (event) => {
  isConnected.value = false;
  
  if (!event.wasClean && reconnectAttempts < maxReconnectAttempts) {
    reconnectAttempts++;
    const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000);
    
    setTimeout(setupWebSocket, delay);
  }
};

wsRef.value.onerror = (err) => {
  console.error('WebSocket error:', err);
  
  // Fall back to REST API if needed
  if (loading.value) {
    fetchDataFromRestApi();
  }
};
```

### 4. Connection Cleanup

```javascript
onBeforeUnmount(() => {
  // Close WebSocket connection
  if (wsRef.value) {
    wsRef.value.close();
    wsRef.value = null;
  }
});
```

## Fallback Mechanisms

The implementation includes fallback mechanisms to ensure functionality even when WebSockets are unavailable:

```
┌───────────────────────────────────┐
│                                   │
│     WebSocket Connection          │
│     Attempt                       │
│                                   │
└──────────────┬────────────────────┘
               │
               ▼
┌──────────────┴────────────────────┐
│                                   │
│     Connection                    │
│     Successful?                   │
│                                   │
└──────────────┬────────────────────┘
               │
       ┌───────┴──────────┐
       │                  │
       ▼                  ▼
┌──────────────┐    ┌─────────────────┐
│              │    │                 │
│     Yes      │    │      No         │
│              │    │                 │
└──────┬───────┘    └────────┬────────┘
       │                     │
       ▼                     ▼
┌──────────────┐    ┌─────────────────┐
│ Use WebSocket│    │ Fall back to    │
│ for real-time│    │ REST API +      │
│ updates      │    │ Custom Events   │
└──────────────┘    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Attempt         │
                    │ reconnection    │
                    │ with exponential│
                    │ backoff         │
                    └─────────────────┘
```

## Data Flow Through the System

This diagram illustrates how data flows through the system when a user adds an item to the cart:

```
┌─────────────┐   REST API Call   ┌─────────────┐
│ Product     │ ──────────────────► Backend     │
│ List MFE    │                   │ Server      │
└─────────────┘                   └──────┬──────┘
                                         │
                                         │ Update Internal Cart State
                                         ▼
┌─────────────┐   WebSocket      ┌──────┴──────┐
│ Shell App   │ ◄────────────────┤ Broadcast   │
└─────────────┘   Message        │ Cart Update │
                                 └──────┬──────┘
┌─────────────┐   WebSocket      │
│ Shopping    │ ◄────────────────┘
│ Cart MFE    │   Message
└─────────────┘
```

## Performance Metrics

The following chart compares response time and network overhead between WebSocket and polling approaches for cart updates:

```
Response Time (ms)
│
│    *
│    *
│    *
│    *                            *
│    *                            *
│    *                            *
│    *                            *
│    *                            *   *   *   *
└────┼────────────────────────────┼───┼───┼───┼─────►
    WebSocket                  Polling (interval)
    (< 50ms)                    (0-5000ms)


Network Requests per Hour
│
│                              ****
│                              ****
│                              ****
│                              ****
│                              ****
│                              ****
│  **                          ****
└──┼─────────────────────────────┼─────►
  WebSocket                    Polling
   (~2)                         (720)
```

## Browser Support and Compatibility

Modern browsers have excellent support for WebSockets:

| Browser          | Version Support | Notes                     |
|------------------|----------------|---------------------------|
| Chrome           | 4+             | Full support              |
| Firefox          | 4+             | Full support              |
| Safari           | 5+             | Full support              |
| Edge             | 12+            | Full support              |
| IE               | 10+            | Limited in IE10           |
| Mobile Browsers  | Most modern    | Full support              |

For older browsers, the application falls back to REST API calls and custom events.

## Conclusion

The WebSocket implementation in our micro-frontend architecture provides real-time communication while maintaining the independence of each micro-frontend. This approach combines the benefits of a distributed frontend architecture with the responsiveness of real-time updates, creating a seamless user experience despite the underlying modular structure. 