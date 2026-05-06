const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const pool = require('./db');
const initDatabase = require('./init-db');

const app = express();

app.use(cors());
app.use(express.json());

// Initialize database tables
initDatabase();

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// -- Auth Routes --

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role]
    );

    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const payload = {
      id: user.rows[0].id,
      name: user.rows[0].name,
      role: user.rows[0].role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: payload });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [req.user.id]);
    res.json(user.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all students (for faculty)
app.get('/api/users/students', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ error: 'Only faculty can view students' });
    }
    const students = await pool.query("SELECT id, name, email FROM users WHERE role = 'student' ORDER BY name ASC");
    res.json(students.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


// -- Doubts Routes --

// Get all doubts (feed)
app.get('/api/doubts', async (req, res) => {
  try {
    const doubts = await pool.query(`
      SELECT d.*, u.name as student_name 
      FROM doubts d
      JOIN users u ON d.student_id = u.id
      ORDER BY d.created_at DESC
    `);
    res.json(doubts.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single doubt
app.get('/api/doubts/:id', async (req, res) => {
  try {
    const doubt = await pool.query(`
      SELECT d.*, u.name as student_name 
      FROM doubts d
      JOIN users u ON d.student_id = u.id
      WHERE d.id = $1
    `, [req.params.id]);

    if (doubt.rows.length === 0) {
      return res.status(404).json({ error: 'Doubt not found' });
    }

    const responses = await pool.query(`
      SELECT r.*, u.name as user_name, u.role as user_role
      FROM responses r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.doubt_id = $1
      ORDER BY r.created_at ASC
    `, [req.params.id]);

    res.json({
      ...doubt.rows[0],
      responses: responses.rows
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new doubt
app.post('/api/doubts', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can post doubts' });
    }

    const { subject, description } = req.body;
    const newDoubt = await pool.query(
      'INSERT INTO doubts (student_id, subject, description) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, subject, description]
    );

    res.json(newDoubt.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update doubt status
app.put('/api/doubts/:id/status', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ error: 'Only faculty can update doubt status' });
    }

    const { status } = req.body;
    const updatedDoubt = await pool.query(
      'UPDATE doubts SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (updatedDoubt.rows.length === 0) {
      return res.status(404).json({ error: 'Doubt not found' });
    }

    res.json(updatedDoubt.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a response to a doubt (faculty, AI, or even the student)
app.post('/api/doubts/:id/responses', authenticateToken, async (req, res) => {
  try {
    const { content, is_ai } = req.body;
    
    // AI responses or faculty responses
    const newResponse = await pool.query(
      'INSERT INTO responses (doubt_id, user_id, content, is_ai) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.params.id, is_ai ? null : req.user.id, content, is_ai || false]
    );

    // If faculty responds, mark as resolved? Optional. Let's keep it simple.
    // Let's return the response with user details
    const responseWithUser = await pool.query(`
      SELECT r.*, u.name as user_name, u.role as user_role
      FROM responses r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = $1
    `, [newResponse.rows[0].id]);

    res.json(responseWithUser.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// AI bot integration mock endpoint
app.post('/api/ai/ask', authenticateToken, async (req, res) => {
  try {
    const { question } = req.body;
    // Mock AI delay and response
    setTimeout(() => {
      res.json({
        answer: `This is an AI generated response for: "${question}". Based on our academic database, the key concept here revolves around standard computer science principles. For more specific details, please consult your course material or ask a faculty member.`
      });
    }, 1500);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
