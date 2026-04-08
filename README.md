# 🎓 Placement Analysis & Student Skillset Mapping System

> **Ajay Kumar Garg Engineering College (AKGEC)**  
> MERN Stack + Python ML Project

A comprehensive full-stack application that analyzes campus placement trends, predicts student placement probability and expected salary using ML models, and suggests skill improvements.

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React + Vite  │────▶│  Express + Node  │────▶│  Flask (Python) │
│   Port: 3000    │     │   Port: 5000     │     │   Port: 5001    │
│                 │     │                  │     │                 │
│  • Dashboard    │     │  • /api/students │     │  • /predict     │
│  • Students     │     │  • /api/analytics│     │  • /feature-    │
│  • Predict      │     │  • /api/predict  │     │    importance   │
└─────────────────┘     └──────┬───────────┘     └─────────────────┘
                               │
                        ┌──────▼───────────┐
                        │   MongoDB Atlas  │
                        │  2000 students   │
                        └──────────────────┘
```

## 🚀 Quick Start

### 1. ML Pipeline (Python)
```bash
cd ml
pip install -r requirements.txt
python generate_dataset.py    # Generate 2000 student records
python eda.py                 # Generate EDA charts
python train_models.py        # Train 3 ML models
python flask_api.py           # Start ML API on port 5001
```

### 2. Backend (Node.js)
```bash
cd backend
npm install
node seed.js                  # Seed MongoDB from CSV
node server.js                # Start API on port 5000
```

### 3. Frontend (React)
```bash
cd frontend
npm install
npm run dev                   # Start on port 3000
```

### Open in Browser
Navigate to: **http://localhost:3000**

---

## 📊 Features

### Dashboard
- **Stats Cards**: Total students, placement rate, avg salary, highest package
- **Placement by Branch**: Bar chart showing placement rates across branches
- **Skill Demand**: Pie chart of most valued skills
- **CGPA vs Salary**: Area chart showing salary trends by CGPA range
- **Skill Correlation**: Grouped bar chart comparing placed vs not placed skill scores
- **Top Companies**: Horizontal bar chart of top recruiting companies

### Student Records
- Searchable, filterable data table
- Filter by branch and placement status
- Paginated with 20 records per page

### Placement Prediction
- Input student profile using sliders (CGPA, skills) and dropdowns (internships, projects)
- ML-powered prediction showing:
  - **Placement Probability** (using Random Forest and Logistic Regression)
  - **Expected Salary** (using Linear Regression)
  - **Skill Improvement Suggestions** with priority levels
  - **Model Comparison** across algorithms

---

## 🤖 ML Models

| Model | Purpose | Metric |
|-------|---------|--------|
| Logistic Regression | Placement Classification | Accuracy ~85% |
| Random Forest | Placement Classification | Accuracy ~88% |
| Linear Regression | Salary Prediction | R² Score ~0.4 |

### Features Used
CGPA, DSA_Score, WebDev_Score, ML_Score, Aptitude_Score, Communication_Score, Internships, Projects, Hackathons

---

## 📁 Project Structure

```
placement-analysis-project/
├── ml/                          # Python ML Pipeline
│   ├── dataset/students.csv     # Generated dataset (2000 records)
│   ├── charts/                  # EDA visualization charts
│   ├── models/                  # Trained .pkl model files
│   ├── generate_dataset.py      # Dataset generator
│   ├── eda.py                   # Exploratory Data Analysis
│   ├── train_models.py          # Model training pipeline
│   ├── flask_api.py             # Flask prediction API
│   └── requirements.txt
├── backend/                     # Node.js + Express API
│   ├── config/db.js             # MongoDB connection
│   ├── models/Student.js        # Mongoose schema
│   ├── routes/
│   │   ├── students.js          # GET /api/students
│   │   ├── analytics.js         # GET /api/analytics
│   │   └── predict.js           # POST /api/predict
│   ├── server.js                # Express server
│   ├── seed.js                  # Database seeder
│   └── .env                     # Environment config
├── frontend/                    # React + Vite
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Dashboard, Students, Predict
│   │   ├── services/api.js      # Axios API service
│   │   ├── App.jsx              # Router setup
│   │   └── index.css            # Design system
│   └── vite.config.js
└── README.md
```

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Recharts, Framer Motion, React Router
- **Backend**: Node.js, Express, Mongoose, Axios
- **Database**: MongoDB Atlas
- **ML**: Python, scikit-learn, Pandas, NumPy, Flask
- **Visualization**: Matplotlib, Seaborn (EDA), Recharts (Dashboard)

---

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students?page=1&branch=CSE&status=Placed` | Paginated students list |
| GET | `/api/students/:id` | Single student details |
| GET | `/api/analytics` | Aggregated placement analytics |
| POST | `/api/predict` | Predict placement & salary |
| GET | `/api/predict/feature-importance` | ML feature importance |

---

## 👨‍💻 Author

Built for AKGEC Placement Cell Analysis
