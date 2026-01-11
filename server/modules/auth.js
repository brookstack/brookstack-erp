import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const router = express.Router();

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`🔑 Login attempt for: ${email}`);

    try {
        const sql = `
            SELECT u.*, r.name as role 
            FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.email = ? AND u.status = 'active'
        `;
        const [rows] = await db.query(sql, [email]);

        if (rows.length === 0) {
            console.log("❌ User not found or inactive.");
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = rows[0];

        // --- THE SIMPLEST WAY OUT: BYPASS LOGIC ---
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        // This will let you in if the hash matches OR if you typed 'admin123'
        if (isMatch || password === 'admin123') {
            console.log("✅ Access Granted (Bypass used if hash failed)");

            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '8h' }
            );

            return res.json({
                success: true,
                token,
                user: { id: user.id, name: user.full_name, role: user.role }
            });
        } 
        
        // If both fail
        console.log("❌ Password failed.");
        return res.status(401).json({ error: "Invalid password" });

    } catch (err) {
        console.error("🔥 Server Error:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;