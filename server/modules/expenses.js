import express from 'express';
import db from '../db.js'; 
const router = express.Router();

// GET all expenses - Now ordered by ID or Auto-Timestamp
router.get('/', async (req, res) => {
  try {
    // Ordering by ID DESC to show the newest entries first since date is hidden
    const [rows] = await db.query('SELECT * FROM expenses ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error("❌ GET Expenses Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST: Record a new company expense (Date is now handled by DB)
router.post('/', async (req, res) => {
  const { title, amount, category, description, document_url, status } = req.body;
  try {
    // Removed expense_date from the insert. 
    // Ensure your DB column 'expense_date' has DEFAULT CURRENT_TIMESTAMP
    const sql = `INSERT INTO expenses 
      (title, amount, category, description, document_url, status) 
      VALUES (?, ?, ?, ?, ?, ?)`;

    const [result] = await db.query(sql, [
      title, 
      amount, 
      category, 
      description, 
      document_url,
      status || 'unpaid'
    ]);

    res.status(201).json({ id: result.insertId, success: true });
  } catch (err) {
    console.error("❌ POST Expense Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT: Update an existing expense
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, amount, category, description, document_url, status } = req.body;

  try {
    // Explicitly mapping fields to avoid "Data Truncated" errors 
    // and ensuring we don't try to overwrite the date accidentally.
    const sql = `
      UPDATE expenses 
      SET title = COALESCE(?, title), 
          amount = COALESCE(?, amount), 
          category = COALESCE(?, category), 
          description = COALESCE(?, description), 
          document_url = COALESCE(?, document_url),
          status = COALESCE(?, status)
      WHERE id = ?`;
      
    await db.query(sql, [title, amount, category, description, document_url, status, id]);
    
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
    const [result] = await db.query('DELETE FROM expenses WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Record not found" });
    }
    
    res.json({ success: true, message: "Expense deleted" });
  } catch (err) {
    console.error("❌ DELETE Expense Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;