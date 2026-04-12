const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// ✅ CORS FIX
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://your-actual-vercel-url.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());

// DB
connectDB();

// ✅ ROUTES FIX
app.use('/api/students', require('./routes/students'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api', require('./routes/predict')); // ✅ FIXED

// Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Placement Analysis Backend',
    timestamp: new Date().toISOString()
  });
});

// Root
app.get('/', (req, res) => {
  res.json({
    message: 'Placement API running'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Server Error"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});