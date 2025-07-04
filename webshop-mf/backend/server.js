const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { WebSocketServer } = require('ws');
const http = require('http');
const { initializeDatabase, products, cart, users } = require('./database');

const app = express();
const port = 3000;

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket server
const wss = new WebSocketServer({ server });

// Middleware
app.use(cors({
  origin: ['http://localhost:8082', 'http://localhost:8083', 'http://localhost:8084', 'http://localhost:8085'],
  credentials: true
}));
app.use(bodyParser.json());

// Session configuration
app.use(session({
  secret: 'webshop-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize database
initializeDatabase()
  .then(() => {
    console.log('Database initialized successfully');
  })
  .catch(err => {
    console.error('Database initialization error:', err);
    process.exit(1);
  });

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  } else {
    return res.status(401).json({ error: 'Authentication required' });
  }
};

// Helper function to get current user from session
const getCurrentUser = async (req) => {
  if (req.session && req.session.userId) {
    try {
      return await users.getUserById(req.session.userId);
    } catch (err) {
      console.error('Error fetching current user:', err);
      return null;
    }
  }
  return null;
};

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
const broadcastCartUpdate = (userId = null) => {
  cart.getCart(userId)
    .then(cartData => {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocketServer.OPEN) {
          client.send(JSON.stringify({ 
            type: 'CART_UPDATE', 
            data: cartData,
            userId: userId 
          }));
        }
      });
    })
    .catch(err => {
      console.error('Error broadcasting cart update:', err);
    });
};

// API Routes for authentication
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    // Check if user already exists
    const existingUserByEmail = await users.getUserByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const existingUserByUsername = await users.getUserByUsername(username);
    if (existingUserByUsername) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const newUser = await users.createUser(username, email, passwordHash);
    
    // Create session
    req.session.userId = newUser.id;
    req.session.username = newUser.username;
    
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: newUser.id, username: newUser.username, email: newUser.email }
    });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user
    const user = await users.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Create session
    req.session.userId = user.id;
    req.session.username = user.username;
    
    res.json({
      message: 'Login successful',
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (err) {
    console.error('Error logging in user:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ message: 'Logout successful' });
  });
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Error fetching current user:', err);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

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
    const userId = req.session?.userId || null;
    const cartItems = await cart.getCart(userId);
    res.json(cartItems);
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

app.post('/api/cart', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.session?.userId || null;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    await cart.addToCart(productId, quantity, userId);
    const updatedCart = await cart.getCart(userId);
    
    // Broadcast cart update to all WebSocket clients
    broadcastCartUpdate(userId);
    
    res.status(201).json(updatedCart);
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

app.put('/api/cart/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    const userId = req.session?.userId || null;
    
    if (quantity === undefined) {
      return res.status(400).json({ error: 'Quantity is required' });
    }
    
    await cart.updateCartItem(req.params.id, quantity);
    const updatedCart = await cart.getCart(userId);
    
    // Broadcast cart update
    broadcastCartUpdate(userId);
    
    res.json(updatedCart);
  } catch (err) {
    console.error(`Error updating cart item ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

app.delete('/api/cart/:id', async (req, res) => {
  try {
    const userId = req.session?.userId || null;
    
    await cart.removeFromCart(req.params.id);
    const updatedCart = await cart.getCart(userId);
    
    // Broadcast cart update
    broadcastCartUpdate(userId);
    
    res.json(updatedCart);
  } catch (err) {
    console.error(`Error removing cart item ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

app.delete('/api/cart', async (req, res) => {
  try {
    const userId = req.session?.userId || null;
    
    await cart.clearCart(userId);
    
    // Broadcast empty cart
    broadcastCartUpdate(userId);
    
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