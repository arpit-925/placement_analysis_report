import { FiUsers, FiCheckCircle, FiDollarSign, FiTrendingUp } from 'react-icons/fi';

export default function StatsCards({ overview }) {
  if (!overview) return null;

  const cards = [
    {
      label: 'Total Students',
      value: overview.totalStudents?.toLocaleString() || '0',
      icon: <FiUsers />,
      change: `${overview.placedStudents + overview.notPlacedStudents} records`
    },
    {
      label: 'Placement Rate',
      value: `${overview.overallPlacementRate || 0}%`,
      icon: <FiCheckCircle />,
      change: `${overview.placedStudents || 0} placed`
    },
    {
      label: 'Avg. Salary',
      value: `₹${overview.salaryStats?.average || 0} LPA`,
      icon: <FiDollarSign />,
      change: `Max: ₹${overview.salaryStats?.highest || 0} LPA`
    },
    {
      label: 'Highest Package',
      value: `₹${overview.salaryStats?.highest || 0} LPA`,
      icon: <FiTrendingUp />,
      change: `Min: ₹${overview.salaryStats?.lowest || 0} LPA`
    }
  ];

  return (
    <div className="stats-grid" id="stats-cards">
      {cards.map((card, i) => (
        <div className="stat-card" key={i}>
          <div className="stat-card-icon">{card.icon}</div>
          <div className="stat-card-label">{card.label}</div>
          <div className="stat-card-value">{card.value}</div>
          <div className="stat-card-change">
            <FiTrendingUp size={12} /> {card.change}
          </div>
        </div>
      ))}
    </div>
  );
}
