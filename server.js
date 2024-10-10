const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

// In-memory storage (replace with a database in a production environment)
const users = new Map();
const applications = [];
let nextUserId = 1;
let nextApplicationId = 1;

app.use(cors({
  origin: 'http://localhost:5500', // Update this to match your frontend origin
  credentials: true
}));

app.use(bodyParser.json());

app.use(session({
  store: new FileStore({
    path: './sessions'
  }),
  secret: 'your_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// User registration
app.post('/register', async (req, res) => {
  const { email, password, role, studentFacultyId } = req.body;

  if (Array.from(users.values()).some(user => user.email === email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = nextUserId++;
    users.set(userId, {
      id: userId,
      email,
      password: hashedPassword,
      role,
      studentFacultyId
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'An error occurred during registration' });
  }
});

// User login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log(`Attempting login with email: ${email}`);

  const user = Array.from(users.values()).find(u => u.email === email);

  if (user && await bcrypt.compare(password, user.password)) {
    console.log('Login successful for user:', user);
    req.session.user = { id: user.id, email: user.email, role: user.role, studentFacultyId: user.studentFacultyId };
    res.json({ id: user.id, email: user.email, role: user.role, studentFacultyId: user.studentFacultyId });
  } else {
    console.log('Login failed. Invalid credentials');
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Session check
app.get('/session', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ error: 'No active session' });
  }
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Error logging out' });
    } else {
      res.clearCookie('connect.sid'); // Clear the session cookie
      res.json({ message: 'Logged out successfully' });
    }
  });
});

// Protected route example
app.get('/dashboard', isAuthenticated, (req, res) => {
  res.json({ message: 'Welcome to the dashboard', user: req.session.user });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});