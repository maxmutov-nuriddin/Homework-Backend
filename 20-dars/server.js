const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// 2-qadam: Add cookieParser with secret key for signed cookies
app.use(cookieParser('secretKey'));

// 3-qadam: Add session middleware with requested config
app.use(session({
  secret: 'secretKey',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true }
}));

// 4-qadam: GET /set-cookie : send 'theme' cookie with value 'dark' and 24h maxAge
app.get('/set-cookie', (req, res) => {
  res.cookie('theme', 'dark', { maxAge: 24 * 60 * 60 * 1000 });
  res.json({ message: "Cookie 'theme' set to 'dark'" });
});

// 5-qadam: GET /read-cookie : return req.cookies.theme in JSON format
app.get('/read-cookie', (req, res) => {
  res.json({ theme: req.cookies.theme });
});

// 6-qadam: GET /login?name=Ali : save user in session
app.get('/login', (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ error: "Please provide a name query parameter, e.g., /login?name=Ali" });
  }
  req.session.user = { name };
  res.json({ message: `Successfully logged in as ${name}`, user: req.session.user });
});

// 7-qadam: GET /me : return user if session exists, else return 401 status
app.get('/me', (req, res) => {
  if (req.session && req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ error: "Unauthorized. Please log in first." });
  }
});

// 8-qadam: GET /logout : destroy the session
app.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to log out" });
      }
      res.clearCookie('connect.sid'); // Clear session cookie
      res.json({ message: "Successfully logged out" });
    });
  } else {
    res.json({ message: "No active session to log out" });
  }
});

// Bonus: Signed cookie endpoints
app.get('/set-signed-cookie', (req, res) => {
  res.cookie('role', 'student', { signed: true });
  res.json({ message: "Signed cookie 'role' set to 'student'" });
});

app.get('/read-signed-cookie', (req, res) => {
  res.json({ role: req.signedCookies.role });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
