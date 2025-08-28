// server.js
const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.get('/api/cover/:mangaId/:fileName', async (req, res) => {
  const { mangaId, fileName } = req.params;
  const imageUrl = `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg`;

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return res.status(404).send('Image not found');
    }
    res.set('Content-Type', response.headers.get('content-type'));
    response.body.pipe(res);
  } catch (err) {
    res.status(500).send('Error fetching image');
  }
});

app.get('/api/*', async (req, res) => {
  const url = `https://api.mangadex.org${req.url.replace('/api', '')}`;
  const response = await fetch(url);
  const data = await response.json();
  res.set('Access-Control-Allow-Origin', '*');
  res.json(data);
});

app.listen(3000, () => {
  console.log('Proxy server running on port 3000');
});