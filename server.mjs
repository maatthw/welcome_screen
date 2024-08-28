import express from 'express';
import sqlite3 from 'sqlite3';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import open from 'open'; 
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const correctAccessCode = '1234';

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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
    const technicianImage = req.files['technicianImage'] ? `uploads/${req.files['technicianImage'][0].filename}` : null;
    const cashappQR = req.files['cashappQR'] ? `uploads/${req.files['cashappQR'][0].filename}` : null;
    const venmoQR = req.files['venmoQR'] ? `uploads/${req.files['venmoQR'][0].filename}` : null;
    const zelleQR = req.files['zelleQR'] ? `uploads/${req.files['zelleQR'][0].filename}` : null;

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

app.post('/verify-access-code', (req, res) => {
    const { code } = req.body;
    if (code === correctAccessCode) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
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
            if (technicianImage) removeFile(path.join(__dirname, technicianImage)); // Only remove if path is not null
            technicianImage = null;
        } else if (req.files['technicianImage']) {
            if (technicianImage) removeFile(path.join(__dirname, technicianImage)); // Only remove if path is not null
            technicianImage = `uploads/${req.files['technicianImage'][0].filename}`;
        }

        if (req.body.cashappQR === 'remove') {
            if (cashappQR) removeFile(path.join(__dirname, cashappQR));
            cashappQR = null;
        } else if (req.files['cashappQR']) {
            if (cashappQR) removeFile(path.join(__dirname, cashappQR));     
            cashappQR = `uploads/${req.files['cashappQR'][0].filename}`;
        }

        if (req.body.venmoQR === 'remove') {
            if (venmoQR) removeFile(path.join(__dirname, venmoQR));     
            venmoQR = null;
        } else if (req.files['venmoQR']) {
            if (venmoQR) removeFile(path.join(__dirname, venmoQR));
            venmoQR = `uploads/${req.files['venmoQR'][0].filename}`;
        }

        if (req.body.zelleQR === 'remove') {
            if (zelleQR) removeFile(path.join(__dirname, zelleQR)); 
            zelleQR = null;
        } else if (req.files['zelleQR']) {
            if (zelleQR) removeFile(path.join(__dirname, zelleQR)); 
            zelleQR = `uploads/${req.files['zelleQR'][0].filename}`;
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

    db.get('SELECT * FROM technicians WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (row) {
            if (row.image) removeFile(path.join(__dirname, row.image));
            if (row.cashapp_qr) removeFile(path.join(__dirname, row.cashapp_qr));
            if (row.venmo_qr) removeFile(path.join(__dirname, row.venmo_qr));
            if (row.zelle_qr) removeFile(path.join(__dirname, row.zelle_qr));
        }
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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tip-page.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    open(`http://localhost:${PORT}`, { app: { name: 'chrome', arguments: ['--start-fullscreen'] } });
});
