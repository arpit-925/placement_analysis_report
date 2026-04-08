import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FiBarChart2 } from 'react-icons/fi';

const COLORS = ['#667eea', '#764ba2', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

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
        <p style={{ fontWeight: 700, marginBottom: 4 }}>{label}</p>
        <p style={{ color: '#667eea' }}>
          Placement Rate: <strong>{payload[0].value}%</strong>
        </p>
      </div>
    );
  }
  return null;
};

export default function PlacementByBranch({ branchStats }) {
  if (!branchStats || branchStats.length === 0) return null;

  const data = branchStats.map(b => ({
    branch: b.branch || b._id,
    rate: b.placementRate,
    total: b.total,
    placed: b.placed
  }));

  return (
    <div className="chart-card" id="placement-by-branch-chart">
      <div className="chart-title">
        <div className="chart-icon"><FiBarChart2 /></div>
        Placement Rate by Branch
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="branch" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} unit="%" />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="rate" radius={[6, 6, 0, 0]} maxBarSize={60}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
