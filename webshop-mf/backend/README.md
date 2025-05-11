# WebShop Backend with SQLite Integration

This backend server provides the RESTful API and WebSocket services for the WebShop micro-frontend application. It uses SQLite for data persistence, making it ideal for thesis demonstration purposes.

## Features

- **RESTful API** for products and shopping cart operations
- **WebSocket server** for real-time updates across micro-frontends
- **SQLite database** for persistent data storage
- **Publisher-subscriber** pattern for broadcasting updates
- **Error handling** with appropriate HTTP status codes

## Database Schema

The SQLite database consists of two main tables:

### Products Table

```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  image TEXT,
  in_stock INTEGER DEFAULT 1,
  details TEXT
)
```

### Cart Items Table

```sql
CREATE TABLE cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products (id)
)
```

## API Endpoints

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a specific product by ID
- `PUT /api/products/:id/stock` - Update a product's stock status

### Cart

- `GET /api/cart` - Get the current cart contents
- `POST /api/cart` - Add an item to the cart
- `PUT /api/cart/:id` - Update a cart item's quantity
- `DELETE /api/cart/:id` - Remove a specific item from the cart
- `DELETE /api/cart` - Clear the entire cart

## WebSocket Protocol

The WebSocket server implements a simple protocol for real-time updates:

### Message Types

#### Server to Client

- `CART_UPDATE` - Sent when the cart contents change
- `INVENTORY_UPDATE` - Sent when a product's inventory status changes

Example:
```json
{
  "type": "CART_UPDATE",
  "data": [
    {
      "id": 1,
      "product_id": 3,
      "quantity": 2,
      "name": "Premium Headphones",
      "price": 199.99,
      "image": "https://via.placeholder.com/300?text=Headphones"
    }
  ]
}
```

#### Client to Server

- `CART_REQUEST` - Request for the current cart contents

Example:
```json
{
  "type": "CART_REQUEST"
}
```

## Why SQLite for Thesis Project

SQLite provides several advantages for an academic thesis demonstration:

1. **Self-contained** - The entire database is stored in a single file
2. **Zero configuration** - No complex database server setup required
3. **Portability** - Easy to include in submissions and demonstrations
4. **Visual inspection** - Database file can be viewed with DB Browser for SQLite
5. **Predictable state** - Reset to a known state by replacing the database file

## File Structure

- `server.js` - Main Express and WebSocket server implementation
- `database.js` - SQLite database connection and methods
- `data/` - Directory containing the SQLite database file
- `package.json` - Dependencies and scripts

## Running the Backend

```bash
# Install dependencies
npm install

# Start the development server with nodemon
npm run dev

# Start the production server
npm start
```

The server runs on http://localhost:3000 by default.

## Implementation Notes

### Database Initialization

The database is automatically initialized when the server starts. If the database file doesn't exist, it will be created, and the tables will be set up. Sample product data is inserted if the products table is empty.

### WebSocket Broadcasting

The server implements a publisher-subscriber pattern for real-time updates. When a change occurs in the cart or product inventory, the update is broadcast to all connected WebSocket clients. This enables instant synchronization across all micro-frontends without the need for polling.

### Error Handling

The server includes comprehensive error handling to ensure graceful failure recovery. All database operations are wrapped in try-catch blocks, and appropriate HTTP status codes are returned for different error conditions. 