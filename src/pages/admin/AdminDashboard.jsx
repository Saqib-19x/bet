import { Users, TicketCheck, DollarSign, TrendingUp, Activity, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { adminStats, revenueData } from '../../data/mockData';

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Users', value: adminStats.totalUsers.toLocaleString(), change: '+12.5%', color: 'blue', icon: <Users size={20} /> },
    { label: 'Active Bets', value: adminStats.activeBets.toLocaleString(), change: '+8.3%', color: 'green', icon: <TicketCheck size={20} /> },
    { label: 'Today Revenue', value: `₹${(adminStats.todayRevenue / 1000).toFixed(1)}K`, change: '+23.1%', color: 'yellow', icon: <DollarSign size={20} /> },
    { label: 'Pending Withdrawals', value: adminStats.pendingWithdrawals, change: '', color: 'red', icon: <AlertTriangle size={20} /> },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-subtitle">Overview of platform performance and activity</p>

      {/* Stats Grid */}
      <div className="admin-grid">
        {stats.map((stat, i) => (
          <div key={i} className={`stat-card ${stat.color}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
            {stat.change && (
              <div className="stat-change" style={{ color: 'var(--accent-green)' }}>
                <TrendingUp size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {stat.change} from last month
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="admin-chart-section">
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-xl)' }}>Revenue Overview</h3>
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
              <YAxis stroke="#5a6275" fontSize={12} tickFormatter={v => `₹${v / 1000}K`} />
              <Tooltip
                contentStyle={{ background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '13px' }}
                formatter={(value) => [`₹${value.toLocaleString()}`, '']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#00e676" fill="url(#greenGrad)" strokeWidth={2} name="Revenue" />
              <Area type="monotone" dataKey="payouts" stroke="#ff5252" fill="url(#redGrad)" strokeWidth={2} name="Payouts" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-xl)' }}>Quick Stats</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {[
              { label: 'Total Revenue', value: `₹${(adminStats.totalRevenue / 100000).toFixed(1)}L`, color: 'var(--accent-green)' },
              { label: 'Total Payouts', value: `₹${(adminStats.totalPayouts / 100000).toFixed(1)}L`, color: 'var(--accent-red)' },
              { label: 'Net Profit', value: `₹${((adminStats.totalRevenue - adminStats.totalPayouts) / 100000).toFixed(1)}L`, color: 'var(--accent-yellow)' },
              { label: 'Total Bets', value: adminStats.totalBets.toLocaleString(), color: 'var(--accent-blue)' },
              { label: 'Active Users', value: adminStats.activeUsers.toLocaleString(), color: 'var(--accent-purple)' },
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

      {/* Recent Activity */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
          <Activity size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
          Recent Activity
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {[
            { action: 'New user registered', user: 'Deepa Nair', time: '2 min ago', color: 'var(--accent-blue)' },
            { action: 'Bet placed', user: 'Rahul Sharma', time: '5 min ago', color: 'var(--accent-green)' },
            { action: 'Withdrawal requested', user: 'Vikram Singh', time: '12 min ago', color: 'var(--accent-orange)' },
            { action: 'Bet won', user: 'Sneha Gupta', time: '18 min ago', color: 'var(--accent-green)' },
            { action: 'Account suspended', user: 'Amit Kumar', time: '25 min ago', color: 'var(--accent-red)' },
            { action: 'Deposit completed', user: 'Karan Mehta', time: '30 min ago', color: 'var(--accent-green)' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: 'var(--space-md) var(--space-lg)',
              borderRadius: 'var(--radius-md)',
              background: i % 2 === 0 ? 'var(--bg-tertiary)' : 'transparent',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }}></div>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{item.action}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}> — {item.user}</span>
                </div>
              </div>
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
