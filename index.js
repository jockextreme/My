// ======================
// SERVER (Node.js/Express)
// ======================
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_DOMAIN || '*' }));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Secure proxy endpoints
app.get('/api/home', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const response = await fetch(
      `https://api.zetsu.xyz/prn/home?apikey=${process.env.API_KEY}&page=${page}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/search/:query', async (req, res) => {
  try {
    const query = encodeURIComponent(req.params.query);
    const page = req.query.page || 1;
    
    const response = await fetch(
      `https://api.zetsu.xyz/prn/search/${query}?apikey=${process.env.API_KEY}&page=${page}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
