const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { WebSocketServer } = require('ws');
const http = require('http');

const app = express();
const port = 3000;

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket server
const wss = new WebSocketServer({ server });

// Middleware
app.use(cors());
app.use(bodyParser.json());

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

// In-memory storage (in a real app, this would be a database)
let products = [
  {
    id: 1,
    name: 'Premium Wireless Headphones',
    price: 299.99,
    description: 'High-quality wireless headphones with noise cancellation and premium sound quality.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D',
    details: {
      brand: 'SoundMaster',
      model: 'WH-5000XM',
      color: 'Matte Black',
      connectivity: 'Bluetooth 5.2',
      batteryLife: '30 hours',
      weight: '250g',
      features: [
        'Active Noise Cancellation',
        'High-Resolution Audio',
        'Touch Controls',
        'Voice Assistant Support',
        'Foldable Design'
      ]
    }
  },
  {
    id: 2,
    name: 'Ultra HD Smart TV',
    price: 1299.99,
    description: 'Premium 65-inch 4K Ultra HD Smart TV with advanced picture quality and smart features.',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dHZ8ZW58MHx8MHx8fDA%3D',
    details: {
      brand: 'VisionTech',
      model: 'VT-65QLED',
      displaySize: '65 inches',
      resolution: '4K Ultra HD (3840 x 2160)',
      refreshRate: '120Hz',
      connectivity: [
        'HDMI x 4',
        'USB x 3',
        'Ethernet',
        'Wi-Fi',
        'Bluetooth'
      ],
      features: [
        'Quantum Dot Technology',
        'HDR10+',
        'Smart Voice Control',
        'AI Picture Enhancement',
        'Gaming Mode'
      ]
    }
  },
  {
    id: 3,
    name: 'Professional DSLR Camera',
    price: 1499.99,
    description: 'Professional-grade DSLR camera with high-resolution sensor and advanced photography features.',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FtZXJhfGVufDB8fDB8fHww',
    details: {
      brand: 'CaptureElite',
      model: 'CE-7D Mark IV',
      sensorType: 'Full-frame CMOS',
      megapixels: '30.4 MP',
      isoRange: '100-32000 (expandable to 50-102400)',
      shutterSpeed: '1/8000 to 30 sec',
      videoResolution: '4K 30fps, 1080p 120fps',
      weight: '800g (body only)',
      features: [
        'Dual Pixel Autofocus',
        'Weather-sealed body',
        '5-axis image stabilization',
        'Built-in Wi-Fi and GPS',
        '3.2" vari-angle touchscreen'
      ]
    }
  },
  {
    id: 4,
    name: 'Premium Coffee Maker',
    price: 199.99,
    description: 'Automatic coffee maker with multiple brewing modes and temperature control for perfect coffee.',
    image: 'https://images.unsplash.com/photo-1622623990683-05e3ba3aa81a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGNvZmZlZSUyMG1ha2VyfGVufDB8fDB8fHww',
    details: {
      brand: 'BrewMaster',
      model: 'Pro 5000',
      capacity: '12 cups',
      material: 'Stainless Steel',
      dimensions: '12 x 8 x 15 inches',
      weight: '7 lbs',
      features: [
        'Programmable brewing',
        'Temperature control',
        'Multiple brewing strengths',
        'Built-in grinder',
        'Self-cleaning function'
      ]
    }
  },
  {
    id: 5,
    name: 'Ergonomic Office Chair',
    price: 349.99,
    description: 'Highly adjustable ergonomic office chair with lumbar support and breathable mesh back.',
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584dd43?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG9mZmljZSUyMGNoYWlyfGVufDB8fDB8fHww',
    details: {
      brand: 'ErgoComfort',
      model: 'EC-1000',
      color: 'Black/Gray',
      material: 'Mesh Back, Fabric Seat',
      adjustability: [
        'Height Adjustment',
        '4D Armrests',
        'Tilt Tension',
        'Lumbar Support',
        'Headrest'
      ],
      weightCapacity: '300 lbs',
      assembly: 'Required (tools included)',
      warranty: '5 years'
    }
  },
  {
    id: 6,
    name: 'Smart Fitness Watch',
    price: 249.99,
    description: 'Advanced fitness tracking watch with heart rate monitor, GPS, and smartphone notifications.',
    image: 'https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c21hcnQlMjB3YXRjaHxlbnwwfHwwfHx8MA%3D%3D',
    details: {
      brand: 'FitTech',
      model: 'Pulse Pro',
      display: '1.4" AMOLED Touchscreen',
      batteryLife: 'Up to 7 days',
      waterResistance: '5 ATM (swim-proof)',
      sensors: [
        'Optical heart rate',
        'GPS',
        'Accelerometer',
        'Gyroscope',
        'Barometric altimeter'
      ],
      features: [
        'Heart rate monitoring',
        'Sleep tracking',
        'Workout detection',
        'Music control',
        'Smartphone notifications'
      ],
      compatibility: 'iOS and Android'
    }
  },
  {
    id: 7,
    name: 'Air Purifier',
    price: 129.99,
    description: 'HEPA air purifier that removes allergens, dust, and odors from rooms up to 500 sq ft.',
    image: 'https://images.unsplash.com/photo-1585444644618-a2ed95cbe297?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8YWlyJTIwcHVyaWZpZXJ8ZW58MHx8MHx8fDA%3D',
    details: {
      brand: 'PureAir',
      model: 'PA-500',
      roomCoverage: '500 sq ft',
      filterType: 'True HEPA + Activated Carbon',
      noiseLevel: '25-52 dB',
      dimensions: '14 x 8 x 22 inches',
      weight: '11 lbs',
      features: [
        'Air quality indicator',
        'Auto mode',
        'Sleep mode',
        'Timer function',
        'Filter replacement indicator'
      ],
      filterLifespan: '6-12 months'
    }
  },
  {
    id: 8,
    name: 'Portable Bluetooth Speaker',
    price: 89.99,
    description: 'Waterproof portable Bluetooth speaker with 20 hours of battery life and rich, immersive sound.',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Ymx1ZXRvb3RoJTIwc3BlYWtlcnxlbnwwfHwwfHx8MA%3D%3D',
    details: {
      brand: 'SoundWave',
      model: 'Blast Mini',
      type: 'Portable Bluetooth Speaker',
      batteryLife: '20 hours',
      chargingTime: '2.5 hours',
      connectivity: 'Bluetooth 5.0, AUX',
      waterproofRating: 'IPX7',
      dimensions: '7 x 3 x 3 inches',
      weight: '1.2 lbs',
      features: [
        '360° sound',
        'Microphone for calls',
        'Voice assistant support',
        'Dustproof',
        'Float in water'
      ]
    }
  }
];

let cart = [];

// WebSocket connection handling
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

// Helper function to broadcast to all connected clients
const broadcastCartUpdate = () => {
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify({ type: 'CART_UPDATE', data: cart }));
    }
  });
};

// API Routes
// Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Get a specific product
app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);
  
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Get cart
app.get('/api/cart', (req, res) => {
  res.json(cart);
});

// Add item to cart
app.post('/api/cart', (req, res) => {
  const { productId, quantity } = req.body;
  
  if (!productId || !quantity) {
    return res.status(400).json({ error: 'Product ID and quantity are required' });
  }
  
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  // Check if product is already in cart
  const existingItem = cart.find(item => item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: Date.now(), // Generate a unique ID for the cart item
      productId,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity
    });
  }
  
  // Broadcast the cart update to all connected clients
  broadcastCartUpdate();
  
  res.status(201).json({ message: 'Item added to cart', cart });
});

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
  
  // Broadcast the cart update to all connected clients
  broadcastCartUpdate();
  
  res.json({ message: 'Cart updated', cart });
});

// Remove item from cart
app.delete('/api/cart/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const itemIndex = cart.findIndex(item => item.id === id);
  
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Cart item not found' });
  }
  
  cart.splice(itemIndex, 1);
  
  // Broadcast the cart update to all connected clients
  broadcastCartUpdate();
  
  res.json({ message: 'Item removed from cart', cart });
});

// Clear cart
app.delete('/api/cart', (req, res) => {
  cart = [];
  
  // Broadcast the cart update to all connected clients
  broadcastCartUpdate();
  
  res.json({ message: 'Cart cleared', cart });
});

// Start the server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`WebSocket server running at ws://localhost:${port}`);
}); 