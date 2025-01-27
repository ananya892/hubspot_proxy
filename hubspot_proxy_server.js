require('dotenv').config(); // Load environment variables
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({ origin: 'https://www.absolutetranslations.com' })); 
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.get('/',async (req, res)=>{
    res.send("Server running")
})


// HubSpot API Proxy Endpoint
app.post('/hubspot-api', async (req, res) => {
  const { url, method, headers, data, params } = req.body;

  if (!url || !headers || !method) {
    return res.status(400).json({ error: 'Missing required fields: url, method or headers' });
  }

  try {
    if (data.file) {
      if (!data.file_name || !data.folderId) {
        return res.status(400).json({ error: 'Missing fileName or folderId for the base64 file.' });
      }
      const fileData = data.file;
      const base64Data = fileData.split(';base64,').pop();
      const fileBuffer = Buffer.from(base64Data, 'base64');
      data.file = fileBuffer;
    }
    console.log(data.file)
    // Make the API request
    // const response = await axios({
    //   url,
    //   method: method.toUpperCase(),
    //   headers,
    //   params: params || {},
    //   data: data,
    // });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('HubSpot API Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
