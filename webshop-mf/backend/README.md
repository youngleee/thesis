# Backend Service

This is the backend service for the Micro-Frontend Webshop project. It provides the API endpoints for the micro-frontends to consume.

## Overview

The backend service is responsible for:
- Providing product data through REST API endpoints
- Handling cross-origin requests from micro-frontends
- (Future) Persisting data to a database

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

## Integration with Micro-Frontends

The backend service provides the data layer for the micro-frontend architecture:

1. **Product Listing Micro-Frontend**: Fetches the list of products via the `/api/products` endpoint and adds products to the cart
2. **Shopping Cart Micro-Frontend**: Manages the cart via the cart endpoints
3. **Shell Application**: Coordinates between micro-frontends and displays cart count

The cart implementation demonstrates a real-time update pattern using:
- REST API for data persistence
- Custom browser events for cross-micro-frontend communication
- Optimistic UI updates for a responsive user experience

## Performance Considerations

- **Response Time**: The current in-memory implementation is extremely fast
- **Caching**: No caching is implemented yet, but would be important for production
- **Payload Size**: Product responses include minimal necessary data to keep payloads small

## Security Considerations

For a production-ready implementation, consider adding:

1. **Rate Limiting**: Prevent abuse with request rate limits
2. **Input Validation**: Validate all incoming request parameters
3. **CORS Restrictions**: Limit allowed origins
4. **Authentication/Authorization**: Add user authentication for protected resources
5. **HTTPS**: Secure data transmission

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