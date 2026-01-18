import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';

const router = express.Router();

/**
 * GET all users
 * Added u.created_at to the SELECT statement to fix the "Pending" date in the frontend.
 */
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                u.id, 
                u.full_name, 
                u.email, 
                u.status, 
                u.created_at, -- Ensure this matches your MySQL column name
                r.name as role 
            FROM users u 
            JOIN roles r ON u.role_id = r.id
            ORDER BY u.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error("Fetch Users Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// POST: Create new user
router.post('/', async (req, res) => {
    const { full_name, email, password, role_id } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        // MySQL will automatically populate created_at if set to CURRENT_TIMESTAMP
        await db.query(
            'INSERT INTO users (full_name, email, password_hash, role_id, status) VALUES (?, ?, ?, ?, ?)',
            [full_name, email, hash, role_id, 'active']
        );
        res.json({ success: true, message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * PUT: Update user
 */
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { full_name, email, status, role_id, password } = req.body;
    
    try {
        let query = 'UPDATE users SET full_name = ?, email = ?, status = ?, role_id = ?';
        let params = [full_name, email, status, role_id];

        if (password && password.trim() !== "") {
            const hash = await bcrypt.hash(password, 10);
            query += ', password_hash = ?';
            params.push(hash);
        }

        query += ' WHERE id = ?';
        params.push(id);

        const [result] = await db.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, message: 'User updated successfully' });
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE: Remove a user
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const [user] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
        if (user.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        await db.query('DELETE FROM users WHERE id = ?', [id]);
        
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ 
                error: 'Cannot delete user: This staff member is linked to existing records. Set status to "inactive" instead.' 
            });
        }
        res.status(500).json({ error: err.message });
    }
});

// Explicit default export to fix the SyntaxError in index.js
export default router;