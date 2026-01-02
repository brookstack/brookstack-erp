import express from 'express';
import db from '../db.js'; 

const router = express.Router();

// GET: Fetch all customers
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM customers ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error("❌ GET Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST: Create a new customer (Matches your Multi-Step Form)
router.post('/', async (req, res) => {
  // 1. Destructure all fields being sent by the React Form
  const { 
    companyName, clientType, contactPerson, mobile, 
    email, location, city, building, serviceCategory, 
    engagementType, description, accountManager, status, notes 
  } = req.body;

  try {
    // 2. Updated SQL to include all the missing columns
    const sql = `INSERT INTO customers 
      (companyName, clientType, contactPerson, mobile, email, location, 
       city, building, serviceCategory, engagementType, description, 
       accountManager, status, notes) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const [result] = await db.query(sql, [
      companyName, clientType, contactPerson, mobile, email, location, 
      city, building, serviceCategory, engagementType, description, 
      accountManager, status || 'lead', notes
    ]);

    res.status(201).json({ id: result.insertId, success: true });
  } catch (err) {
    console.error("❌ POST Error (MySQL):", err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT: Update existing customer
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // The 'SET ?' syntax works if req.body matches column names exactly
    await db.query('UPDATE customers SET ? WHERE id = ?', [req.body, id]);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ PUT Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Remove customer
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM customers WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;