require('dotenv').config(); // Load environment variables
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({ origin: 'https://your-hubspot-cms-domain.com' })); 
app.use(express.json());

app.get('/',async (req, res)=>{
    res.send("Server running")
})


// HubSpot API Proxy Endpoint
app.post('/hubspot-api', async (req, res) => {
  const { url, method, headers, data, params } = req.body;

  if (!endpoint || !method) {
    return res.status(400).json({ error: 'Missing required fields: endpoint or method.' });
  }

  try {
    const response = await axios({
      url: url,
      method: method.toUpperCase(),
      headers: headers,
      params: params || {},
      data: data || null,
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('HubSpot API Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
