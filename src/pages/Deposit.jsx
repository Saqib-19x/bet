import { useEffect, useMemo, useState } from 'react';
import { Copy, Check, Landmark, Smartphone } from 'lucide-react';
import { wallet as walletApi } from '../api/client';
import AuthImage from '../components/AuthImage';

const money = (n) => Number(n ?? 0).toLocaleString('en-IN', {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
});

const NOTES = [
  'Deposit money only into the accounts listed below to get the fastest credit and avoid delays.',
  'The site is not responsible for money deposited to old, inactive or closed accounts.',
  'After depositing, enter your UTR and the exact amount to receive your balance.',
  'NEFT receiving time varies from 40 minutes to 2 hours.',
  'If account details change while you are paying, the payment stays valid for 1 hour.',
];

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard is blocked on insecure origins — the value is still visible.
    }
  };
  return (
    <div className="xc-dep-row">
      <span><b>{label} :</b> {value}</span>
      <button type="button" onClick={copy} aria-label={`Copy ${label}`} className="xc-dep-copy">
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
}

export default function Deposit() {
  const [accounts, setAccounts] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [utr, setUtr] = useState('');
  const [amount, setAmount] = useState('');
  const [proof, setProof] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [history, setHistory] = useState([]);
  const [reqId, setReqId] = useState(0);

  useEffect(() => {
    let alive = true;
    Promise.all([
      walletApi.paymentAccounts().catch(() => ({ accounts: [] })),
      walletApi.transactions({ type: 'deposit', limit: 50 }).catch(() => ({ transactions: [] })),
    ]).then(([accRes, txRes]) => {
      if (!alive) return;
      const list = accRes.accounts || [];
      setAccounts(list);
      setActiveId((prev) => prev ?? list[0]?._id ?? null);
      setHistory(txRes.transactions || []);
    }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [reqId]);

  const account = useMemo(
    () => accounts.find((a) => a._id === activeId) || null,
    [accounts, activeId]
  );

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!account) return setError('Select an account to deposit into.');
    if (!proof) return setError('Upload your payment proof — it is required.');
    const amt = Number(amount);
    if (!amt || amt < account.minAmount || amt > account.maxAmount) {
      return setError(`Amount must be between ₹${account.minAmount} and ₹${account.maxAmount}.`);
    }
    if (!agreed) return setError('Please accept the payment and withdrawal policy.');

    setSubmitting(true);
    try {
      await walletApi.depositRequest({
        amount: amt,
        paymentAccountId: account._id,
        utr: utr.trim(),
        proof,
      });
      setSuccess('Deposit request submitted. Your balance updates once an admin approves it.');
      setUtr(''); setAmount(''); setProof(null); setAgreed(false);
      setReqId((n) => n + 1); // refresh the history table
    } catch (err) {
      setError(err.message || 'Could not submit deposit request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="xc-page xc-panel">
      <div className="xc-panel-head">Deposit</div>

      <div className="xc-dep-layout">
        <div>
          {/* Account selector */}
          <div className="xc-dep-tabs">
            {accounts.map((a) => (
              <button
                key={a._id}
                type="button"
                className={`xc-dep-tab${a._id === activeId ? ' active' : ''}`}
                onClick={() => { setActiveId(a._id); setError(''); setSuccess(''); }}
              >
                <span>{a.label}</span>
                {a.type === 'upi' ? <Smartphone size={26} /> : <Landmark size={26} />}
              </button>
            ))}
          </div>

          {loading && <div className="xc-grid-empty">Loading payment accounts…</div>}
          {!loading && accounts.length === 0 && (
            <div className="xc-grid-empty">
              No deposit accounts are active right now. Please check back shortly.
            </div>
          )}

          {account && (
            <div className="xc-dep-card">
              <h3 className="xc-dep-title">
                {account.type === 'upi' ? 'UPI' : 'Bank Account'}
              </h3>

              <div className="xc-dep-cols">
                <div className="xc-dep-details">
                  {account.type === 'bank' ? (
                    <>
                      <CopyField label="Bank Name" value={account.bankName} />
                      <CopyField label="A/C No" value={account.accountNumber} />
                      <CopyField label="IFSC Code" value={account.ifsc} />
                      <CopyField label="Account Name" value={account.accountName} />
                    </>
                  ) : (
                    <>
                      <CopyField label="Name" value={account.upiName} />
                      <CopyField label="UPI ID" value={account.upiId} />
                    </>
                  )}
                  <div className="xc-dep-row"><span><b>Min Amount :</b> {account.minAmount}</span></div>
                  <div className="xc-dep-row"><span><b>Max Amount :</b> {account.maxAmount}</span></div>

                  {account.qrFileId && (
                    <div className="xc-dep-qr">
                      <AuthImage fileId={account.qrFileId} alt={`${account.label} payment QR code`} />
                    </div>
                  )}
                </div>

                <form className="xc-dep-form" onSubmit={submit}>
                  {error && <div className="xc-dep-error">{error}</div>}
                  {success && <div className="xc-dep-success">{success}</div>}

                  <label className="xc-dep-label">
                    Unique Transaction Reference <span className="xc-req">*</span>
                  </label>
                  <input
                    className="xc-input xc-dep-input"
                    placeholder="6 to 12 Digit UTR Number"
                    value={utr}
                    onChange={(e) => setUtr(e.target.value)}
                    required
                  />

                  <label className="xc-dep-label">
                    Upload Your Payment Proof <span className="xc-req">[Required]</span>
                  </label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/heic"
                    onChange={(e) => setProof(e.target.files?.[0] || null)}
                    className="xc-dep-file"
                    required
                  />

                  <label className="xc-dep-label">Amount <span className="xc-req">*</span></label>
                  <input
                    type="number"
                    className="xc-input xc-dep-input"
                    min={account.minAmount}
                    max={account.maxAmount}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`${account.minAmount} – ${account.maxAmount}`}
                    required
                  />

                  <label className="xc-dep-terms">
                    <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                    <span>I have read and agree with the terms of payment and withdrawal policy.</span>
                  </label>

                  <button type="submit" className="xc-dep-submit" disabled={submitting}>
                    {submitting ? 'SUBMITTING…' : 'SUBMIT'}
                  </button>
                </form>
              </div>
            </div>
          )}

          <ol className="xc-dep-notes">
            {NOTES.map((n) => <li key={n}>{n}</li>)}
          </ol>
        </div>

        {/* Deposit request history */}
        <div className="xc-dep-history">
          <table className="xc-grid">
            <thead>
              <tr>
                <th>Transaction No</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((t) => (
                <tr key={t._id}>
                  <td>{t.utr || t.reference || '—'}</td>
                  <td>{money(t.amount)}</td>
                  <td>
                    <span className={`xc-status xc-status-${t.status}`}>
                      {t.status === 'completed' ? 'APPROVED'
                        : t.status === 'failed' || t.status === 'cancelled' ? 'REJECT'
                        : 'PENDING'}
                    </span>
                  </td>
                  <td>{new Date(t.createdAt).toLocaleString('en-IN', { hour12: true })}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {history.length === 0 && <div className="xc-grid-empty">No deposit requests yet.</div>}
        </div>
      </div>
    </div>
  );
}
