import express from 'express';
import db from '../db.js'; 

const router = express.Router();

// GET all tasks
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tasks ORDER BY due_date ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new task
router.post('/', async (req, res) => {
  const { task_name, category, due_date, owner } = req.body;
  try {
    const sql = `INSERT INTO tasks (task_name, category, due_date, owner, status) VALUES (?, ?, ?, ?, 'Pending')`;
    const [result] = await db.query(sql, [task_name, category, due_date, owner]);
    res.status(201).json({ id: result.insertId, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update (Checkbox toggle or Edit)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('UPDATE tasks SET ? WHERE id = ?', [req.body, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE task
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;