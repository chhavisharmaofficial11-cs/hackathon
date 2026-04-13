const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const readline = require('readline');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Maintain state that is sent to frontend
let latestState = {
  data: [],
  systemMetrics: {
    cpu: 40,
    memory: 60,
    gpu: 30,
    bandwidth: 80,
    latency: 20,
    uptime: "47:12:03" // we can leave static or update it
  },
  swarmData: {
    status: 'NOMINAL',
    alive: 0,
    kia: 0,
    mode: 'NORMAL'
  }
};

// Start kaal_swarm.py globally
const scriptPath = path.join(__dirname, '../dashboard-app/src/kaal_swarm.py');
const pythonProcess = spawn('python3', [scriptPath], {
  // Use stdio pipe for stdout/err
  stdio: ['ignore', 'pipe', 'pipe']
});

pythonProcess.stderr.on('data', (data) => {
  console.error(`Swarm stderr: ${data}`);
});

const rl = readline.createInterface({
  input: pythonProcess.stdout,
  terminal: false
});

rl.on('line', (line) => {
  try {
    const parsed = JSON.parse(line);
    // Expected keys: status, alive, kia, mode
    if (parsed.status !== undefined) {
      latestState.swarmData = parsed;
      // Re-generate mock charts to keep charts alive
      generateMockData();
    }
  } catch(err) {
    // Usually pygame output from initializing, can be safely ignored
  }
});

pythonProcess.on('close', (code) => {
  console.log(`Python Swarm process exited with code ${code}`);
});

function generateMockData() {
  const data = [];
  for (let i = 1; i <= 12; i++) {
    data.push({
      time: i,
      value: Math.max(0, 10 + (Math.random() * 10 - 5)),
      value2: Math.max(0, 5 + (Math.random() * 6 - 3)),
      value3: Math.max(0, 20 + (Math.random() * 4 - 2)),
    });
  }
  
  // Tie some metrics slightly to swarm data roughly
  const load = latestState.swarmData.alive / 150; // max ~150 drones
  const cpuBase = 20 + load * 40;
  
  const systemMetrics = {
    cpu: Math.max(5, Math.min(100, cpuBase + (Math.random() * 20 - 10))),
    memory: Math.max(20, Math.min(100, 60 + (Math.random() * 10 - 5))),
    gpu: Math.max(5, Math.min(100, 30 + load * 20 + (Math.random() * 16 - 8))),
    bandwidth: Math.max(30, Math.min(100, 80 + (Math.random() * 10 - 5))),
    latency: Math.max(5, Math.min(200, 20 + load * 20 + (Math.random() * 20 - 10))),
    uptime: "47:12:03"
  };

  latestState.data = data;
  latestState.systemMetrics = systemMetrics;
}

// Ensure first set of mock data is generated
generateMockData();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Endpoint to get combined metrics
app.get('/api/python-data', (req, res) => {
  res.json(latestState);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
