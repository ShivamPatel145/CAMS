const express = require('express');
const https = require('https');
const fs = require('fs');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const session = require('express-session');
const FileStore = require('session-file-store')(session);

const app = express();
const port = 3000;

app.use(cors({
  origin: 'https://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());

// Session configuration
app.use(session({
  store: new FileStore({
    path: './sessions',
    secret: 'your_session_secret',
    reapInterval: 3600,
    ttl: 86400
  }),
  secret: 'your_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// SSL/TLS configuration
const httpsOptions = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
};

// Database connection (update with your details)
const db = mysql.createConnection({
  host: 'localhost',
  user: 'Dell',
  password: 'MySQL@123',
  database: 'college_application_system'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Middleware for input validation
const validateRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('role').isIn(['student', 'faculty', 'admin']),
  body('studentFacultyId').notEmpty().trim().escape()
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

const validateApplication = [
  body('userId').isInt(),
  body('recipientId').isInt(),
  body('type').isIn(['leaveRequest', 'documentRequest', 'certificate']),
  body('content').notEmpty().trim().escape()
];

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// User registration
app.post('/register', validateRegistration, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, role, studentFacultyId } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = 'INSERT INTO users (email, password, role, student_faculty_id) VALUES (?, ?, ?, ?)';
  db.query(query, [email, hashedPassword, role, studentFacultyId], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error registering user' });
    } else {
      res.status(201).json({ message: 'User registered successfully' });
    }
  });
});

// User login
app.post('/login', validateLogin, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error logging in' });
    } else if (results.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
    } else {
      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        req.session.user = { id: user.id, email: user.email, role: user.role, studentFacultyId: user.student_faculty_id };
        res.json({ id: user.id, email: user.email, role: user.role, studentFacultyId: user.student_faculty_id });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    }
  });
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Error logging out' });
    } else {
      res.json({ message: 'Logged out successfully' });
    }
  });
});

// Submit application
app.post('/applications', isAuthenticated, validateApplication, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId, recipientId, type, content } = req.body;

  const query = 'INSERT INTO applications (user_id, recipient_id, type, content) VALUES (?, ?, ?, ?)';
  db.query(query, [userId, recipientId, type, content], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error submitting application' });
    } else {
      res.status(201).json({ message: 'Application submitted successfully', id: result.insertId });
    }
  });
});

// Get applications
app.get('/applications', isAuthenticated, (req, res) => {
  const { role } = req.session.user;
  const userId = req.session.user.id;

  let query = 'SELECT a.*, u.email as user_email, r.email as recipient_email FROM applications a JOIN users u ON a.user_id = u.id JOIN users r ON a.recipient_id = r.id';
  let queryParams = [];

  if (role === 'student') {
    query += ' WHERE a.user_id = ?';
    queryParams.push(userId);
  }

  db.query(query, queryParams, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching applications' });
    } else {
      res.json(results);
    }
  });
});

// Update application status
app.put('/applications/:id', isAuthenticated, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const { role } = req.session.user;

  if (role !== 'faculty' && role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized to update application status' });
  }

  const query = 'UPDATE applications SET status = ? WHERE id = ?';
  db.query(query, [status, id], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error updating application status' });
    } else {
      res.json({ message: 'Application status updated successfully' });
    }
  });
});

https.createServer(httpsOptions, app).listen(port, () => {
  console.log(`HTTPS Server running on port ${port}`);
});