const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Endpoint to execute the Python script and return data
app.get('/api/python-data', (req, res) => {
  const scriptPath = path.join(__dirname, 'script.py');
  const pythonProcess = spawn('python3', [scriptPath]);

  let dataString = '';
  let errorString = '';

  pythonProcess.stdout.on('data', (data) => {
    dataString += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    errorString += data.toString();
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`Python script exited with code ${code}: ${errorString}`);
      return res.status(500).json({ error: 'Failed to execute python script' });
    }

    try {
      const parsedData = JSON.parse(dataString);
      res.json(parsedData);
    } catch (err) {
      console.error('Error parsing Python script output:', err);
      res.status(500).json({ error: 'Failed to parse python output' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
