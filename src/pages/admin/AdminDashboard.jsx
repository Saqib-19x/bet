import { Users, TicketCheck, DollarSign, TrendingUp, Activity, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { admin as adminApi } from '../../api/client';
import { Skeleton } from '../../components/Skeleton';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function aggregateRevenue(raw) {
  const byMonth = {};
  for (const row of raw || []) {
    const key = `${row._id.year}-${String(row._id.month).padStart(2, '0')}`;
    if (!byMonth[key]) byMonth[key] = { month: MONTH_NAMES[row._id.month - 1], revenue: 0, payouts: 0 };
    if (row._id.type === 'bet') byMonth[key].revenue += row.total;
    if (row._id.type === 'win') byMonth[key].payouts += row.total;
  }
  return Object.keys(byMonth).sort().map((k) => byMonth[k]);
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.stats()
      .then((data) => {
        setStats(data.stats);
        setRevenueData(aggregateRevenue(data.revenueData));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-fade-in">
        <Skeleton width={240} height={32} radius={8} style={{ marginBottom: 8 }} />
        <Skeleton width={360} height={16} style={{ marginBottom: 'var(--space-xl)' }} />
        <div className="admin-grid">
          {[0,1,2,3].map((i) => (
            <div key={i} className="stat-card">
              <Skeleton width={28} height={28} radius={6} style={{ marginBottom: 12 }} />
              <Skeleton width="60%" height={12} style={{ marginBottom: 6 }} />
              <Skeleton width="40%" height={28} />
            </div>
          ))}
        </div>
        <div className="admin-chart-section">
          <div className="card">
            <Skeleton width={180} height={20} style={{ marginBottom: 'var(--space-lg)' }} />
            <Skeleton height={300} radius={8} />
          </div>
          <div className="card">
            <Skeleton width={140} height={20} style={{ marginBottom: 'var(--space-lg)' }} />
            {[0,1,2,3,4].map((i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-md)' }}>
                <Skeleton width="50%" />
                <Skeleton width={80} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (error) return <div style={{ padding: 40, color: '#f44336' }}>{error}</div>;

  const cards = [
    { label: 'Total Users', value: stats.totalUsers.toLocaleString('en-IN'), color: 'blue', icon: <Users size={20} /> },
    { label: 'Active Bets', value: stats.activeBets.toLocaleString('en-IN'), color: 'green', icon: <TicketCheck size={20} /> },
    { label: 'Today Revenue', value: `₹${(stats.todayRevenue / 1000).toFixed(1)}K`, color: 'yellow', icon: <DollarSign size={20} /> },
    { label: 'Pending Withdrawals', value: stats.pendingWithdrawals, color: 'red', icon: <AlertTriangle size={20} /> },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-subtitle">Overview of platform performance and activity</p>

      <div className="admin-grid">
        {cards.map((stat, i) => (
          <div key={i} className={`stat-card ${stat.color}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="admin-chart-section">
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-xl)' }}>Revenue Overview</h3>
          {revenueData.length === 0 ? (
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              No revenue data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e676" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00e676" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff5252" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff5252" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="#5a6275" fontSize={12} />
                <YAxis stroke="#5a6275" fontSize={12} tickFormatter={(v) => `₹${v / 1000}K`} />
                <Tooltip
                  contentStyle={{ background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '13px' }}
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, '']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#00e676" fill="url(#greenGrad)" strokeWidth={2} name="Revenue" />
                <Area type="monotone" dataKey="payouts" stroke="#ff5252" fill="url(#redGrad)" strokeWidth={2} name="Payouts" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-xl)' }}>Quick Stats</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {[
              { label: 'Total Deposited', value: `₹${(stats.totalDeposited / 100000).toFixed(2)}L`, color: 'var(--accent-green)' },
              { label: 'Total Payouts', value: `₹${(stats.totalPayouts / 100000).toFixed(2)}L`, color: 'var(--accent-red)' },
              { label: 'Total Withdrawn', value: `₹${(stats.totalWithdrawn / 100000).toFixed(2)}L`, color: 'var(--accent-yellow)' },
              { label: 'Total Bets', value: stats.totalBets.toLocaleString('en-IN'), color: 'var(--accent-blue)' },
              { label: 'Active Users', value: stats.activeUsers.toLocaleString('en-IN'), color: 'var(--accent-purple)' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: 'var(--space-md)', background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
              }}>
                <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>{item.label}</span>
                <span style={{ fontWeight: 700, color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
