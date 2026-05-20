import { useEffect, useState } from 'react';
import { Save, RefreshCw, Trash2, Pause, Play, Award, Plus, Download, Eraser, Zap, Tv, FileText, Users, MessageSquare, Send } from 'lucide-react';
import { matches as matchesApi, admin as adminApi } from '../../api/client';

export default function OddsManagement() {
  const [allMatches, setAllMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [markets, setMarkets] = useState([]);
  const [drafts, setDrafts] = useState({}); // { marketId: [{label, odds}] }
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingMarket, setSavingMarket] = useState(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  const loadMatches = async () => {
    try {
      const res = await matchesApi.list({ limit: 100 });
      const list = res.matches || [];
      setAllMatches(list);
      if (list.length && !selectedMatchId) {
        const firstOpen = list.find((m) => m.status !== 'completed');
        if (firstOpen) setSelectedMatchId(firstOpen._id);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const loadMarkets = async (matchId) => {
    if (!matchId) return;
    setLoading(true);
    setError('');
    try {
      const data = await matchesApi.detail(matchId);
      setMarkets(data.markets || []);
      const initialDrafts = {};
      (data.markets || []).forEach((m) => {
        initialDrafts[m._id] = m.options.map((o) => ({ _id: o._id, label: o.label, odds: o.odds }));
      });
      setDrafts(initialDrafts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMatches(); }, []);
  useEffect(() => { loadMarkets(selectedMatchId); }, [selectedMatchId]);

  useEffect(() => {
    const match = allMatches.find((m) => m._id === selectedMatchId);
    if (!match) return;
    adminApi.marketTemplates(match.sport).then((res) => setTemplates(res.templates || [])).catch(() => {});
  }, [selectedMatchId, allMatches]);

  const updateOddsDraft = (marketId, optIdx, value) => {
    setDrafts((prev) => ({
      ...prev,
      [marketId]: prev[marketId].map((o, i) => (i === optIdx ? { ...o, odds: parseFloat(value) || 0 } : o)),
    }));
  };

  const saveMarket = async (market) => {
    setSavingMarket(market._id);
    setError('');
    setInfo('');
    try {
      const options = drafts[market._id].map(({ label, odds }) => ({ label, odds }));
      const res = await adminApi.updateMarket(market._id, { options });
      setMarkets((prev) => prev.map((m) => (m._id === market._id ? res.market : m)));
      setInfo(`Saved odds for "${market.name}".`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingMarket(null);
    }
  };

  const toggleSuspend = async (market) => {
    try {
      const res = await adminApi.toggleSuspend(market._id);
      setMarkets((prev) => prev.map((m) => (m._id === market._id ? res.market : m)));
    } catch (err) {
      setError(err.message);
    }
  };

  const settle = async (market) => {
    const options = market.options.map((o, i) => `${i}: ${o.label}`).join('\n');
    const input = window.prompt(`Pick winning option index for "${market.name}":\n${options}`);
    if (input === null) return;
    const idx = parseInt(input, 10);
    if (Number.isNaN(idx)) return;
    try {
      const res = await adminApi.settleMarket(market._id, { winningOptionIndex: idx });
      setInfo(`Settled: ${res.message}. Winners: ${res.results?.totalWinners}, Payouts: ₹${res.results?.totalPayouts}`);
      loadMarkets(selectedMatchId);
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteMarket = async (market) => {
    if (!window.confirm(`Delete "${market.name}" and refund all open bets?`)) return;
    try {
      await adminApi.deleteMarket(market._id);
      setMarkets((prev) => prev.filter((m) => m._id !== market._id));
      setInfo('Market deleted and bets refunded.');
    } catch (err) {
      setError(err.message);
    }
  };

  const createFromTemplate = async (template) => {
    const name = window.prompt('Market name:', template.name);
    if (!name) return;
    const options = template.options.map((label) => {
      const odds = parseFloat(window.prompt(`Odds for "${label}":`, '2.00'));
      return { label, odds };
    });
    if (options.some((o) => !o.odds)) return;
    try {
      const res = await adminApi.createMarket(selectedMatchId, {
        type: template.type,
        name,
        options,
        isFancy: template.isFancy || false,
      });
      setMarkets((prev) => [...prev, res.market]);
      setDrafts((prev) => ({ ...prev, [res.market._id]: res.market.options.map((o) => ({ _id: o._id, label: o.label, odds: o.odds })) }));
      setInfo(`Created market (overround ${res.overround}%).`);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchCricket = async () => {
    setInfo('');
    setError('');
    try {
      const res = await adminApi.fetchScraper();
      const r = res.result || {};
      setInfo(`Synced ${r.synced || 0} matches (${r.created || 0} new, ${r.updated || 0} updated, ${r.marketsCreated || 0} auto-markets).`);
      loadMatches();
    } catch (err) {
      setError(err.message);
    }
  };

  const cleanupManual = async () => {
    if (!window.confirm('Delete all seed/manual matches (non-IPL feed) and refund any open bets?')) return;
    setInfo('');
    setError('');
    try {
      const res = await adminApi.deleteManualMatches();
      setInfo(`Removed ${res.deleted} manual matches (${res.marketsCancelled} markets cancelled & refunded).`);
      setSelectedMatchId('');
      setMarkets([]);
      loadMatches();
    } catch (err) {
      setError(err.message);
    }
  };

  const refreshOdds = async () => {
    setInfo('');
    setError('');
    try {
      const res = await adminApi.refreshBookmakerOdds();
      const r = res.result || {};
      setInfo(`Bookmaker odds: ${r.updated || 0} markets updated from ${r.total || 0} live IPL fixtures (${r.missed || 0} unmatched).`);
      if (selectedMatchId) loadMarkets(selectedMatchId);
    } catch (err) {
      setError(err.message);
    }
  };

  const [commentaryDraft, setCommentaryDraft] = useState('');
  const [postingCommentary, setPostingCommentary] = useState(false);

  const postCommentary = async () => {
    if (!commentaryDraft.trim() || !selectedMatchId) return;
    setPostingCommentary(true);
    setError('');
    setInfo('');
    try {
      await adminApi.postCommentary(selectedMatchId, commentaryDraft.trim());
      setInfo('Posted to match feed.');
      setCommentaryDraft('');
    } catch (err) {
      setError(err.message);
    } finally {
      setPostingCommentary(false);
    }
  };

  const refreshSquad = async () => {
    if (!selectedMatchId) return;
    setInfo('');
    setError('');
    try {
      const res = await adminApi.refreshSquad(selectedMatchId);
      setInfo(`Squad pulled: ${res.squad.teamA} + ${res.squad.teamB} players. ${res.marketsCreated} new player market(s).`);
      loadMatches();
      loadMarkets(selectedMatchId);
    } catch (err) {
      setError(err.message);
    }
  };

  const visibleMatches = allMatches.filter((m) => showCompleted || m.status !== 'completed');
  const selectedMatch = allMatches.find((m) => m._id === selectedMatchId);

  const [streamDraft, setStreamDraft] = useState({ streamUrl: '', streamProvider: '' });
  const [savingStream, setSavingStream] = useState(false);
  const [previewDraft, setPreviewDraft] = useState({ pitchReport: '', weather: '', notes: '' });
  const [savingPreview, setSavingPreview] = useState(false);

  useEffect(() => {
    if (selectedMatch) {
      setStreamDraft({
        streamUrl: selectedMatch.streamUrl || '',
        streamProvider: selectedMatch.streamProvider || '',
      });
      setPreviewDraft({
        pitchReport: selectedMatch.preview?.pitchReport || '',
        weather: selectedMatch.preview?.weather || '',
        notes: selectedMatch.preview?.notes || '',
      });
    }
  }, [selectedMatch?._id]);

  const savePreview = async () => {
    setSavingPreview(true);
    setError('');
    setInfo('');
    try {
      const res = await adminApi.updateMatch(selectedMatchId, { preview: previewDraft });
      setAllMatches((prev) => prev.map((m) => (m._id === selectedMatchId ? res.match : m)));
      setInfo('Match preview saved.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingPreview(false);
    }
  };

  const saveStream = async () => {
    setSavingStream(true);
    setError('');
    setInfo('');
    try {
      const res = await adminApi.setMatchStream(selectedMatchId, streamDraft);
      setAllMatches((prev) => prev.map((m) => (m._id === selectedMatchId ? res.match : m)));
      setInfo(streamDraft.streamUrl ? 'Stream URL saved.' : 'Stream URL cleared.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingStream(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Odds & Markets</h1>
      <p className="page-subtitle">Pick a match, manage its markets, set odds, and settle results</p>

      {error && <div style={{ marginBottom: 'var(--space-md)', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'rgba(244,67,54,0.1)', color: '#f44336' }}>{error}</div>}
      {info && <div style={{ marginBottom: 'var(--space-md)', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'rgba(0,230,118,0.1)', color: 'var(--accent-green)' }}>{info}</div>}

      <div className="admin-toolbar" style={{ flexWrap: 'wrap' }}>
        <select
          className="input-field"
          style={{ maxWidth: 400 }}
          value={selectedMatchId}
          onChange={(e) => setSelectedMatchId(e.target.value)}
        >
          <option value="">— Select match —</option>
          {visibleMatches.map((m) => (
            <option key={m._id} value={m._id}>
              [{m.status}] {m.teamA?.name} vs {m.teamB?.name} — {m.league}
            </option>
          ))}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={showCompleted} onChange={(e) => setShowCompleted(e.target.checked)} />
          Show completed
        </label>
        <button className="btn btn-secondary" onClick={() => loadMarkets(selectedMatchId)} disabled={!selectedMatchId || loading}>
          <RefreshCw size={14} /> Reload
        </button>
        <button className="btn btn-secondary" onClick={fetchCricket}>
          <Download size={14} /> Pull Cricket Feed
        </button>
        <button className="btn btn-secondary" style={{ color: 'var(--accent-yellow)' }} onClick={refreshOdds}>
          <Zap size={14} /> Refresh Bookmaker Odds
        </button>
        <button className="btn btn-secondary" onClick={refreshSquad} disabled={!selectedMatchId}>
          <Users size={14} /> Refresh Squad
        </button>
        <button className="btn btn-secondary" style={{ color: '#f44336' }} onClick={cleanupManual}>
          <Eraser size={14} /> Clear Seed Matches
        </button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-secondary)' }}>Loading markets…</div>
      ) : !selectedMatchId ? (
        <div className="card" style={{ color: 'var(--text-secondary)' }}>Select a match above to manage its markets.</div>
      ) : (
        <>
          {/* Live stream URL */}
          {selectedMatch && (
            <div className="card" style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-md) var(--space-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Tv size={16} style={{ color: 'var(--accent-red)' }} />
                <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  Live Stream
                </h3>
                {selectedMatch.streamUrl && (
                  <span style={{
                    fontSize: 10, padding: '2px 6px', borderRadius: 4,
                    background: 'rgba(0,230,118,0.15)', color: 'var(--accent-green)', fontWeight: 700,
                  }}>ACTIVE</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Stream URL — YouTube live, FanCode, HLS .m3u8, etc."
                  value={streamDraft.streamUrl}
                  onChange={(e) => setStreamDraft((d) => ({ ...d, streamUrl: e.target.value }))}
                  style={{ flex: '2 1 360px' }}
                />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Provider label (optional)"
                  value={streamDraft.streamProvider}
                  onChange={(e) => setStreamDraft((d) => ({ ...d, streamProvider: e.target.value }))}
                  style={{ flex: '1 1 160px' }}
                />
                <button className="btn btn-primary" onClick={saveStream} disabled={savingStream}>
                  <Save size={14} /> {savingStream ? 'Saving…' : 'Save'}
                </button>
                {selectedMatch.streamUrl && (
                  <button
                    className="btn btn-secondary"
                    style={{ color: '#f44336' }}
                    onClick={() => { setStreamDraft({ streamUrl: '', streamProvider: '' }); }}
                  >
                    <Trash2 size={14} /> Clear
                  </button>
                )}
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}>
                YouTube watch/live URLs auto-convert to embed. Hotstar / JioCinema can't be embedded — paste their URL and the player shows an "Open" button instead.
              </p>
            </div>
          )}

          {/* Pre-match preview */}
          {selectedMatch && (
            <div className="card" style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-md) var(--space-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <FileText size={16} style={{ color: 'var(--accent-blue)' }} />
                <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  Pre-match Preview
                </h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
                <div className="input-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: 11 }}>Pitch report</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Flat track, expect 180+"
                    value={previewDraft.pitchReport}
                    onChange={(e) => setPreviewDraft((d) => ({ ...d, pitchReport: e.target.value }))}
                  />
                </div>
                <div className="input-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: 11 }}>Weather</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="32°C, clear, dew expected after 8pm"
                    value={previewDraft.weather}
                    onChange={(e) => setPreviewDraft((d) => ({ ...d, weather: e.target.value }))}
                  />
                </div>
                <div className="input-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: 11 }}>Notes (key absentees, recent form, anything else)</label>
                  <textarea
                    rows={2}
                    className="input-field"
                    placeholder="Buttler unavailable, Maxwell back from injury, etc."
                    value={previewDraft.notes}
                    onChange={(e) => setPreviewDraft((d) => ({ ...d, notes: e.target.value }))}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <button className="btn btn-primary" onClick={savePreview} disabled={savingPreview}>
                  <Save size={14} /> {savingPreview ? 'Saving…' : 'Save Preview'}
                </button>
              </div>
            </div>
          )}

          {/* Match commentary box */}
          {selectedMatch && (
            <div className="card" style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-md) var(--space-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <MessageSquare size={16} style={{ color: 'var(--accent-green)' }} />
                <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  Live Commentary
                </h3>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                  posts in real-time to all viewers
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder='e.g. "SIX! Salt clears long-on" or "Strategic timeout — 12 overs done"'
                  value={commentaryDraft}
                  onChange={(e) => setCommentaryDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') postCommentary(); }}
                  style={{ flex: '1 1 360px' }}
                />
                <button
                  className="btn btn-primary"
                  onClick={postCommentary}
                  disabled={postingCommentary || !commentaryDraft.trim()}
                >
                  <Send size={14} /> {postingCommentary ? 'Posting…' : 'Post'}
                </button>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}>
                Auto-events (wickets, milestones, innings break, match end) post themselves from the scoreboard feed.
              </p>
            </div>
          )}

          {/* Templates */}
          {templates.length > 0 && (
            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-md)' }}>Add Market from Template</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                {templates.map((t) => (
                  <button key={t.type + t.name} className="btn btn-sm btn-secondary" onClick={() => createFromTemplate(t)}>
                    <Plus size={12} /> {t.name} {t.isFancy && <span style={{ color: 'var(--accent-yellow)' }}>★</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {markets.length === 0 ? (
            <div className="card" style={{ color: 'var(--text-secondary)' }}>No markets yet. Use a template above to create one.</div>
          ) : (
            <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
              {markets.map((market) => (
                <div key={market._id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                    <div>
                      <h3 style={{ fontWeight: 700 }}>
                        {market.name}
                        {market.isFancy && <span style={{ color: 'var(--accent-yellow)', marginLeft: 6 }}>★</span>}
                      </h3>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
                        Overround: <strong>{market.overround?.toFixed(2)}%</strong> ·
                        Total staked: ₹{market.totalStaked?.toLocaleString('en-IN') || 0} ·
                        Max exposure: ₹{market.maxExposure?.toLocaleString('en-IN') || 0}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                      <span className={`badge badge-${market.status === 'open' ? 'open' : market.status === 'suspended' ? 'pending' : 'lost'}`}>
                        {market.status}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-md)' }}>
                    {market.options.map((option, i) => (
                      <div key={option._id} style={{ padding: 'var(--space-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: 6 }}>{option.label}</div>
                        <input
                          type="number"
                          step="0.01"
                          min="1.01"
                          value={drafts[market._id]?.[i]?.odds ?? ''}
                          onChange={(e) => updateOddsDraft(market._id, i, e.target.value)}
                          className="input-field"
                          style={{ textAlign: 'center', fontWeight: 700, color: 'var(--accent-green)' }}
                          disabled={market.status === 'settled' || market.status === 'cancelled'}
                        />
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginTop: 4 }}>
                          {option.totalBets || 0} bets · ₹{(option.totalStaked || 0).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => saveMarket(market)}
                      disabled={savingMarket === market._id || market.status === 'settled' || market.status === 'cancelled'}
                    >
                      <Save size={12} /> {savingMarket === market._id ? 'Saving…' : 'Save Odds'}
                    </button>
                    {market.status !== 'settled' && market.status !== 'cancelled' && (
                      <button className="btn btn-sm btn-secondary" onClick={() => toggleSuspend(market)}>
                        {market.status === 'suspended' ? <><Play size={12} /> Resume</> : <><Pause size={12} /> Suspend</>}
                      </button>
                    )}
                    {market.status === 'open' || market.status === 'suspended' ? (
                      <button className="btn btn-sm btn-secondary" style={{ color: 'var(--accent-green)' }} onClick={() => settle(market)}>
                        <Award size={12} /> Settle
                      </button>
                    ) : null}
                    <button className="btn btn-sm btn-secondary" style={{ color: '#f44336' }} onClick={() => deleteMarket(market)}>
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
