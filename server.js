const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Mock database
const db = {
  users: [],
  favorites: [],
  history: []
};

// API proxy endpoint
app.get('/api/javhd', async (req, res) => {
  try {
    const { action, query, url } = req.query;
    const apiUrl = `https://api.zetsu.xyz/javhd?action=${action}&query=${encodeURIComponent(query)}&url=${encodeURIComponent(url)}&apikey=625156d0d268e4633b97980c0dc859d0`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User system endpoints
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  db.users.push({ username, password });
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
