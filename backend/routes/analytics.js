const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// GET /api/analytics — Aggregated placement statistics
router.get('/', async (req, res) => {
  try {
    const [
      totalStudents,
      placedStudents,
      branchStats,
      skillAvgPlaced,
      skillAvgNotPlaced,
      salaryStats,
      topCompanies,
      branchSalary,
      cgpaSalaryBuckets
    ] = await Promise.all([
      // Total students
      Student.countDocuments(),

      // Placed students
      Student.countDocuments({ Placement_Status: 'Placed' }),

      // Placement rate by branch
      Student.aggregate([
        {
          $group: {
            _id: '$Branch',
            total: { $sum: 1 },
            placed: {
              $sum: { $cond: [{ $eq: ['$Placement_Status', 'Placed'] }, 1, 0] }
            },
            avgCGPA: { $avg: '$CGPA' },
            avgSalary: {
              $avg: {
                $cond: [{ $eq: ['$Placement_Status', 'Placed'] }, '$Salary_LPA', null]
              }
            }
          }
        },
        {
          $project: {
            branch: '$_id',
            total: 1,
            placed: 1,
            placementRate: {
              $round: [{ $multiply: [{ $divide: ['$placed', '$total'] }, 100] }, 1]
            },
            avgCGPA: { $round: ['$avgCGPA', 2] },
            avgSalary: { $round: ['$avgSalary', 2] }
          }
        },
        { $sort: { placementRate: -1 } }
      ]),

      // Avg skills for placed students
      Student.aggregate([
        { $match: { Placement_Status: 'Placed' } },
        {
          $group: {
            _id: null,
            avgDSA: { $avg: '$DSA_Score' },
            avgWebDev: { $avg: '$WebDev_Score' },
            avgML: { $avg: '$ML_Score' },
            avgAptitude: { $avg: '$Aptitude_Score' },
            avgCommunication: { $avg: '$Communication_Score' },
            avgInternships: { $avg: '$Internships' },
            avgProjects: { $avg: '$Projects' }
          }
        }
      ]),

      // Avg skills for not placed students
      Student.aggregate([
        { $match: { Placement_Status: 'Not Placed' } },
        {
          $group: {
            _id: null,
            avgDSA: { $avg: '$DSA_Score' },
            avgWebDev: { $avg: '$WebDev_Score' },
            avgML: { $avg: '$ML_Score' },
            avgAptitude: { $avg: '$Aptitude_Score' },
            avgCommunication: { $avg: '$Communication_Score' },
            avgInternships: { $avg: '$Internships' },
            avgProjects: { $avg: '$Projects' }
          }
        }
      ]),

      // Salary statistics
      Student.aggregate([
        { $match: { Placement_Status: 'Placed' } },
        {
          $group: {
            _id: null,
            avgSalary: { $avg: '$Salary_LPA' },
            maxSalary: { $max: '$Salary_LPA' },
            minSalary: { $min: '$Salary_LPA' },
            medianSalary: { $avg: '$Salary_LPA' } // approx
          }
        }
      ]),

      // Top 10 recruiting companies
      Student.aggregate([
        { $match: { Placement_Status: 'Placed' } },
        {
          $group: {
            _id: '$Company',
            count: { $sum: 1 },
            avgSalary: { $avg: '$Salary_LPA' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $project: {
            company: '$_id',
            count: 1,
            avgSalary: { $round: ['$avgSalary', 2] }
          }
        }
      ]),

      // Branch-wise salary distribution
      Student.aggregate([
        { $match: { Placement_Status: 'Placed' } },
        {
          $group: {
            _id: '$Branch',
            avgSalary: { $avg: '$Salary_LPA' },
            maxSalary: { $max: '$Salary_LPA' },
            minSalary: { $min: '$Salary_LPA' },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            branch: '$_id',
            avgSalary: { $round: ['$avgSalary', 2] },
            maxSalary: { $round: ['$maxSalary', 2] },
            minSalary: { $round: ['$minSalary', 2] },
            count: 1
          }
        },
        { $sort: { avgSalary: -1 } }
      ]),

      // CGPA vs Salary buckets
      Student.aggregate([
        { $match: { Placement_Status: 'Placed' } },
        {
          $bucket: {
            groupBy: '$CGPA',
            boundaries: [4, 5, 6, 7, 8, 9, 10.1],
            default: 'Other',
            output: {
              count: { $sum: 1 },
              avgSalary: { $avg: '$Salary_LPA' },
              maxSalary: { $max: '$Salary_LPA' }
            }
          }
        }
      ])
    ]);

    const overallPlacementRate = totalStudents > 0
      ? ((placedStudents / totalStudents) * 100).toFixed(1)
      : 0;

    // Format skill comparison
    const skillComparison = {};
    const skills = ['DSA', 'WebDev', 'ML', 'Aptitude', 'Communication'];
    const skillKeys = ['avgDSA', 'avgWebDev', 'avgML', 'avgAptitude', 'avgCommunication'];
    
    skills.forEach((skill, i) => {
      skillComparison[skill] = {
        placed: skillAvgPlaced[0] ? Math.round(skillAvgPlaced[0][skillKeys[i]] * 10) / 10 : 0,
        notPlaced: skillAvgNotPlaced[0] ? Math.round(skillAvgNotPlaced[0][skillKeys[i]] * 10) / 10 : 0
      };
    });

    // Format CGPA vs Salary
    const cgpaSalary = cgpaSalaryBuckets.map(bucket => ({
      cgpaRange: `${bucket._id}-${bucket._id + 1}`,
      count: bucket.count,
      avgSalary: Math.round(bucket.avgSalary * 100) / 100,
      maxSalary: Math.round(bucket.maxSalary * 100) / 100
    }));

    res.json({
      success: true,
      data: {
        overview: {
          totalStudents,
          placedStudents,
          notPlacedStudents: totalStudents - placedStudents,
          overallPlacementRate: parseFloat(overallPlacementRate),
          salaryStats: salaryStats[0] ? {
            average: Math.round(salaryStats[0].avgSalary * 100) / 100,
            highest: salaryStats[0].maxSalary,
            lowest: salaryStats[0].minSalary
          } : null
        },
        branchStats,
        skillComparison,
        topCompanies,
        branchSalary,
        cgpaSalary
      }
    });
  } catch (error) {
    console.error('Error computing analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
