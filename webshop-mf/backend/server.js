const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { WebSocketServer } = require('ws');
const http = require('http');
const { initializeDatabase, products, cart } = require('./database');

const app = express();
const port = 3000;

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket server
const wss = new WebSocketServer({ server });

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize database
initializeDatabase()
  .then(() => {
    console.log('Database initialized successfully');
  })
  .catch(err => {
    console.error('Database initialization error:', err);
    process.exit(1);
  });

// Debug route to check if server is working
app.get('/api/debug', (req, res) => {
  res.json({ message: 'Server is running correctly', routes: 'Debug route accessible' });
});

// Debug route for cart
app.get('/api/debug/cart', (req, res) => {
  res.json({ 
    message: 'Cart debug route', 
    cartExists: typeof cart !== 'undefined',
    cartLength: typeof cart !== 'undefined' ? cart.length : 'undefined',
    cartRoutes: 'GET, POST, PUT, DELETE endpoints should be defined'
  });
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  
  // Send current cart to new connections
  cart.getCart()
    .then(cartData => {
      ws.send(JSON.stringify({ type: 'CART_UPDATE', data: cartData }));
    })
    .catch(err => {
      console.error('Error sending cart data to new connection:', err);
    });
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received WebSocket message:', data);
      
      // Handle different message types
      if (data.type === 'CART_REQUEST') {
        cart.getCart()
          .then(cartData => {
            ws.send(JSON.stringify({ type: 'CART_UPDATE', data: cartData }));
          })
          .catch(err => {
            console.error('Error fetching cart data:', err);
          });
      }
    } catch (err) {
      console.error('Error processing WebSocket message:', err);
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
  });
});

// Helper function to broadcast cart updates to all WebSocket clients
const broadcastCartUpdate = () => {
  cart.getCart()
    .then(cartData => {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocketServer.OPEN) {
          client.send(JSON.stringify({ 
            type: 'CART_UPDATE', 
            data: cartData 
          }));
        }
      });
    })
    .catch(err => {
      console.error('Error broadcasting cart update:', err);
    });
};

// API Routes for products
app.get('/api/products', async (req, res) => {
  try {
    const allProducts = await products.getAllProducts();
    res.json(allProducts);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await products.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error(`Error fetching product ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// API Routes for cart
app.get('/api/cart', async (req, res) => {
  try {
    const cartItems = await cart.getCart();
    res.json(cartItems);
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

app.post('/api/cart', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    await cart.addToCart(productId, quantity);
    const updatedCart = await cart.getCart();
    
    // Broadcast cart update to all WebSocket clients
    broadcastCartUpdate();
    
    res.status(201).json(updatedCart);
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

app.put('/api/cart/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    
    if (quantity === undefined) {
      return res.status(400).json({ error: 'Quantity is required' });
    }
    
    await cart.updateCartItem(req.params.id, quantity);
    const updatedCart = await cart.getCart();
    
    // Broadcast cart update
    broadcastCartUpdate();
    
    res.json(updatedCart);
  } catch (err) {
    console.error(`Error updating cart item ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

app.delete('/api/cart/:id', async (req, res) => {
  try {
    await cart.removeFromCart(req.params.id);
    const updatedCart = await cart.getCart();
    
    // Broadcast cart update
    broadcastCartUpdate();
    
    res.json(updatedCart);
  } catch (err) {
    console.error(`Error removing cart item ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

app.delete('/api/cart', async (req, res) => {
  try {
    await cart.clearCart();
    
    // Broadcast empty cart
    broadcastCartUpdate();
    
    res.json({ message: 'Cart cleared successfully' });
  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// Inventory management route
app.put('/api/products/:id/stock', async (req, res) => {
  try {
    const { inStock } = req.body;
    
    if (inStock === undefined) {
      return res.status(400).json({ error: 'In-stock status is required' });
    }
    
    const result = await products.updateProductStock(req.params.id, inStock);
    
    // Broadcast inventory update to all clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocketServer.OPEN) {
        client.send(JSON.stringify({ 
          type: 'INVENTORY_UPDATE', 
          data: { productId: Number(req.params.id), inStock }
        }));
      }
    });
    
    res.json(result);
  } catch (err) {
    console.error(`Error updating product stock ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to update product stock' });
  }
});

// Start the server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`WebSocket server running at ws://localhost:${port}`);
}); 