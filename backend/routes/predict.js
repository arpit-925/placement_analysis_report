const express = require('express');
const router = express.Router();
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

// POST /api/predict — Proxy prediction to Flask ML service
router.post('/', async (req, res) => {
  try {
    const { cgpa, dsa, webdev, ml, aptitude, communication, internships, projects, hackathons } = req.body;

    // Validate inputs
    if (cgpa === undefined || dsa === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields. Need: cgpa, dsa, webdev, ml, aptitude, communication, internships, projects, hackathons'
      });
    }

    // Forward to Flask ML service
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, {
      cgpa: parseFloat(cgpa),
      dsa: parseFloat(dsa),
      webdev: parseFloat(webdev),
      ml: parseFloat(ml),
      aptitude: parseFloat(aptitude),
      communication: parseFloat(communication),
      internships: parseInt(internships),
      projects: parseInt(projects),
      hackathons: parseInt(hackathons)
    }, {
      timeout: 10000
    });

    res.json({
      success: true,
      data: mlResponse.data
    });
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'ML prediction service is unavailable. Please ensure the Flask API is running on port 5001.'
      });
    }
    console.error('Prediction error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/predict/feature-importance — Get feature importance
router.get('/feature-importance', async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/feature-importance`);
    res.json({ success: true, data: response.data });
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'ML service unavailable.'
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
