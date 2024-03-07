const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Route for the root path
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle 404 - Keep this as a last route
app.use((req, res, _next) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'not_found.html'));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
