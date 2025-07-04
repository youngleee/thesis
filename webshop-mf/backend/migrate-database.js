const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'data', 'webshop.db');
const db = new sqlite3.Database(dbPath);

// Migration function
const migrateDatabase = () => {
  return new Promise((resolve, reject) => {
    console.log('Starting database migration...');
    
    db.serialize(() => {
      // Check if user_id column exists in cart_items table
      db.get("PRAGMA table_info(cart_items)", (err, rows) => {
        if (err) {
          console.error('Error checking table schema:', err);
          reject(err);
          return;
        }
        
        // Get all column info
        db.all("PRAGMA table_info(cart_items)", (err, columns) => {
          if (err) {
            console.error('Error getting table info:', err);
            reject(err);
            return;
          }
          
          // Check if user_id column exists
          const hasUserIdColumn = columns.some(col => col.name === 'user_id');
          
          if (!hasUserIdColumn) {
            console.log('Adding user_id column to cart_items table...');
            
            // Add user_id column
            db.run(`
              ALTER TABLE cart_items 
              ADD COLUMN user_id INTEGER
            `, (err) => {
              if (err) {
                console.error('Error adding user_id column:', err);
                reject(err);
                return;
              }
              
              console.log('Successfully added user_id column to cart_items table');
              
              // Add foreign key constraint
              db.run(`
                CREATE INDEX IF NOT EXISTS idx_cart_items_user_id 
                ON cart_items(user_id)
              `, (err) => {
                if (err) {
                  console.error('Error creating index:', err);
                  reject(err);
                  return;
                }
                
                console.log('Successfully created index on user_id column');
                resolve();
              });
            });
          } else {
            console.log('user_id column already exists in cart_items table');
            resolve();
          }
        });
      });
    });
  });
};

// Run migration
migrateDatabase()
  .then(() => {
    console.log('Database migration completed successfully');
    db.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('Database migration failed:', err);
    db.close();
    process.exit(1);
  }); 