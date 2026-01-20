import express from 'express';
import db from '../db.js'; 

const router = express.Router();

// Helper function to sanitize ISO dates for MySQL DATE columns
const formatDateForSql = (dateString) => {
  if (!dateString) return null;
  // If date contains 'T' (ISO format), take only the YYYY-MM-DD part
  return dateString.includes('T') ? dateString.split('T')[0] : dateString;
};

// GET all tasks
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tasks ORDER BY due_date ASC');
    res.json(rows);
  } catch (err) {
    console.error("❌ GET Tasks Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST: Sanitize date before insertion
router.post('/', async (req, res) => {
  const { task_name, category, due_date, owner } = req.body;
  const cleanDate = formatDateForSql(due_date);

  try {
    const sql = `INSERT INTO tasks (task_name, category, due_date, owner, status) VALUES (?, ?, ?, ?, 'Pending')`;
    const [result] = await db.query(sql, [task_name, category, cleanDate, owner]);
    res.status(201).json({ id: result.insertId, success: true });
  } catch (err) {
    console.error("❌ POST Task Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT: Sanitize date and handle updates
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { task_name, category, due_date, owner, status } = req.body;
  const cleanDate = formatDateForSql(due_date);

  try {
    const sql = `
      UPDATE tasks 
      SET task_name = COALESCE(?, task_name), 
          category = COALESCE(?, category), 
          due_date = COALESCE(?, due_date), 
          owner = COALESCE(?, owner), 
          status = COALESCE(?, status) 
      WHERE id = ?`;
      
    // Note: We use cleanDate in the array below
    const [result] = await db.query(sql, [task_name, category, cleanDate, owner, status, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("❌ PUT Task Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE: task
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM tasks WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE Task Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;