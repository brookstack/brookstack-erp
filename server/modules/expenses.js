import express from 'express';
import db from '../db.js'; 
const router = express.Router();

// GET all expenses - Ordered by most recent date
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM expenses ORDER BY expense_date DESC');
    res.json(rows);
  } catch (err) {
    console.error("❌ GET Expenses Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST: Record a new company expense
router.post('/', async (req, res) => {
  const { title, amount, category, expense_date, description, document_url } = req.body;
  try {
    const sql = `INSERT INTO expenses 
      (title, amount, category, expense_date, description, document_url) 
      VALUES (?, ?, ?, ?, ?, ?)`;

    const [result] = await db.query(sql, [
      title, 
      amount, 
      category, 
      expense_date, 
      description, 
      document_url
    ]);

    res.status(201).json({ id: result.insertId, success: true });
  } catch (err) {
    console.error("❌ POST Expense Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT: Update an existing expense (Fixing amounts, changing categories, or status)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Uses the MySQL 'SET ?' shorthand to update only fields provided in req.body
    const sql = 'UPDATE expenses SET ? WHERE id = ?';
    await db.query(sql, [req.body, id]);
    
    res.json({ success: true, message: "Expense updated successfully" });
  } catch (err) {
    console.error("❌ PUT Expense Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Remove an expense record
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM expenses WHERE id = ?', [id]);
    res.json({ success: true, message: "Expense deleted" });
  } catch (err) {
    console.error("❌ DELETE Expense Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;