const express = require('express');
const router = express.Router();
const axios = require('axios');

// ✅ Use environment variable ONLY (no localhost fallback in production)
const ML_SERVICE_URL = process.env.ML_SERVICE_URL;

// ✅ Utility: validate numbers safely
const toFloat = (val) => (val !== undefined ? parseFloat(val) : 0);
const toInt = (val) => (val !== undefined ? parseInt(val) : 0);

// POST /api/predict — Proxy prediction to Flask ML service
router.post('/', async (req, res) => {
  try {
    const {
      cgpa,
      dsa,
      webdev,
      ml,
      aptitude,
      communication,
      internships,
      projects,
      hackathons
    } = req.body;

    // ✅ Validate required fields
    if (cgpa === undefined || dsa === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: cgpa, dsa'
      });
    }

    // ✅ Prepare payload
    const payload = {
      cgpa: toFloat(cgpa),
      dsa: toFloat(dsa),
      webdev: toFloat(webdev),
      ml: toFloat(ml),
      aptitude: toFloat(aptitude),
      communication: toFloat(communication),
      internships: toInt(internships),
      projects: toInt(projects),
      hackathons: toInt(hackathons)
    };

    // ✅ Call ML service
    const mlResponse = await axios.post(
      `${ML_SERVICE_URL}/predict`,
      payload,
      {
        timeout: 15000
      }
    );

    return res.status(200).json({
      success: true,
      data: mlResponse.data
    });

  } catch (error) {
    console.error('🔥 Prediction Error:', error.message);

    // ✅ Handle ML service down
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'ML service unavailable (connection refused)'
      });
    }

    // ✅ Handle timeout (Render cold start case)
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        error: 'ML service timeout (cold start or slow response)'
      });
    }

    // ✅ Forward ML error if exists
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: error.response.data
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
});

// GET /api/predict/feature-importance
router.get('/feature-importance', async (req, res) => {
  try {
    const response = await axios.get(
      `${ML_SERVICE_URL}/feature-importance`,
      { timeout: 10000 }
    );

    return res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('🔥 Feature Importance Error:', error.message);

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'ML service unavailable'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to fetch feature importance'
    });
  }
});

module.exports = router;