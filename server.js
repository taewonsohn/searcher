const express = require('express');
const app = express();

const port = 3000; // Choose a port number

// Serve static files from the 'public' folder
app.use(express.static('public'));

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});