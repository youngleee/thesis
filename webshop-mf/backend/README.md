# WebShop Micro-Frontend Backend Service

This is the backend service for the WebShop Micro-Frontend application, featuring a RESTful API and WebSocket server for real-time communication between micro-frontends.

## Overview

The backend service provides:

1. **RESTful API**: For product and shopping cart operations
2. **WebSocket Server**: For real-time updates across all micro-frontends
3. **In-Memory Data Store**: Simulates a database for products and cart items

## Technical Details

- **Framework**: Node.js with Express.js
- **Database**: In-memory data (SQLite integration planned for future)
- **APIs**: RESTful JSON endpoints
- **CORS**: Enabled for all origins (configured for development)
- **Content Type**: Application/JSON

## Implementation Details

### Server Setup

The Express server is configured with necessary middleware and initialized on port 3000:

```javascript
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());  // Enable CORS for all origins
app.use(express.json());  // Parse JSON request bodies

// ... routes and other configuration ...

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
```

### CORS Configuration

Cross-Origin Resource Sharing (CORS) is essential for a micro-frontend architecture where different components might be served from different domains or ports. The current configuration allows requests from any origin, which is suitable for development but should be restricted in production:

```javascript
// Development CORS configuration
app.use(cors());

// Production CORS configuration (future)
// app.use(cors({
//   origin: ['http://your-production-domain.com', 'http://localhost:8080'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));
```

### Data Model

The product data is currently stored in-memory as a JavaScript array:

```javascript
const products = [
  {
    id: 1,
    name: "Ergonomic Desk Chair",
    price: 199.99,
    description: "A comfortable desk chair with lumbar support for long work sessions.",
    image: "https://placehold.co/300x200?text=Chair"
  },
  // More products...
];
```

In a future implementation, this would be replaced with SQLite database integration.

### Route Handling

The API endpoints are implemented using Express routes:

```javascript
// Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Get a single product by ID
app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);
  
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  res.json(product);
});
```

### Error Handling

The service includes basic error handling for non-existent resources:

```javascript
if (!product) {
  return res.status(404).json({ message: 'Product not found' });
}
```

A more comprehensive error handling strategy would include:

- Validation errors (400 Bad Request)
- Authentication/authorization errors (401/403)
- Server errors (500 Internal Server Error)
- Custom error types with appropriate status codes

## API Endpoints

The service currently provides the following endpoints:

### `GET /api/products`

Returns a list of all products.

**Request:**
```
GET http://localhost:3000/api/products
```

**Response Status:** 200 OK

**Response Format:**
```json
[
  {
    "id": 1,
    "name": "Ergonomic Desk Chair",
    "price": 199.99,
    "description": "A comfortable desk chair with lumbar support for long work sessions.",
    "image": "https://placehold.co/300x200?text=Chair"
  },
  // More products...
]
```

### `GET /api/products/:id`

Returns a single product by ID.

**Request:**
```
GET http://localhost:3000/api/products/1
```

**Response Status:** 200 OK

**Response Format:**
```json
{
  "id": 1,
  "name": "Ergonomic Desk Chair",
  "price": 199.99,
  "description": "A comfortable desk chair with lumbar support for long work sessions.",
  "image": "https://placehold.co/300x200?text=Chair"
}
```

**Error Response (404):**
```json
{
  "message": "Product not found"
}
```

### Cart API Endpoints

The following endpoints support the shopping cart functionality:

### `GET /api/cart`

Returns the current contents of the shopping cart with product details.

**Request:**
```
GET http://localhost:3000/api/cart
```

**Response Status:** 200 OK

**Response Format:**
```json
[
  {
    "id": 1,
    "name": "Ergonomic Desk Chair",
    "price": 199.99,
    "description": "A comfortable desk chair with lumbar support for long work sessions.",
    "image": "https://placehold.co/300x200?text=Chair",
    "quantity": 2
  },
  // More items...
]
```

### `POST /api/cart`

Adds a product to the cart.

**Request:**
```
POST http://localhost:3000/api/cart
Content-Type: application/json

{
  "productId": 1,
  "quantity": 1
}
```

**Response Status:** 201 Created

**Response Format:**
```json
{
  "message": "Product added to cart",
  "cart": [
    {
      "productId": 1, 
      "quantity": 1
    },
    // More items...
  ]
}
```

**Error Response (400):**
```json
{
  "message": "Product ID is required"
}
```

**Error Response (404):**
```json
{
  "message": "Product not found"
}
```

### `PUT /api/cart/:productId`

Updates the quantity of a product in the cart.

**Request:**
```
PUT http://localhost:3000/api/cart/1
Content-Type: application/json

{
  "quantity": 3
}
```

**Response Status:** 200 OK

**Response Format:**
```json
{
  "message": "Cart updated",
  "cart": [
    {
      "productId": 1, 
      "quantity": 3
    },
    // More items...
  ]
}
```

**Error Response (400):**
```json
{
  "message": "Valid quantity is required"
}
```

**Error Response (404):**
```json
{
  "message": "Item not found in cart"
}
```

### `DELETE /api/cart/:productId`

Removes a specific product from the cart.

**Request:**
```
DELETE http://localhost:3000/api/cart/1
```

**Response Status:** 200 OK

**Response Format:**
```json
{
  "message": "Item removed from cart",
  "cart": [
    // Remaining items...
  ]
}
```

**Error Response (404):**
```json
{
  "message": "Item not found in cart"
}
```

### `DELETE /api/cart`

Clears the entire shopping cart.

**Request:**
```
DELETE http://localhost:3000/api/cart
```

**Response Status:** 200 OK

**Response Format:**
```json
{
  "message": "Cart cleared",
  "cart": []
}
```

## WebSocket Implementation

The WebSocket implementation enables real-time synchronization across all micro-frontends, ensuring that changes made in one micro-frontend are instantly reflected in others without requiring polling or page refreshes.

### Architecture

The WebSocket implementation follows a publisher-subscriber pattern:

1. **Server (Publisher)**: Broadcasts cart updates to all connected clients
2. **Clients (Subscribers)**: Listen for updates and react accordingly

```
┌─────────────────┐     Cart Updates     ┌─────────────────┐
│                 │───────────────────▶│                 │
│   Backend       │                     │   Shell         │
│   Server        │◀───────────────────│   Application    │
│   (WebSocket)   │   Connect/Subscribe │                 │
└─────────────────┘                     └─────────────────┘
          ▲                                     ▲
          │                                     │
          │                                     │
          │                                     │
          │                                     │
          │                                     │
          │                                     │
          ▼                                     ▼
┌─────────────────┐                     ┌─────────────────┐
│                 │                     │                 │
│   Shopping Cart │                     │   Product       │
│   Micro-Frontend│◀───────────────────▶│   Listing       │
│                 │   Real-time updates │   Micro-Frontend│
└─────────────────┘   synchronized      └─────────────────┘
```

### Technical Implementation

#### Server-Side

The WebSocket server is implemented using the `ws` library and is attached to the same HTTP server that hosts the REST API:

```javascript
const { WebSocketServer } = require('ws');
const http = require('http');
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
```

#### Connection Handling

When a client connects to the WebSocket server:

1. The connection is established
2. The current cart state is immediately sent to the new client
3. Event listeners are set up for further communication

```javascript
wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  
  // Send current cart to new connections
  ws.send(JSON.stringify({ type: 'CART_UPDATE', data: cart }));
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received WebSocket message:', data);
      
      // Handle different message types
      if (data.type === 'CART_REQUEST') {
        ws.send(JSON.stringify({ type: 'CART_UPDATE', data: cart }));
      }
    } catch (err) {
      console.error('Error processing WebSocket message:', err);
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
  });
});
```

#### Broadcasting Updates

The server broadcasts cart updates to all connected clients through the `broadcastCartUpdate` function:

```javascript
const broadcastCartUpdate = () => {
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify({ type: 'CART_UPDATE', data: cart }));
    }
  });
};
```

This function is called after every cart modification operation:
- Adding items to cart
- Updating item quantities
- Removing items from cart
- Clearing the entire cart

### Client-Side Implementation

Micro-frontends connect to the WebSocket server and listen for updates:

```javascript
// Inside the ShoppingCart component
const wsRef = ref(null);

onMounted(() => {
  // Establish WebSocket connection
  wsRef.value = new WebSocket('ws://localhost:3000');
  
  // Set up message handler
  wsRef.value.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'CART_UPDATE') {
      // Update local cart state with the received data
      cart.value = data.data;
    }
  };
  
  // Handle connection open
  wsRef.value.onopen = () => {
    console.log('WebSocket connection established');
    // Request initial cart data
    wsRef.value.send(JSON.stringify({ type: 'CART_REQUEST' }));
  };
  
  // Handle errors
  wsRef.value.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
});

// Clean up on component unmount
onBeforeUnmount(() => {
  if (wsRef.value && wsRef.value.readyState === WebSocket.OPEN) {
    wsRef.value.close();
  }
});
```

### Message Format

All WebSocket messages follow a standardized JSON format:

```javascript
{
  "type": "MESSAGE_TYPE",  // e.g., "CART_UPDATE", "CART_REQUEST"
  "data": {                // Payload, varies by message type
    // For CART_UPDATE, this contains the entire cart array
  }
}
```

## Benefits for Micro-Frontend Architecture

### 1. Real-Time Synchronization

The WebSocket implementation provides real-time synchronization between independently deployed micro-frontends, maintaining a consistent user experience despite the distributed nature of the application.

### 2. Loose Coupling

Micro-frontends remain decoupled from each other, communicating indirectly through the WebSocket server rather than direct dependencies.

### 3. Improved Performance

By pushing updates to clients rather than relying on polling, the WebSocket implementation:
- Reduces network overhead
- Minimizes latency in displaying updated cart information
- Eliminates the need for periodic API calls

### 4. Enhanced User Experience

Users see cart updates immediately across all parts of the application, creating a seamless shopping experience even though they're interacting with separate micro-frontends.

### 5. Scalability

The WebSocket architecture facilitates:
- Easy addition of new micro-frontends that can tap into the same real-time update system
- Potential for segregating WebSocket connections by topic/domain for larger applications
- Future expansion to other real-time features like inventory updates or user notifications

## Integration with RESTful API

The WebSocket server complements the RESTful API rather than replacing it:

1. **RESTful API**: Handles CRUD operations and serves as the source of truth
2. **WebSocket Server**: Distributes updates after successful API operations

This hybrid approach maintains the benefits of both communication paradigms:
- RESTful API for standard operations with well-defined semantics
- WebSockets for pushing real-time updates to all connected clients

Example of REST and WebSocket coordination in the cart update endpoint:

```javascript
// Update cart item
app.put('/api/cart/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { quantity } = req.body;
  
  if (quantity === undefined) {
    return res.status(400).json({ error: 'Quantity is required' });
  }
  
  const itemIndex = cart.findIndex(item => item.id === id);
  
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Cart item not found' });
  }
  
  if (quantity <= 0) {
    // Remove item if quantity is 0 or less
    cart.splice(itemIndex, 1);
  } else {
    // Update quantity
    cart[itemIndex].quantity = quantity;
  }
  
  // Broadcast the cart update to all connected clients via WebSocket
  broadcastCartUpdate();
  
  // Respond to the original REST request
  res.json({ message: 'Cart updated', cart });
});
```

## Testing WebSocket Functionality

You can test the WebSocket functionality using browser developer tools or specialized tools:

1. Using the Browser Console:
```javascript
// Connect to WebSocket server
const ws = new WebSocket('ws://localhost:3000');

// Set up event listeners
ws.onopen = () => console.log('Connected');
ws.onmessage = (event) => console.log('Received:', JSON.parse(event.data));

// Request cart data
ws.send(JSON.stringify({ type: 'CART_REQUEST' }));
```

2. Using WebSocket testing tools like Postman or websocat.

## Security Considerations

In a production environment, the WebSocket implementation should include:

1. **Authentication**: Verifying user identity before establishing WebSocket connections
2. **Authorization**: Ensuring users only receive updates for their own cart
3. **Message validation**: Preventing malicious or malformed messages
4. **Rate limiting**: Protecting against denial-of-service attacks
5. **HTTPS/WSS**: Using secure WebSocket connections

## Conclusion

The WebSocket implementation significantly enhances the micro-frontend architecture by providing real-time synchronization capabilities. It maintains the loose coupling principle while ensuring a consistent user experience across all components of the application.

The hybrid approach of RESTful API + WebSocket communication represents a modern, efficient architecture for web applications requiring real-time updates and collaboration features.

## Key Files

- `server.js`: Express server setup, routes, and in-memory data
- `package.json`: Project configuration with dependencies and scripts

## Running the Service

```bash
# Install dependencies
npm install

# Start the server
npm start
```

The service will be available at http://localhost:3000.

## Testing the API

You can test the API using curl, Postman, or a web browser:

```bash
# Get all products
curl http://localhost:3000/api/products

# Get a specific product
curl http://localhost:3000/api/products/1
```

## Debugging

To run the server in debug mode:

```bash
# Using Node.js built-in debugger
node --inspect server.js
```

## Future Enhancements

- Implement SQLite database for persistent storage
- Add authentication/authorization
- Add more endpoints for a full e-commerce experience:
  - User management
  - Shopping cart functionality
  - Order processing
  - Payment integration
- Add input validation with a library like Joi or express-validator
- Implement comprehensive error handling
- Add logging with Winston or Morgan
- Set up automated testing with Jest or Mocha 