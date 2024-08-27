import express from 'express';
import sqlite3 from 'sqlite3';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import open from 'open'; // Use import instead of require
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));

// Initialize SQLite database
const db = new sqlite3.Database('technicians.db', (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS technicians (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            image TEXT,
            cashapp_qr TEXT,
            venmo_qr TEXT,
            zelle_qr TEXT
        )`);
    }
});

// Helper function to remove file
function removeFile(filePath) {
    if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

// Fetch all technicians
app.get('/technicians', (req, res) => {
    db.all('SELECT * FROM technicians', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ technicians: rows });
    });
});

// Add a new technician
app.post('/technicians', upload.fields([
    { name: 'technicianImage' },
    { name: 'cashappQR' },
    { name: 'venmoQR' },
    { name: 'zelleQR' }
]), (req, res) => {
    const { name } = req.body;
    const technicianImage = req.files['technicianImage'] ? req.files['technicianImage'][0].path : null;
    const cashappQR = req.files['cashappQR'] ? req.files['cashappQR'][0].path : null;
    const venmoQR = req.files['venmoQR'] ? req.files['venmoQR'][0].path : null;
    const zelleQR = req.files['zelleQR'] ? req.files['zelleQR'][0].path : null;

    db.run('INSERT INTO technicians (name, image, cashapp_qr, venmo_qr, zelle_qr) VALUES (?, ?, ?, ?, ?)',
        [name, technicianImage, cashappQR, venmoQR, zelleQR],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ technicianId: this.lastID });
        });
});


// Update a technician
app.put('/technicians/:id', upload.fields([
    { name: 'technicianImage' },
    { name: 'cashappQR' },
    { name: 'venmoQR' },
    { name: 'zelleQR' }
]), (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    // First, get the current technician data
    db.get('SELECT * FROM technicians WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Technician not found' });
            return;
        }

        let technicianImage = row.image;
        let cashappQR = row.cashapp_qr;
        let venmoQR = row.venmo_qr;
        let zelleQR = row.zelle_qr;

        // Handle image updates or removals
        if (req.body.technicianImage === 'remove') {
            removeFile(technicianImage);
            technicianImage = null;
        } else if (req.files['technicianImage']) {
            removeFile(technicianImage);
            technicianImage = req.files['technicianImage'][0].path;
        }

        if (req.body.cashappQR === 'remove') {
            removeFile(cashappQR);
            cashappQR = null;
        } else if (req.files['cashappQR']) {
            removeFile(cashappQR);
            cashappQR = req.files['cashappQR'][0].path;
        }

        if (req.body.venmoQR === 'remove') {
            removeFile(venmoQR);
            venmoQR = null;
        } else if (req.files['venmoQR']) {
            removeFile(venmoQR);
            venmoQR = req.files['venmoQR'][0].path;
        }

        if (req.body.zelleQR === 'remove') {
            removeFile(zelleQR);
            zelleQR = null;
        } else if (req.files['zelleQR']) {
            removeFile(zelleQR);
            zelleQR = req.files['zelleQR'][0].path;
        }

        // Update the database
        db.run('UPDATE technicians SET name = ?, image = ?, cashapp_qr = ?, venmo_qr = ?, zelle_qr = ? WHERE id = ?',
            [name, technicianImage, cashappQR, venmoQR, zelleQR, id],
            function (err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({ message: 'Technician updated successfully', rowsAffected: this.changes });
            });
    });
});

// Delete a technician
app.delete('/technicians/:id', (req, res) => {
    const { id } = req.params;
    
    // First, get the technician data to remove associated files
    db.get('SELECT * FROM technicians WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (row) {
            removeFile(row.image);
            removeFile(row.cashapp_qr);
            removeFile(row.venmo_qr);
            removeFile(row.zelle_qr);
        }

        // Now delete the technician from the database
        db.run('DELETE FROM technicians WHERE id = ?', id, function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: 'Technician deleted successfully', rowsAffected: this.changes });
        });
    });
});

// Get a single technician by ID
app.get('/technicians/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM technicians WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Technician not found' });
            return;
        }
        res.json({ technician: row });
    });
});

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tip-page.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    open(`http://localhost:${PORT}`, { app: { name: 'chrome', arguments: ['--start-fullscreen'] } }); // Opens Chrome in fullscreen
});