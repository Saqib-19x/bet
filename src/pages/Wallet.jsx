import { useState } from 'react';
import { Wallet as WalletIcon, ArrowUpCircle, ArrowDownCircle, CreditCard, Smartphone, Building, Clock } from 'lucide-react';
import { transactions } from '../data/mockData';

const typeIcons = {
  deposit: <ArrowDownCircle size={16} style={{ color: 'var(--accent-green)' }} />,
  withdraw: <ArrowUpCircle size={16} style={{ color: 'var(--accent-red)' }} />,
  bet: <CreditCard size={16} style={{ color: 'var(--accent-blue)' }} />,
  win: <ArrowDownCircle size={16} style={{ color: 'var(--accent-green)' }} />,
};

export default function Wallet() {
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositMethod, setDepositMethod] = useState('upi');

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Wallet</h1>
      <p className="page-subtitle">Manage your funds, deposits and withdrawals</p>

      {/* Balance Card */}
      <div className="wallet-balance-card">
        <div className="wallet-balance-label">Available Balance</div>
        <div className="wallet-balance-amount">₹12,500.00</div>
        <div className="wallet-actions">
          <button className="btn btn-primary btn-lg" onClick={() => setShowDeposit(!showDeposit)}>
            <ArrowDownCircle size={18} /> Deposit
          </button>
          <button className="btn btn-secondary btn-lg">
            <ArrowUpCircle size={18} /> Withdraw
          </button>
        </div>
      </div>

      {/* Deposit Form */}
      {showDeposit && (
        <div className="card animate-slide-up" style={{ marginBottom: 'var(--space-2xl)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-lg)' }}>Quick Deposit</h3>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
            {[
              { id: 'upi', label: 'UPI', icon: <Smartphone size={16} /> },
              { id: 'card', label: 'Card', icon: <CreditCard size={16} /> },
              { id: 'bank', label: 'Bank', icon: <Building size={16} /> },
            ].map(method => (
              <button
                key={method.id}
                className={`btn ${depositMethod === method.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setDepositMethod(method.id)}
              >
                {method.icon} {method.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
            <div className="input-group">
              <label>Amount (₹)</label>
              <input type="number" className="input-field" placeholder="Enter amount" defaultValue="1000" />
            </div>
            {depositMethod === 'upi' && (
              <div className="input-group">
                <label>UPI ID</label>
                <input type="text" className="input-field" placeholder="user@paytm" />
              </div>
            )}
            {depositMethod === 'card' && (
              <div className="input-group">
                <label>Card Number</label>
                <input type="text" className="input-field" placeholder="XXXX XXXX XXXX XXXX" />
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
            {[500, 1000, 2000, 5000].map(amount => (
              <button key={amount} className="btn btn-sm btn-secondary">₹{amount}</button>
            ))}
          </div>
          <button className="btn btn-primary btn-lg w-full">Deposit Now</button>
        </div>
      )}

      {/* Transaction History */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--space-lg) var(--space-xl)', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontWeight: 700 }}>Transaction History</h3>
        </div>
        <table className="data-table" id="transaction-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>ID</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(txn => (
              <tr key={txn.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {typeIcons[txn.type]}
                    <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{txn.type}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>{txn.id}</td>
                <td>{txn.method}</td>
                <td style={{
                  fontWeight: 700,
                  color: txn.type === 'deposit' || txn.type === 'win' ? 'var(--accent-green)' : txn.type === 'withdraw' || txn.type === 'bet' ? 'var(--accent-red)' : 'var(--text-primary)'
                }}>
                  {txn.type === 'deposit' || txn.type === 'win' ? '+' : '−'}₹{txn.amount.toLocaleString()}
                </td>
                <td>
                  <span className={`badge badge-${txn.status === 'completed' ? 'won' : 'pending'}`}>
                    {txn.status}
                  </span>
                </td>
                <td style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                  {new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
