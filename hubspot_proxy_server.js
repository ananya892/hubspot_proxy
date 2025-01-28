require('dotenv').config(); // Load environment variables
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const FormData = require("form-data");
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

app.post('/hubspot-api-file', async (req, res) => {
  const { url, method, headers, data, params } = req.body;
  
  if (!url || !headers || !method) {
    return res.status(400).json({ error: 'Missing required fields: url, method or headers' });
  }
  console.log("base64",data.file)
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
    console.log("Buffer",data.file)
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

app.post("/upload-to-hubspot", async (req, res) => {
  const { file, folderId, options } = req.body;

  // Prepare form data for HubSpot file upload
  const form = new FormData();
  form.append("file", file); // This should be the file content sent from the frontend
  form.append("folderId", folderId);
  form.append("options", JSON.stringify(options));

  try {
    // HubSpot file upload API endpoint
    const hubSpotUrl = "https://api.hubapi.com/filemanager/api/v3/files/upload";
    const hubSpotHeaders = {
      "Authorization": "Bearer YOUR_HUBSPOT_API_KEY", // Replace with your HubSpot API key
      ...form.getHeaders(),
    };

    // Upload the file to HubSpot using Axios to send the form data
    const response = await axios.post(hubSpotUrl, form, {
      headers: hubSpotHeaders
    });

    // Return the HubSpot response back to the frontend
    res.json(response.data);
  } catch (error) {
    console.error("Error uploading file to HubSpot:", error);
    res.status(500).send("Error uploading file to HubSpot");
  }
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
