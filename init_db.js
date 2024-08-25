const sqlite3 = require('sqlite3').verbose();

// Connect to SQLite database (or create it if it doesn't exist)
const db = new sqlite3.Database('technicians.db', (err) => {
  if (err) {
    console.error('Error opening database ' + err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create a table for technicians if it doesn't already exist
    db.run(`CREATE TABLE IF NOT EXISTS technicians (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            image TEXT,
            cashapp_qr TEXT,
            venmo_qr TEXT,
            zelle_qr TEXT
        )`, (err) => {
      if (err) {
        console.error('Error creating table ' + err.message);
      } else {
        console.log('Technicians table created or already exists.');
      }
    });
  }
});

// Close the database connection
db.close((err) => {
  if (err) {
    console.error('Error closing the database ' + err.message);
  } else {
    console.log('Database connection closed.');
  }
});
