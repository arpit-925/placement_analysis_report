import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { FiTrendingUp } from 'react-icons/fi';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(17, 24, 39, 0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '13px'
      }}>
        <p style={{ fontWeight: 700, marginBottom: 4 }}>CGPA Range: {label}</p>
        <p style={{ color: '#10b981' }}>
          Avg Salary: <strong>₹{payload[0]?.value} LPA</strong>
        </p>
        {payload[1] && (
          <p style={{ color: '#667eea' }}>
            Max Salary: <strong>₹{payload[1]?.value} LPA</strong>
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function CGPASalaryChart({ cgpaSalary }) {
  if (!cgpaSalary || cgpaSalary.length === 0) return null;

  const data = cgpaSalary.map(item => ({
    cgpa: item.cgpaRange,
    avgSalary: item.avgSalary,
    maxSalary: item.maxSalary,
    count: item.count
  }));

  return (
    <div className="chart-card" id="cgpa-salary-chart">
      <div className="chart-title">
        <div className="chart-icon"><FiTrendingUp /></div>
        CGPA vs Salary Trend
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#667eea" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="cgpa" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} unit=" LPA" />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="avgSalary"
            stroke="#10b981"
            strokeWidth={3}
            fill="url(#colorAvg)"
            name="Avg Salary"
            dot={{ fill: '#10b981', r: 5 }}
          />
          <Area
            type="monotone"
            dataKey="maxSalary"
            stroke="#667eea"
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="url(#colorMax)"
            name="Max Salary"
            dot={{ fill: '#667eea', r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
