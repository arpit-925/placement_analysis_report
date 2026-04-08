const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
    trim: true
  },
  Roll_No: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  Branch: {
    type: String,
    required: true,
    enum: ['CSE', 'IT', 'ECE', 'ME', 'CE', 'EE'],
    index: true
  },
  CGPA: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  DSA_Score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  WebDev_Score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  ML_Score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  Aptitude_Score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  Communication_Score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  Internships: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  Projects: {
    type: Number,
    required: true,
    min: 0,
    max: 20
  },
  Hackathons: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  Placement_Status: {
    type: String,
    required: true,
    enum: ['Placed', 'Not Placed'],
    index: true
  },
  Salary_LPA: {
    type: Number,
    required: true,
    min: 0
  },
  Company: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'students'
});

// Compound indexes for common queries
studentSchema.index({ Branch: 1, Placement_Status: 1 });
studentSchema.index({ CGPA: -1 });
studentSchema.index({ Salary_LPA: -1 });

module.exports = mongoose.model('Student', studentSchema);
