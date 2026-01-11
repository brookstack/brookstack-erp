import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';

const router = express.Router();

// GET all users (joining with roles)
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT u.id, u.full_name, u.email, u.status, r.name as role 
            FROM users u 
            JOIN roles r ON u.role_id = r.id
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Create new user (with proper hashing)
router.post('/', async (req, res) => {
    const { full_name, email, password, role_id } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (full_name, email, password_hash, role_id, status) VALUES (?, ?, ?, ?, ?)',
            [full_name, email, hash, role_id, 'active']
        );
        res.json({ success: true, message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;