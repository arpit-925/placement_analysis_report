const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

const app = express();

// Middleware
// app.use(cors());
app.use(cors({
  origin: [
    "http://localhost:5173", // local frontend
    "https://your-vercel-app.vercel.app" // replace after deploy
  ],
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/students', require('./routes/students'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/predict', require('./routes/predict'));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Server Error"
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Placement Analysis Backend',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🎓 Placement Analysis & Student Skillset Mapping System - AKGEC',
    version: '1.0.0',
    endpoints: {
      students: '/api/students',
      analytics: '/api/analytics',
      predict: '/api/predict',
      health: '/api/health'
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Backend server running on port ${PORT}`);
  console.log(`   📡 API: http://localhost:${PORT}/api`);
  console.log(`   🏥 Health: http://localhost:${PORT}/api/health`);
});
