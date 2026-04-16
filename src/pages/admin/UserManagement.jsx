import { useState } from 'react';
import { Search, MoreHorizontal, UserCheck, UserX, Eye } from 'lucide-react';
import { adminUsers } from '../../data/mockData';

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = adminUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">User Management</h1>
      <p className="page-subtitle">Manage registered users and their accounts</p>

      <div className="admin-toolbar">
        <div style={{ display: 'flex', gap: 'var(--space-md)', flex: 1 }}>
          <div className="input-with-icon" style={{ maxWidth: '320px', width: '100%' }}>
            <Search size={16} className="input-icon" />
            <input
              type="text"
              className="input-field"
              placeholder="Search users..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="admin-filters">
            {['all', 'active', 'suspended', 'blocked'].map(status => (
              <button
                key={status}
                className={`tab ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
                style={{ borderRadius: 'var(--radius-full)', textTransform: 'capitalize' }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
          {filtered.length} users found
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table" id="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Balance</th>
              <th>Total Bets</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 'var(--radius-md)',
                      background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 'var(--font-sm)'
                    }}>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span style={{ fontWeight: 600 }}>{user.name}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>{user.email}</td>
                <td style={{ fontWeight: 600 }}>₹{user.balance.toLocaleString()}</td>
                <td>{user.bets}</td>
                <td><span className={`badge badge-${user.status}`}>{user.status}</span></td>
                <td style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                  {new Date(user.joined).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <button className="btn btn-icon btn-secondary" title="View"><Eye size={14} /></button>
                    {user.status === 'active' ? (
                      <button className="btn btn-icon btn-secondary" title="Suspend" style={{ color: 'var(--accent-orange)' }}>
                        <UserX size={14} />
                      </button>
                    ) : (
                      <button className="btn btn-icon btn-secondary" title="Activate" style={{ color: 'var(--accent-green)' }}>
                        <UserCheck size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
