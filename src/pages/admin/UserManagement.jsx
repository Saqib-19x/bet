import { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, Ban, Plus } from 'lucide-react';
import { admin as adminApi } from '../../api/client';

const STATUSES = ['all', 'active', 'suspended', 'blocked'];

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;
      const res = await adminApi.users(params);
      setUsers(res.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, searchQuery ? 300 : 0);
    return () => clearTimeout(t);
  }, [statusFilter, searchQuery]);

  const updateStatus = async (id, status) => {
    try {
      const res = await adminApi.updateUserStatus(id, status);
      setUsers((prev) => prev.map((u) => (u._id === id ? res.user : u)));
    } catch (err) {
      alert(err.message);
    }
  };

  const adjustBalance = async (user) => {
    const input = window.prompt(`Adjust balance for ${user.name} (current: ₹${user.balance.toLocaleString('en-IN')}).\nEnter +/- amount:`);
    if (!input) return;
    const amount = parseFloat(input);
    if (!amount) return;
    const description = window.prompt('Reason / note:') || '';
    try {
      const res = await adminApi.adjustBalance(user._id, { amount, description });
      setUsers((prev) => prev.map((u) => (u._id === user._id ? res.user : u)));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">User Management</h1>
      <p className="page-subtitle">Manage registered users and their accounts</p>

      <div className="admin-toolbar">
        <div style={{ display: 'flex', gap: 'var(--space-md)', flex: 1, flexWrap: 'wrap' }}>
          <div className="input-with-icon" style={{ maxWidth: '320px', width: '100%' }}>
            <Search size={16} className="input-icon" />
            <input
              type="text"
              className="input-field"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="admin-filters">
            {STATUSES.map((status) => (
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
          {users.length} users
        </div>
      </div>

      {error && <div style={{ color: '#f44336', marginBottom: 'var(--space-md)' }}>{error}</div>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 'var(--space-xl)', color: 'var(--text-secondary)' }}>Loading…</div>
        ) : users.length === 0 ? (
          <div style={{ padding: 'var(--space-xl)', color: 'var(--text-secondary)' }}>No users found.</div>
        ) : (
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
              {users.map((u) => {
                const initials = (u.name || 'U').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
                return (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 'var(--radius-md)',
                          background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 'var(--font-sm)'
                        }}>
                          {initials}
                        </div>
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>{u.email}</td>
                    <td style={{ fontWeight: 600 }}>₹{u.balance.toLocaleString('en-IN')}</td>
                    <td>{u.totalBets || 0}</td>
                    <td><span className={`badge badge-${u.status}`}>{u.status}</span></td>
                    <td style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                        <button className="btn btn-icon btn-secondary" title="Adjust balance" onClick={() => adjustBalance(u)}>
                          <Plus size={14} />
                        </button>
                        {u.status === 'active' ? (
                          <>
                            <button className="btn btn-icon btn-secondary" title="Suspend" style={{ color: 'var(--accent-orange)' }} onClick={() => updateStatus(u._id, 'suspended')}>
                              <UserX size={14} />
                            </button>
                            <button className="btn btn-icon btn-secondary" title="Block" style={{ color: '#f44336' }} onClick={() => updateStatus(u._id, 'blocked')}>
                              <Ban size={14} />
                            </button>
                          </>
                        ) : (
                          <button className="btn btn-icon btn-secondary" title="Activate" style={{ color: 'var(--accent-green)' }} onClick={() => updateStatus(u._id, 'active')}>
                            <UserCheck size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
