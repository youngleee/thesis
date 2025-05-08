const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

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

// Mock product data
const products = [
  {
    id: 1,
    name: 'Ergonomic Desk Chair',
    price: 199.99,
    description: 'A comfortable desk chair with lumbar support for long work sessions.',
    image: 'https://placehold.co/300x200?text=Chair'
  },
  {
    id: 2,
    name: 'Mechanical Keyboard',
    price: 149.99,
    description: 'Tactile mechanical keyboard with RGB lighting and programmable keys.',
    image: 'https://placehold.co/300x200?text=Keyboard'
  },
  {
    id: 3,
    name: 'Ultrawide Monitor',
    price: 349.99,
    description: '34-inch curved ultrawide monitor perfect for productivity and gaming.',
    image: 'https://placehold.co/300x200?text=Monitor'
  },
  {
    id: 4,
    name: 'Wireless Mouse',
    price: 59.99,
    description: 'Ergonomic wireless mouse with adjustable DPI and long battery life.',
    image: 'https://placehold.co/300x200?text=Mouse'
  },
  {
    id: 5,
    name: 'Laptop Stand',
    price: 39.99,
    description: 'Adjustable aluminum laptop stand to improve posture and cooling.',
    image: 'https://placehold.co/300x200?text=LaptopStand'
  },
  {
    id: 6,
    name: 'Noise-Cancelling Headphones',
    price: 249.99,
    description: 'Premium headphones with active noise cancellation for focused work.',
    image: 'https://placehold.co/300x200?text=Headphones'
  }
];

// In-memory cart storage (in a real app, this would be in a database)
// For simplicity, we'll just use a single cart
let cart = [];

// Product Routes
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);
  
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  res.json(product);
});

// Cart Routes
app.get('/api/cart', (req, res) => {
  console.log('GET /api/cart called');
  try {
    // Return cart items with product details
    const cartWithDetails = cart.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return { error: `Product with ID ${item.productId} not found`, quantity: item.quantity };
      }
      return {
        ...product,
        id: product.id,
        quantity: item.quantity
      };
    });
    
    res.json(cartWithDetails);
  } catch (error) {
    console.error('Error in GET /api/cart:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

app.post('/api/cart', (req, res) => {
  console.log('POST /api/cart called with body:', req.body);
  try {
    const { productId, quantity = 1 } = req.body;
    
    // Validate productId and quantity
    if (!productId) {
      console.log('Error: Product ID is required');
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    // Convert productId to number if it's a string
    const productIdNum = parseInt(productId);
    
    const product = products.find(p => p.id === productIdNum);
    if (!product) {
      console.log(`Error: Product with ID ${productIdNum} not found`);
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if product is already in cart
    const existingItem = cart.find(item => item.productId === productIdNum);
    
    if (existingItem) {
      // Update quantity if product is already in cart
      existingItem.quantity += quantity;
      console.log(`Updated quantity for product ${productIdNum}, new quantity: ${existingItem.quantity}`);
    } else {
      // Add new item to cart
      cart.push({ productId: productIdNum, quantity });
      console.log(`Added product ${productIdNum} to cart with quantity ${quantity}`);
    }
    
    res.status(201).json({ message: 'Product added to cart', cart });
  } catch (error) {
    console.error('Error in POST /api/cart:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

app.put('/api/cart/:productId', (req, res) => {
  console.log(`PUT /api/cart/${req.params.productId} called with body:`, req.body);
  try {
    const productId = parseInt(req.params.productId);
    const { quantity } = req.body;
    
    if (quantity === undefined || quantity < 1) {
      console.log('Error: Valid quantity is required');
      return res.status(400).json({ message: 'Valid quantity is required' });
    }
    
    const itemIndex = cart.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) {
      console.log(`Error: Item with ID ${productId} not found in cart`);
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    // Update quantity
    cart[itemIndex].quantity = quantity;
    console.log(`Updated quantity for product ${productId} to ${quantity}`);
    
    res.json({ message: 'Cart updated', cart });
  } catch (error) {
    console.error(`Error in PUT /api/cart/${req.params.productId}:`, error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

app.delete('/api/cart/:productId', (req, res) => {
  console.log(`DELETE /api/cart/${req.params.productId} called`);
  try {
    const productId = parseInt(req.params.productId);
    
    const initialLength = cart.length;
    cart = cart.filter(item => item.productId !== productId);
    
    if (cart.length === initialLength) {
      console.log(`Error: Item with ID ${productId} not found in cart`);
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    console.log(`Removed product ${productId} from cart`);
    res.json({ message: 'Item removed from cart', cart });
  } catch (error) {
    console.error(`Error in DELETE /api/cart/${req.params.productId}:`, error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

app.delete('/api/cart', (req, res) => {
  console.log('DELETE /api/cart called (clear entire cart)');
  try {
    // Clear the entire cart
    cart = [];
    console.log('Cart cleared');
    res.json({ message: 'Cart cleared', cart });
  } catch (error) {
    console.error('Error in DELETE /api/cart:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log('Available API routes:');
  console.log('- GET /api/products');
  console.log('- GET /api/products/:id');
  console.log('- GET /api/cart');
  console.log('- POST /api/cart');
  console.log('- PUT /api/cart/:productId');
  console.log('- DELETE /api/cart/:productId');
  console.log('- DELETE /api/cart');
  console.log('- GET /api/debug');
  console.log('- GET /api/debug/cart');
}); 