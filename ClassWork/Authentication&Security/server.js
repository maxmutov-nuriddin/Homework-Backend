require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://localhost:5000'],
  credentials: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// Default users
let users = [];

let refreshTokens = [];

const authenticateToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ message: 'Access denied, token missing!' });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied, admin only!' });
  }
  next();
};

app.post('/api/register', (req, res) => {
  const { username, password, role } = req.body;
  
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'User already exists!' });
  }

  const newUser = {
    id: users.length + 1,
    username,
    passwordHash: bcrypt.hashSync(password, 8),
    role: role || 'user'
  };
  
  users.push(newUser);
  res.status(201).json({ message: 'User created successfully', user: { id: newUser.id, username: newUser.username, role: newUser.role } });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const payload = { id: user.id, username: user.username, role: user.role };
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  
  refreshTokens.push(refreshToken);

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 15 * 60 * 1000,
    sameSite: 'lax'
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  });

  res.json({ 
    message: 'Logged in successfully', 
    role: user.role,
    accessToken_status: 'Generated & Stored in Cookie',
    refreshToken_status: 'Generated & Stored in Cookie'
  });
});

app.post('/api/refresh', (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'Refresh token missing' });
  if (!refreshTokens.includes(token)) return res.status(403).json({ message: 'Invalid refresh token' });

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid refresh token' });

    const payload = { id: user.id, username: user.username, role: user.role };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000,
      sameSite: 'lax'
    });

    res.json({ message: 'Access token refreshed successfully' });
  });
});

app.post('/api/logout', (req, res) => {
  const token = req.cookies.refreshToken;
  refreshTokens = refreshTokens.filter(t => t !== token);

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.username}, you are a ${req.user.role}.`, user: req.user });
});

app.get('/api/admin', authenticateToken, requireAdmin, (req, res) => {
  res.json({ message: 'Welcome to the admin dashboard!' });
});

app.delete('/api/admin/clear', authenticateToken, requireAdmin, (req, res) => {
  users = [];
  res.json({ message: "Baza to'liq tozalandi! Hamma foydalanuvchilar o'chirildi." });
});

app.get('/api/users', (req, res) => {
    const safeUsers = users.map(u => ({ id: u.id, username: u.username, role: u.role }));
    res.json({ users: safeUsers });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
