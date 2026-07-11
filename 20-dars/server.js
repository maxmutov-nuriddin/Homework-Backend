const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser('secretKey'));

app.use(session({
  secret: 'secretKey',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true }
}));

app.get('/set-cookie', (req, res) => {
  res.cookie('theme', 'dark', { maxAge: 24 * 60 * 60 * 1000 });
  res.json({ message: "Cookie 'theme' set to 'dark'" });
});

app.get('/read-cookie', (req, res) => {
  res.json({ theme: req.cookies.theme });
});

app.get('/login', (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ error: "Please provide a name query parameter, e.g., /login?name=Ali" });
  }
  req.session.user = { name };
  res.json({ message: `Successfully logged in as ${name}`, user: req.session.user });
});

app.get('/me', (req, res) => {
  if (req.session && req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ error: "Unauthorized. Please log in first." });
  }
});

app.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to log out" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Successfully logged out" });
    });
  } else {
    res.json({ message: "No active session to log out" });
  }
});

app.get('/set-signed-cookie', (req, res) => {
  res.cookie('role', 'student', { signed: true });
  res.json({ message: "Signed cookie 'role' set to 'student'" });
});

app.get('/read-signed-cookie', (req, res) => {
  res.json({ role: req.signedCookies.role });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
