const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const allowedOriginsEnv = process.env.CORS_ORIGIN;
    if (!allowedOriginsEnv || allowedOriginsEnv.trim() === '') {
      return callback(null, true);
    }

    const whitelist = allowedOriginsEnv.split(',').map(o => o.trim());
    if (whitelist.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS_BLOCKED"));
  }
};

app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

app.get('/api/ping', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/echo', (req, res) => {
  res.json({ body: req.body });
});

app.get('/api/secure-headers', (req, res) => {
  res.json({
    'x-dns-prefetch-control': res.get('x-dns-prefetch-control') || null,
    'x-frame-options': res.get('x-frame-options') || null,
    'x-content-type-options': res.get('x-content-type-options') || null
  });
});

app.use((err, req, res, next) => {
  if (err.message === 'CORS_BLOCKED') {
    return res.status(403).json({
      error: "CORS bloklandi",
      hint: "CORS_ORIGIN ga frontend URL qo'shing"
    });
  }
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
