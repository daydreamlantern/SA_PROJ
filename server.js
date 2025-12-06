const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'employee_leave_db'
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL database');
  
  // Create admin account if it doesn't exist
  createAdminAccount();
});

// Create admin account
async function createAdminAccount() {
  const adminEmail = 'admin@admin';
  const adminName = 'admin';
  const adminPassword = 'admin';
  
  // Check if admin exists
  db.query('SELECT * FROM users WHERE email = ?', [adminEmail], async (err, results) => {
    if (err) {
      console.error('Error checking admin:', err);
      return;
    }
    
    if (results.length === 0) {
      // Create admin account
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [adminName, adminEmail, hashedPassword, 'admin'],
        (err) => {
          if (err) {
            console.error('Error creating admin:', err);
          } else {
            console.log('Admin account created successfully');
          }
        }
      );
    }
  });
}

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { name, email, password, department } = req.body;

  if (!name || !email || !password || !department) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if user already exists
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      db.query(
        'INSERT INTO users (name, email, password, department, role) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, department, 'employee'],
        (err, result) => {
          if (err) {
            return res.status(500).json({ error: 'Error creating user' });
          }

          const token = jwt.sign(
            { id: result.insertId, email, role: 'employee' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
          );

          res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: result.insertId, name, email, department, role: 'employee' }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = results[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role
      }
    });
  });
});

// Get current user
app.get('/api/me', authenticateToken, (req, res) => {
  db.query('SELECT id, name, email, department, role FROM users WHERE id = ?', [req.user.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(results[0]);
  });
});

// Submit leave request (Employee only)
app.post('/api/leave-requests', authenticateToken, (req, res) => {
  const { reason, start_date, end_date } = req.body;

  if (!reason) {
    return res.status(400).json({ error: 'Reason is required' });
  }

  if (!start_date || !end_date) {
    return res.status(400).json({ error: 'Start date and end date are required' });
  }

  // Validate dates
  const start = new Date(start_date);
  const end = new Date(end_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  if (start < today) {
    return res.status(400).json({ error: 'Start date cannot be in the past' });
  }

  if (end < start) {
    return res.status(400).json({ error: 'End date cannot be before start date' });
  }

  // Get user details
  db.query('SELECT * FROM users WHERE id = ?', [req.user.id], (err, userResults) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (userResults.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResults[0];

    // Insert leave request
    db.query(
      'INSERT INTO leave_requests (user_id, name, department, email, reason, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user.id, user.name, user.department, user.email, reason, start_date, end_date, 'pending'],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Error creating leave request' });
        }

        res.status(201).json({
          message: 'Leave request submitted successfully',
          request: {
            id: result.insertId,
            name: user.name,
            department: user.department,
            email: user.email,
            reason,
            start_date,
            end_date,
            status: 'pending'
          }
        });
      }
    );
  });
});

// Get leave requests (Employee sees their own, Admin sees all)
app.get('/api/leave-requests', authenticateToken, (req, res) => {
  if (req.user.role === 'admin') {
    // Admin sees all requests
    db.query(
      'SELECT * FROM leave_requests ORDER BY created_at DESC',
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
      }
    );
  } else {
    // Employee sees only their requests
    db.query(
      'SELECT * FROM leave_requests WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
      }
    );
  }
});

// Update leave request status (Admin only)
app.put('/api/leave-requests/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { status } = req.body;
  const requestId = req.params.id;

  if (!['accepted', 'denied'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be "accepted" or "denied"' });
  }

  db.query(
    'UPDATE leave_requests SET status = ? WHERE id = ?',
    [status, requestId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Leave request not found' });
      }

      res.json({ message: 'Leave request status updated successfully' });
    }
  );
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

