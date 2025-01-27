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
  const { url, method, headers, data, params, base64File, fileName } = req.body;

  if (!url || !headers || !method) {
    return res.status(400).json({ error: 'Missing required fields: url, method or headers' });
  }

  try {
    let requestData = data || {};

    // Handle base64 file if provided
    if (base64File) {
      if (!fileName) {
        return res.status(400).json({ error: 'Missing fileName for the base64 file.' });
      }

      // Convert base64 to binary buffer
      const fileBuffer = Buffer.from(base64File, 'base64');

      // Use FormData for file upload
      const FormData = require('form-data');
      const formData = new FormData();

      formData.append('file', fileBuffer, { filename: fileName });

      // Add other data fields if provided
      if (data) {
        Object.keys(data).forEach((key) => formData.append(key, data[key]));
      }

      headers['Content-Type'] = `multipart/form-data; boundary=${formData._boundary}`;
      requestData = formData;
    }

    // Make the API request
    const response = await axios({
      url,
      method: method.toUpperCase(),
      headers,
      params: params || {},
      data: requestData,
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
