const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// GET /api/students — Paginated list with filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      branch,
      status,
      sortBy = 'CGPA',
      order = 'desc',
      search,
      minCGPA,
      maxCGPA
    } = req.query;

    // Build filter
    const filter = {};
    if (branch) filter.Branch = branch;
    if (status) filter.Placement_Status = status;
    if (minCGPA || maxCGPA) {
      filter.CGPA = {};
      if (minCGPA) filter.CGPA.$gte = parseFloat(minCGPA);
      if (maxCGPA) filter.CGPA.$lte = parseFloat(maxCGPA);
    }
    if (search) {
      filter.$or = [
        { Name: { $regex: search, $options: 'i' } },
        { Roll_No: { $regex: search, $options: 'i' } },
        { Company: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [students, total] = await Promise.all([
      Student.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Student.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: students,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalRecords: total,
        perPage: limitNum,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/students/:id — Single student
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).lean();
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
