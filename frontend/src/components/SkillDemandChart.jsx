import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FiPieChart } from 'react-icons/fi';

const COLORS = ['#667eea', '#764ba2', '#06b6d4', '#10b981', '#f59e0b'];

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
        <p style={{ fontWeight: 700, marginBottom: 4 }}>{payload[0].name}</p>
        <p style={{ color: '#667eea' }}>
          Placed Avg: <strong>{payload[0].payload.placed}</strong>
        </p>
        <p style={{ color: '#ef4444' }}>
          Not Placed Avg: <strong>{payload[0].payload.notPlaced}</strong>
        </p>
        <p style={{ color: '#10b981' }}>
          Gap: <strong>{(payload[0].payload.placed - payload[0].payload.notPlaced).toFixed(1)}</strong>
        </p>
      </div>
    );
  }
  return null;
};

export default function SkillDemandChart({ skillComparison }) {
  if (!skillComparison) return null;

  const data = Object.entries(skillComparison).map(([skill, vals]) => ({
    name: skill,
    value: vals.placed,
    placed: vals.placed,
    notPlaced: vals.notPlaced
  }));

  return (
    <div className="chart-card" id="skill-demand-chart">
      <div className="chart-title">
        <div className="chart-icon"><FiPieChart /></div>
        Most Demanded Skills (Placed Students)
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={110}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
