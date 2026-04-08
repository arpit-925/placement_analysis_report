/**
 * Database Seeder — Import students.csv into MongoDB
 * Run: node seed.js
 */

const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const Student = require('./models/Student');

const CSV_PATH = path.join(__dirname, '..', 'ml', 'dataset', 'students.csv');

async function seed() {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if file exists
    if (!fs.existsSync(CSV_PATH)) {
      console.error(`❌ CSV file not found: ${CSV_PATH}`);
      console.error('   Run "python generate_dataset.py" first.');
      process.exit(1);
    }

    // Clear existing data
    const existingCount = await Student.countDocuments();
    if (existingCount > 0) {
      console.log(`🗑️  Clearing ${existingCount} existing records...`);
      await Student.deleteMany({});
    }

    // Parse CSV and insert
    const students = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(CSV_PATH)
        .pipe(csv())
        .on('data', (row) => {
          students.push({
            Name: row.Name,
            Roll_No: row.Roll_No,
            Branch: row.Branch,
            CGPA: parseFloat(row.CGPA),
            DSA_Score: parseInt(row.DSA_Score),
            WebDev_Score: parseInt(row.WebDev_Score),
            ML_Score: parseInt(row.ML_Score),
            Aptitude_Score: parseInt(row.Aptitude_Score),
            Communication_Score: parseInt(row.Communication_Score),
            Internships: parseInt(row.Internships),
            Projects: parseInt(row.Projects),
            Hackathons: parseInt(row.Hackathons),
            Placement_Status: row.Placement_Status,
            Salary_LPA: parseFloat(row.Salary_LPA),
            Company: row.Company
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`📂 Parsed ${students.length} records from CSV`);

    // Batch insert
    const batchSize = 500;
    let inserted = 0;
    for (let i = 0; i < students.length; i += batchSize) {
      const batch = students.slice(i, i + batchSize);
      await Student.insertMany(batch);
      inserted += batch.length;
      console.log(`   Inserted ${inserted}/${students.length}...`);
    }

    console.log(`\n✅ Database seeded successfully!`);
    console.log(`   Total records: ${inserted}`);

    // Quick stats
    const placedCount = await Student.countDocuments({ Placement_Status: 'Placed' });
    console.log(`   Placed: ${placedCount} (${((placedCount / inserted) * 100).toFixed(1)}%)`);
    console.log(`   Not Placed: ${inserted - placedCount}`);

  } catch (error) {
    console.error('❌ Seeding error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed.');
    process.exit(0);
  }
}

seed();
