import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FiAward } from 'react-icons/fi';

const COLORS = ['#667eea', '#764ba2', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#f093fb', '#34d399', '#a78bfa', '#fb923c'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(17, 24, 39, 0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '13px'
      }}>
        <p style={{ fontWeight: 700, marginBottom: 4 }}>{payload[0].payload.company}</p>
        <p style={{ color: '#667eea' }}>
          Students: <strong>{payload[0].value}</strong>
        </p>
        <p style={{ color: '#10b981' }}>
          Avg Salary: <strong>₹{payload[0].payload.avgSalary} LPA</strong>
        </p>
      </div>
    );
  }
  return null;
};

export default function TopCompanies({ topCompanies }) {
  if (!topCompanies || topCompanies.length === 0) return null;

  const data = topCompanies.map(c => ({
    company: c.company || c._id,
    count: c.count,
    avgSalary: c.avgSalary
  }));

  return (
    <div className="chart-card full-width" id="top-companies-chart">
      <div className="chart-title">
        <div className="chart-icon"><FiAward /></div>
        Top Recruiting Companies
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis type="number" stroke="#64748b" fontSize={12} />
          <YAxis type="category" dataKey="company" stroke="#64748b" fontSize={11} width={75} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={30}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
