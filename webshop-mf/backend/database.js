const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Create database connection
const dbPath = path.join(dataDir, 'webshop.db');
const db = new sqlite3.Database(dbPath);

// Initialize database with tables
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Products table
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          price REAL NOT NULL,
          image TEXT,
          in_stock INTEGER DEFAULT 1,
          details TEXT
        )
      `);
      
      // Cart items table
      db.run(`
        CREATE TABLE IF NOT EXISTS cart_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products (id)
        )
      `);
      
      // Check if products table is empty
      db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        // If no products, insert some initial data
        if (row.count === 0) {
          const sampleProducts = [
            { 
              name: 'Premium Headphones', 
              description: 'Noise-cancelling wireless headphones with superior sound quality', 
              price: 199.99, 
              image: 'https://via.placeholder.com/300?text=Headphones',
              details: 'Features include 30-hour battery life, Bluetooth 5.0, and comfortable over-ear design.'
            },
            { 
              name: 'Smartphone', 
              description: 'Latest model with high-resolution camera and fast processor', 
              price: 699.99, 
              image: 'https://via.placeholder.com/300?text=Smartphone',
              details: '6.7-inch OLED display, 5G capable, 128GB storage, water resistant.'
            },
            { 
              name: 'Coffee Maker', 
              description: 'Programmable coffee machine with built-in grinder', 
              price: 149.99, 
              image: 'https://via.placeholder.com/300?text=CoffeeMaker',
              details: 'Customizable brew strength, timer function, keeps coffee hot for 2 hours.'
            },
            { 
              name: 'Fitness Tracker', 
              description: 'Monitors heart rate, steps, and sleep patterns', 
              price: 89.99, 
              image: 'https://via.placeholder.com/300?text=FitnessTracker',
              details: 'Waterproof up to 50m, 7-day battery life, smartphone notifications.'
            },
            { 
              name: 'Wireless Earbuds', 
              description: 'Truly wireless earbuds with charging case', 
              price: 129.99, 
              image: 'https://via.placeholder.com/300?text=Earbuds',
              details: 'Active noise cancellation, touch controls, 24-hour total battery life.'
            },
            { 
              name: 'Smart Watch', 
              description: 'Health monitoring and notifications on your wrist', 
              price: 249.99, 
              image: 'https://via.placeholder.com/300?text=SmartWatch',
              details: 'Heart rate monitor, GPS, 50+ workout modes, sapphire crystal display.'
            }
          ];
          
          const stmt = db.prepare('INSERT INTO products (name, description, price, image, details) VALUES (?, ?, ?, ?, ?)');
          sampleProducts.forEach(product => {
            stmt.run(product.name, product.description, product.price, product.image, product.details);
          });
          stmt.finalize();
        }
        
        resolve();
      });
    });
  });
};

// Helper methods for products
const productMethods = {
  getAllProducts() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM products', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  
  getProductById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  updateProductStock(id, inStock) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE products SET in_stock = ? WHERE id = ?', [inStock, id], function(err) {
        if (err) reject(err);
        else resolve({ id, in_stock: inStock, changes: this.changes });
      });
    });
  }
};

// Helper methods for cart
const cartMethods = {
  getCart() {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.image 
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  
  addToCart(productId, quantity) {
    return new Promise((resolve, reject) => {
      // First check if item already exists in cart
      db.get('SELECT id, quantity FROM cart_items WHERE product_id = ?', [productId], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (row) {
          // Update existing item
          const newQuantity = row.quantity + quantity;
          db.run('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQuantity, row.id], function(err) {
            if (err) reject(err);
            else resolve({ id: row.id, quantity: newQuantity });
          });
        } else {
          // Insert new item
          db.run('INSERT INTO cart_items (product_id, quantity) VALUES (?, ?)', [productId, quantity], function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, quantity });
          });
        }
      });
    });
  },
  
  updateCartItem(itemId, quantity) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, itemId], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  },
  
  removeFromCart(itemId) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM cart_items WHERE id = ?', [itemId], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  },
  
  clearCart() {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM cart_items', function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }
};

module.exports = {
  initializeDatabase,
  products: productMethods,
  cart: cartMethods,
  db // Expose db connection for advanced usage
}; 