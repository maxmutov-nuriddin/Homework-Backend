const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// CORS Options and whitelist
const corsOptions = {
  origin: (origin, callback) => {
    // 1. origin yo'q bo'lsa (Postman/curl) -> ruxsat bering
    if (!origin) {
      return callback(null, true);
    }

    // 2. CORS_ORIGIN bo'sh bo'lsa -> hammasiga ruxsat (dev)
    const allowedOriginsEnv = process.env.CORS_ORIGIN;
    if (!allowedOriginsEnv || allowedOriginsEnv.trim() === '') {
      return callback(null, true);
    }

    // 3. aks holda faqat whitelist ichida bo'lsa ruxsat
    const whitelist = allowedOriginsEnv.split(',').map(o => o.trim());
    if (whitelist.includes(origin)) {
      return callback(null, true);
    }

    // 4. bo'lmasa Error("CORS_BLOCKED") qaytaring
    return callback(new Error("CORS_BLOCKED"));
  }
};

// app.options("*", cors(corsOptions)) qo'shing (preflight uchun)
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

// Endpoints
// GET /api/ping -> { ok:true }
app.get('/api/ping', (req, res) => {
  res.json({ ok: true });
});

// POST /api/echo -> { body: req.body }
app.post('/api/echo', (req, res) => {
  res.json({ body: req.body });
});

// GET /api/secure-headers -> response headerlardan 3 tasini qaytarib bering
app.get('/api/secure-headers', (req, res) => {
  res.json({
    'x-dns-prefetch-control': res.get('x-dns-prefetch-control') || null,
    'x-frame-options': res.get('x-frame-options') || null,
    'x-content-type-options': res.get('x-content-type-options') || null
  });
});

// Xatoni ushlash (Error Handling)
app.use((err, req, res, next) => {
  if (err.message === 'CORS_BLOCKED') {
    return res.status(403).json({
      error: "CORS bloklandi",
      hint: "CORS_ORIGIN ga frontend URL qo'shing"
    });
  }
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Port and listen on 0.0.0.0
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
