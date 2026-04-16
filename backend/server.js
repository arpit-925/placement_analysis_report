const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// ✅ CORS (FIXED - allow your real frontend OR all for now)
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://placement-analysis-report.vercel.app" // 🔥 replace with your real URL
  ],
  credentials: true
}));

// 👉 TEMP (if still debugging, you can use this instead)
// app.use(cors());

app.use(express.json());

// ✅ Connect DB
connectDB();

// ✅ ROUTES (CLEAN STRUCTURE)
app.use('/api/students', require('./routes/students'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api', require('./routes/predict')); // 🔥 important
app.use('/api/teacher', require('./routes/upload')); // 📤 Teacher file upload

// ✅ Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Placement Analysis Backend',
    timestamp: new Date().toISOString()
  });
});

// ✅ Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Placement API running 🚀',
    endpoints: {
      students: '/api/students',
      analytics: '/api/analytics',
      predict: '/api/predict',
      health: '/api/health'
    }
  });
});

// ❗ 404 handler (VERY IMPORTANT FOR DEBUGGING)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Server Error"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});