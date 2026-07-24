import { useEffect, useState } from 'react';
import { Trash2, Pencil, Plus, X } from 'lucide-react';
import { admin as adminApi } from '../../api/client';
import AuthImage from '../../components/AuthImage';

const BLANK = {
  type: 'bank',
  label: '',
  bankName: '',
  accountNumber: '',
  ifsc: '',
  accountName: '',
  upiId: '',
  upiName: '',
  minAmount: 300,
  maxAmount: 50000,
  sortOrder: 0,
  active: true,
  notes: '',
};

export default function PaymentAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reqId, setReqId] = useState(0);

  const [form, setForm] = useState(null); // null = form closed
  const [editingId, setEditingId] = useState(null);
  const [qr, setQr] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    adminApi.paymentAccounts()
      .then((res) => { if (alive) setAccounts(res.accounts || []); })
      .catch((err) => { if (alive) setError(err.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [reqId]);

  const refresh = () => setReqId((n) => n + 1);

  const openNew = () => { setForm({ ...BLANK }); setEditingId(null); setQr(null); setError(''); };
  const openEdit = (a) => {
    setForm({ ...BLANK, ...a });
    setEditingId(a._id);
    setQr(null);
    setError('');
  };
  const close = () => { setForm(null); setEditingId(null); setQr(null); };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      // Multipart throughout so an optional QR image can ride along.
      const fd = new FormData();
      const fields = ['type', 'label', 'bankName', 'accountNumber', 'ifsc', 'accountName',
        'upiId', 'upiName', 'minAmount', 'maxAmount', 'sortOrder', 'active', 'notes'];
      fields.forEach((k) => fd.append(k, form[k] ?? ''));
      if (qr) fd.append('qr', qr);

      if (editingId) await adminApi.updatePaymentAccount(editingId, fd);
      else await adminApi.createPaymentAccount(fd);

      close();
      refresh();
    } catch (err) {
      setError(err.message || 'Could not save the account.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (a) => {
    setError('');
    try {
      const fd = new FormData();
      fd.append('active', String(!a.active));
      await adminApi.updatePaymentAccount(a._id, fd);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (a) => {
    // Deactivating keeps the audit trail for past deposits; deleting doesn't.
    const ok = window.confirm(
      `Delete "${a.label}" permanently?\n\nPast deposits that reference this account will lose their link to it. Deactivating it instead keeps that history intact.`
    );
    if (!ok) return;
    setError('');
    try {
      await adminApi.deletePaymentAccount(a._id);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="animate-fade-in xc-page xc-panel">
      <div className="xc-panel-head">Payment Accounts</div>

      <div className="xc-panel-body">
        {error && <div className="xc-dep-error">{error}</div>}

        {!form && (
          <button className="xc-submit" onClick={openNew} style={{ marginBottom: 14 }}>
            <Plus size={15} style={{ verticalAlign: '-2px' }} /> Add Account
          </button>
        )}

        {form && (
          <form className="xc-admin-form" onSubmit={save}>
            <div className="xc-admin-form-head">
              <b>{editingId ? 'Edit account' : 'New account'}</b>
              <button type="button" onClick={close} aria-label="Close"><X size={18} /></button>
            </div>

            <div className="xc-admin-grid">
              <label>Type
                <select className="xc-input" value={form.type} onChange={(e) => set('type', e.target.value)}>
                  <option value="bank">Bank</option>
                  <option value="upi">UPI</option>
                </select>
              </label>
              <label>Label (shown on the tab)
                <input className="xc-input" value={form.label} required
                  placeholder="ACCOUNT 1" onChange={(e) => set('label', e.target.value)} />
              </label>

              {form.type === 'bank' ? (
                <>
                  <label>Bank Name
                    <input className="xc-input" value={form.bankName} onChange={(e) => set('bankName', e.target.value)} />
                  </label>
                  <label>A/C No
                    <input className="xc-input" value={form.accountNumber} required
                      onChange={(e) => set('accountNumber', e.target.value)} />
                  </label>
                  <label>IFSC Code
                    <input className="xc-input" value={form.ifsc} onChange={(e) => set('ifsc', e.target.value)} />
                  </label>
                  <label>Account Name
                    <input className="xc-input" value={form.accountName} onChange={(e) => set('accountName', e.target.value)} />
                  </label>
                </>
              ) : (
                <>
                  <label>Name
                    <input className="xc-input" value={form.upiName} onChange={(e) => set('upiName', e.target.value)} />
                  </label>
                  <label>UPI ID
                    <input className="xc-input" value={form.upiId} required
                      placeholder="name@bank" onChange={(e) => set('upiId', e.target.value)} />
                  </label>
                  <label>QR image {editingId && form.qrFileId ? '(replaces current)' : '(optional)'}
                    <input type="file" accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => setQr(e.target.files?.[0] || null)} />
                  </label>
                  {form.qrFileId && (
                    <div className="xc-admin-qr">
                      <AuthImage fileId={form.qrFileId} alt="Current QR code" />
                    </div>
                  )}
                </>
              )}

              <label>Min Amount
                <input type="number" className="xc-input" value={form.minAmount} min={1}
                  onChange={(e) => set('minAmount', e.target.value)} />
              </label>
              <label>Max Amount
                <input type="number" className="xc-input" value={form.maxAmount} min={1}
                  onChange={(e) => set('maxAmount', e.target.value)} />
              </label>
              <label>Sort Order
                <input type="number" className="xc-input" value={form.sortOrder}
                  onChange={(e) => set('sortOrder', e.target.value)} />
              </label>
              <label className="xc-admin-check">
                <input type="checkbox" checked={!!form.active}
                  onChange={(e) => set('active', e.target.checked)} />
                Active (visible to users)
              </label>
            </div>

            <button type="submit" className="xc-submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save Account'}
            </button>
          </form>
        )}

        <table className="xc-grid">
          <thead>
            <tr>
              <th>Label</th>
              <th>Type</th>
              <th>Details</th>
              <th>Min</th>
              <th>Max</th>
              <th>Order</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a._id}>
                <td>{a.label}</td>
                <td>{a.type.toUpperCase()}</td>
                <td className="xc-left">
                  {a.type === 'bank'
                    ? `${a.bankName} · ${a.accountNumber} · ${a.ifsc}`
                    : `${a.upiName} · ${a.upiId}`}
                </td>
                <td>{a.minAmount}</td>
                <td>{a.maxAmount}</td>
                <td>{a.sortOrder}</td>
                <td>
                  <button className="xc-toggle" onClick={() => toggleActive(a)}>
                    {a.active ? 'ACTIVE' : 'INACTIVE'}
                  </button>
                </td>
                <td>
                  <button className="xc-icon-btn" onClick={() => openEdit(a)} aria-label="Edit">
                    <Pencil size={15} />
                  </button>
                  <button className="xc-icon-btn xc-icon-danger" onClick={() => remove(a)} aria-label="Delete">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && <div className="xc-grid-empty">Loading…</div>}
        {!loading && accounts.length === 0 && (
          <div className="xc-grid-empty">No payment accounts yet. Add one to enable deposits.</div>
        )}
      </div>
    </div>
  );
}
