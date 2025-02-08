const express = require('express');
/*const fetch = require('node-fetch');*/ // Import node-fetch
const app = express();
const port = 3000;
const path = require('path');

// Middleware to parse JSON bodies
app.use(express.json());

app.get("/", async function (req, res) {
res.sendFile(path.join(__dirname, "index.html"));
});

// Example: Fetch data from an external API and return it to the client
app.get('/api', async (req, res) => {
  try {
    // Fetch data from an external API (e.g., JSONPlaceholder)
    const response = await fetch('https://api.zetsu.xyz/cdp');
    const data = await response.json();
    const one = data.result.one
    const two = data.result.two


    // Send the fetched data back to the client
    res.json({ message: 'Data fetched from external API!', one, two });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data from external API' });
  }
});

app.get('/api/ai', async (req, res) => {
  const { betlog } = req.query; // Get query parameter from the request

  try {
    // Fetch data from an external API with query parameters
    const response = await fetch(`https://kaiz-apis.gleeze.com/api/deepseek-v3?ask=${betlog}&uid=1`);
    const data = await response.json();
    const result = data.response;
    console.log(result);

    // Send the fetched data back to the client
    res.json({ message: `Data fetched for userId ${betlog}`, result });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data from external API' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`API is running on http://localhost:${port}`);
});