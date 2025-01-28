// require('dotenv').config(); // Load environment variables
const express = require('express');
const app = express();
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
const axios = require('axios');
const cors = require('cors');
const FormData = require("form-data");
// const app = express();
const PORT = 3000;
const multer = require('multer');
const upload = multer(); // Initialize multer without disk storage for in-memory handling
app.use(upload.single('file'));
// const auth = process.env.AUTH;
// Middleware
app.use(cors({ origin: 'https://www.absolutetranslations.com' })); 
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.get('/',async (req, res)=>{
    res.send("Server running")
})

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
app.post("/upload-to-hubspot", upload.single('file'), async (req, res) => {
  const { folderId, options, key } = req.body;
  // console.log("key",key)
  const file = req.file; // Access the file uploaded by multer

  if (!file) {
    return res.status(400).send("No file uploaded");
  }

  // Prepare form data for HubSpot file upload
  const form = new FormData();
  form.append("file", file.buffer, file.originalname); // Use buffer and original filename
  form.append("folderId", folderId);
  form.append("options", options);

  try {
    const hubSpotUrl = "https://api.hubapi.com/filemanager/api/v3/files/upload";
    const hubSpotHeaders = {
      Authorization: `Bearer ${key}`, // Replace with your HubSpot API key or token
      ...form.getHeaders(),
    };

    const response = await axios.post(hubSpotUrl, form, {
      headers: hubSpotHeaders,
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error uploading file to HubSpot:", error.response?.data || error.message);
    res.status(500).send("Error uploading file to HubSpot");
  }
});
// app.post('/hubspot-api-file', async (req, res) => {
//   const { url, method, headers, data, params } = req.body;
  
//   if (!url || !headers || !method) {
//     return res.status(400).json({ error: 'Missing required fields: url, method or headers' });
//   }
//   console.log("base64",data.file)
//   try {
//     // if (data.file) {
//     //   if (!data.file_name || !data.folderId) {
//     //     return res.status(400).json({ error: 'Missing fileName or folderId for the base64 file.' });
//     //   }
//     //   const fileData = data.file;
//     //   const base64Data = fileData.split(';base64,').pop();
//     //   const fileBuffer = Buffer.from(base64Data, 'base64');
//     //   data.file = fileBuffer;
//     // }
//     // console.log("Buffer",data.file)
//     // Make the API request
//     const response = await axios({
//       url,
//       method: method.toUpperCase(),
//       headers,
//       params: params || {},
//       data: data,
//     });

//     res.status(response.status).json(response.data);
//   } catch (error) {
//     console.error('HubSpot API Error:', error.response?.data || error.message);
//     res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal Server Error' });
//   }
// });

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
      "Authorization": `${auth}`, // Replace with your HubSpot API key
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
