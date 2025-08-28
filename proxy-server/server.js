// server.js
const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.get('/api/*', async (req, res) => {
  const url = `https://api.mangadex.org${req.url.replace('/api', '')}`;
  const response = await fetch(url);
  const data = await response.json();
  res.set('Access-Control-Allow-Origin', '*');
  res.json(data);
});

app.listen(3000, () => console.log('Proxy running on port 3000'));