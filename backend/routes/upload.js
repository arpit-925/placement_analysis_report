const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const mammoth = require('mammoth');

// ── Multer config (memory storage, 10MB limit) ─────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/octet-stream'
    ];
    const ext = file.originalname.toLowerCase();
    if (allowed.includes(file.mimetype) || ext.endsWith('.csv') || ext.endsWith('.xlsx') || ext.endsWith('.xls') || ext.endsWith('.docx') || ext.endsWith('.doc')) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Please upload CSV, XLSX, or DOCX files.`));
    }
  }
});

// ── Column name normalization ───────────────────────────────────
const COLUMN_MAP = {
  // Name
  'name': 'Name', 'student name': 'Name', 'student_name': 'Name', 'studentname': 'Name', 'full name': 'Name', 'fullname': 'Name',
  // Branch
  'branch': 'Branch', 'department': 'Branch', 'dept': 'Branch', 'stream': 'Branch', 'course': 'Branch',
  // CGPA
  'cgpa': 'CGPA', 'gpa': 'CGPA', 'grade': 'CGPA', 'percentage': 'CGPA', 'marks': 'CGPA',
  // Placement Status
  'placement_status': 'Placement_Status', 'placement status': 'Placement_Status', 'placementstatus': 'Placement_Status',
  'status': 'Placement_Status', 'placed': 'Placement_Status', 'placement': 'Placement_Status',
  // Company
  'company': 'Company', 'company name': 'Company', 'company_name': 'Company', 'companyname': 'Company',
  'employer': 'Company', 'organization': 'Company', 'org': 'Company',
  // Salary / Package
  'salary': 'Salary_LPA', 'salary_lpa': 'Salary_LPA', 'package': 'Salary_LPA', 'package_lpa': 'Salary_LPA',
  'ctc': 'Salary_LPA', 'salary lpa': 'Salary_LPA', 'package lpa': 'Salary_LPA', 'annual package': 'Salary_LPA',
  'lpa': 'Salary_LPA', 'annual_package': 'Salary_LPA',
  // Roll No
  'roll_no': 'Roll_No', 'roll no': 'Roll_No', 'rollno': 'Roll_No', 'roll': 'Roll_No',
  'roll number': 'Roll_No', 'enrollment': 'Roll_No', 'enrollment_no': 'Roll_No', 'id': 'Roll_No',
};

function normalizeColumnName(col) {
  const cleaned = String(col).trim().toLowerCase().replace(/[^a-z0-9_ ]/g, '');
  return COLUMN_MAP[cleaned] || null;
}

// ── Parse XLSX / CSV using xlsx library ─────────────────────────
function parseSpreadsheet(buffer, filename) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error('No sheets found in the file.');
  const sheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  if (!rawData || rawData.length === 0) throw new Error('The file contains no data rows.');
  return rawData;
}

// ── Parse DOCX using mammoth ────────────────────────────────────
async function parseDocx(buffer) {
  const result = await mammoth.convertToHtml({ buffer });
  const html = result.value;

  // Extract tables from HTML
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  const tableMatch = html.match(tableRegex);
  if (!tableMatch || tableMatch.length === 0) {
    throw new Error('No tables found in the DOCX file. Please ensure the document contains a data table.');
  }

  // Parse first table
  const table = tableMatch[0];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;

  const rows = [];
  let rowMatch;
  while ((rowMatch = rowRegex.exec(table)) !== null) {
    const cells = [];
    let cellMatch;
    const cellStr = rowMatch[1];
    const cellRe = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
    while ((cellMatch = cellRe.exec(cellStr)) !== null) {
      // Strip HTML tags from cell content
      cells.push(cellMatch[1].replace(/<[^>]+>/g, '').trim());
    }
    if (cells.length > 0) rows.push(cells);
  }

  if (rows.length < 2) throw new Error('Table in DOCX has insufficient data rows.');

  // First row as headers
  const headers = rows[0];
  const data = [];
  for (let i = 1; i < rows.length; i++) {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = rows[i][idx] || '';
    });
    data.push(obj);
  }

  return data;
}

// ── Map raw data to normalized schema ───────────────────────────
function normalizeData(rawData) {
  if (!rawData || rawData.length === 0) return [];

  // Detect column mapping from first row
  const rawHeaders = Object.keys(rawData[0]);
  const mapping = {};
  for (const header of rawHeaders) {
    const normalized = normalizeColumnName(header);
    if (normalized) {
      mapping[header] = normalized;
    }
  }

  // Map each row
  const students = rawData.map((row, idx) => {
    const student = { _index: idx + 1 };

    for (const [rawCol, normCol] of Object.entries(mapping)) {
      student[normCol] = row[rawCol];
    }

    // Ensure Name exists
    if (!student.Name) {
      // Try to find any name-like column
      for (const key of rawHeaders) {
        if (!mapping[key] && typeof row[key] === 'string' && row[key].length > 1 && isNaN(row[key])) {
          student.Name = row[key];
          break;
        }
      }
    }
    if (!student.Name) student.Name = `Student ${idx + 1}`;

    // Normalize CGPA
    if (student.CGPA !== undefined) {
      student.CGPA = parseFloat(student.CGPA) || 0;
      // If percentage (>10), convert to CGPA scale
      if (student.CGPA > 10) student.CGPA = Math.round((student.CGPA / 10) * 100) / 100;
    } else {
      student.CGPA = 0;
    }

    // Normalize Salary
    if (student.Salary_LPA !== undefined) {
      student.Salary_LPA = parseFloat(String(student.Salary_LPA).replace(/[^\d.]/g, '')) || 0;
    } else {
      student.Salary_LPA = 0;
    }

    // Normalize Placement Status
    if (student.Placement_Status) {
      const status = String(student.Placement_Status).toLowerCase().trim();
      if (status === 'yes' || status === 'placed' || status === '1' || status === 'true') {
        student.Placement_Status = 'Placed';
      } else {
        student.Placement_Status = 'Not Placed';
      }
    } else {
      // Infer from salary or company
      if (student.Salary_LPA > 0 || (student.Company && student.Company !== '-' && student.Company.toLowerCase() !== 'na' && student.Company.toLowerCase() !== 'not placed')) {
        student.Placement_Status = 'Placed';
      } else {
        student.Placement_Status = 'Not Placed';
      }
    }

    // Default Branch
    if (!student.Branch) student.Branch = 'General';
    student.Branch = String(student.Branch).toUpperCase().trim();

    // Default Company
    if (!student.Company) {
      student.Company = student.Placement_Status === 'Placed' ? 'Unknown' : '-';
    }

    return student;
  });

  return students;
}

// ── Compute analytics ───────────────────────────────────────────
function computeAnalytics(students) {
  const totalStudents = students.length;
  const placed = students.filter(s => s.Placement_Status === 'Placed');
  const notPlaced = students.filter(s => s.Placement_Status !== 'Placed');

  const salaries = placed.map(s => s.Salary_LPA).filter(s => s > 0);
  const avgPackage = salaries.length > 0 ? Math.round((salaries.reduce((a, b) => a + b, 0) / salaries.length) * 100) / 100 : 0;
  const maxPackage = salaries.length > 0 ? Math.max(...salaries) : 0;
  const minPackage = salaries.length > 0 ? Math.min(...salaries) : 0;

  // Branch-wise stats
  const branchMap = {};
  students.forEach(s => {
    if (!branchMap[s.Branch]) {
      branchMap[s.Branch] = { total: 0, placed: 0, totalSalary: 0, salaryCount: 0 };
    }
    branchMap[s.Branch].total++;
    if (s.Placement_Status === 'Placed') {
      branchMap[s.Branch].placed++;
      if (s.Salary_LPA > 0) {
        branchMap[s.Branch].totalSalary += s.Salary_LPA;
        branchMap[s.Branch].salaryCount++;
      }
    }
  });

  const branchStats = Object.entries(branchMap).map(([branch, data]) => ({
    branch,
    total: data.total,
    placed: data.placed,
    notPlaced: data.total - data.placed,
    placementRate: Math.round((data.placed / data.total) * 100 * 10) / 10,
    avgSalary: data.salaryCount > 0 ? Math.round((data.totalSalary / data.salaryCount) * 100) / 100 : 0
  })).sort((a, b) => b.placementRate - a.placementRate);

  // Package distribution buckets
  const packageBuckets = [
    { label: '0-3 LPA', min: 0, max: 3, count: 0 },
    { label: '3-6 LPA', min: 3, max: 6, count: 0 },
    { label: '6-10 LPA', min: 6, max: 10, count: 0 },
    { label: '10-15 LPA', min: 10, max: 15, count: 0 },
    { label: '15+ LPA', min: 15, max: Infinity, count: 0 }
  ];

  salaries.forEach(s => {
    for (const bucket of packageBuckets) {
      if (s >= bucket.min && s < bucket.max) {
        bucket.count++;
        break;
      }
    }
  });

  // Top companies
  const companyMap = {};
  placed.forEach(s => {
    if (s.Company && s.Company !== '-' && s.Company.toLowerCase() !== 'unknown') {
      if (!companyMap[s.Company]) companyMap[s.Company] = { count: 0, totalSalary: 0 };
      companyMap[s.Company].count++;
      companyMap[s.Company].totalSalary += s.Salary_LPA;
    }
  });

  const topCompanies = Object.entries(companyMap)
    .map(([company, data]) => ({
      company,
      count: data.count,
      avgSalary: Math.round((data.totalSalary / data.count) * 100) / 100
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    overview: {
      totalStudents,
      placedStudents: placed.length,
      notPlacedStudents: notPlaced.length,
      placementRate: totalStudents > 0 ? Math.round((placed.length / totalStudents) * 100 * 10) / 10 : 0,
      avgPackage,
      maxPackage,
      minPackage
    },
    branchStats,
    packageDistribution: packageBuckets,
    topCompanies
  };
}

// ── POST /api/teacher/upload ────────────────────────────────────
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded. Please select a file.' });
    }

    const filename = req.file.originalname.toLowerCase();
    let rawData;

    if (filename.endsWith('.csv') || filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      rawData = parseSpreadsheet(req.file.buffer, filename);
    } else if (filename.endsWith('.docx')) {
      rawData = await parseDocx(req.file.buffer);
    } else if (filename.endsWith('.doc')) {
      return res.status(400).json({
        success: false,
        error: 'Legacy .doc format is not supported. Please convert to .docx or .xlsx.'
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Unsupported file format. Please upload CSV, XLSX, or DOCX files.'
      });
    }

    if (!rawData || rawData.length === 0) {
      return res.status(400).json({ success: false, error: 'The file contains no data.' });
    }

    const students = normalizeData(rawData);
    const analytics = computeAnalytics(students);

    console.log(`✅ Processed ${students.length} students from ${req.file.originalname}`);

    res.json({
      success: true,
      data: {
        students,
        analytics,
        fileName: req.file.originalname,
        totalRows: students.length
      }
    });

  } catch (error) {
    console.error('🔥 Upload Error:', error.message);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to process the uploaded file.'
    });
  }
});

// Multer error handler
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: 'File size exceeds 10MB limit.' });
    }
    return res.status(400).json({ success: false, error: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
  next();
});

module.exports = router;
