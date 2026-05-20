import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, Tv, X, PictureInPicture2, Maximize2 } from 'lucide-react';

/**
 * Normalize common stream URLs to their embeddable form.
 * Returns { embedUrl, embeddable, openUrl, kind } where:
 *  - embedUrl: URL suitable for <iframe src>
 *  - embeddable: false when the source blocks embedding (Hotstar, JioCinema, etc.)
 *  - openUrl: where to send the user on the "Open in new tab" fallback
 *  - kind: 'youtube' | 'youtube-live' | 'fancode' | 'hls' | 'iframe' | 'external'
 */
function normalizeStreamUrl(raw) {
  if (!raw) return null;
  const url = raw.trim();
  if (!url) return null;

  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '').toLowerCase();

    // YouTube — watch / live / youtu.be / shorts → /embed/<id>
    if (host === 'youtube.com' || host === 'youtu.be' || host === 'm.youtube.com') {
      let id = null;
      if (host === 'youtu.be') {
        id = u.pathname.slice(1);
      } else if (u.pathname.startsWith('/watch')) {
        id = u.searchParams.get('v');
      } else if (u.pathname.startsWith('/live/')) {
        id = u.pathname.split('/live/')[1];
      } else if (u.pathname.startsWith('/embed/')) {
        id = u.pathname.split('/embed/')[1];
      } else if (u.pathname.startsWith('/shorts/')) {
        id = u.pathname.split('/shorts/')[1];
      }
      if (id) {
        const cleanId = id.split('?')[0].split('/')[0];
        return {
          embedUrl: `https://www.youtube.com/embed/${cleanId}?autoplay=1&mute=1`,
          embeddable: true,
          openUrl: url,
          kind: 'youtube',
        };
      }
    }

    // Hotstar / JioCinema / JioHotstar — deep-link only, no embed
    if (host.includes('hotstar') || host.includes('jiocinema') || host.includes('jio.com')) {
      return { embedUrl: null, embeddable: false, openUrl: url, kind: 'external' };
    }

    // Direct HLS / MP4 — could be wrapped in a <video> tag
    if (/\.(m3u8|mp4|webm)(\?|$)/i.test(u.pathname)) {
      return { embedUrl: url, embeddable: true, openUrl: url, kind: 'hls' };
    }

    // FanCode / arbitrary — try as iframe, fall back to external if blocked
    return { embedUrl: url, embeddable: true, openUrl: url, kind: 'iframe' };
  } catch {
    return null;
  }
}

export default function StreamPlayer({
  url,
  provider,
  matchTitle,
  onClose,
  mode: modeProp,
  onModeChange,
}) {
  const parsed = useMemo(() => normalizeStreamUrl(url), [url]);
  const [collapsed, setCollapsed] = useState(false);
  const [iframeFailed, setIframeFailed] = useState(false);
  const [modeInternal, setModeInternal] = useState('inline'); // 'inline' | 'pip'
  const mode = modeProp !== undefined ? modeProp : modeInternal;
  const setMode = (next) => {
    if (onModeChange) onModeChange(next);
    else setModeInternal(next);
  };

  if (!parsed) return null;

  if (collapsed) {
    return (
      <div
        onClick={() => setCollapsed(false)}
        style={{
          background: 'linear-gradient(135deg, rgba(255,0,0,0.10), rgba(255,82,82,0.05))',
          border: '1px solid rgba(255,82,82,0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          marginBottom: 'var(--space-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
        }}
      >
        <div style={{
          display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
          background: '#ff5252', animation: 'pulse 1.5s infinite',
        }} />
        <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>Live stream available</span>
        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
          (click to expand)
        </span>
      </div>
    );
  }

  const isPip = mode === 'pip';
  const containerStyle = isPip
    ? {
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: 360,
        background: '#000',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
        zIndex: 90,
      }
    : {
        background: '#000',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        position: 'relative',
        width: '100%',
      };

  const playerNode = (
    <div style={containerStyle}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 14px',
        background: 'rgba(0,0,0,0.7)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <Tv size={14} style={{ color: 'var(--accent-red)', flexShrink: 0 }} />
          <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>
            LIVE
          </span>
          {provider && !isPip && (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>· {provider}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setMode(isPip ? 'inline' : 'pip')}
            title={isPip ? 'Dock back inline' : 'Pin to corner'}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 22, height: 22, borderRadius: 4,
              background: 'rgba(255,255,255,0.06)', border: 'none',
              color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
            }}
          >
            {isPip ? <Maximize2 size={11} /> : <PictureInPicture2 size={11} />}
          </button>
          <a
            href={parsed.openUrl}
            target="_blank"
            rel="noreferrer noopener"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 11, color: 'rgba(255,255,255,0.7)',
              padding: '4px 8px', borderRadius: 4,
              background: 'rgba(255,255,255,0.06)',
            }}
          >
            <ExternalLink size={11} /> Open
          </a>
          <button
            onClick={() => setCollapsed(true)}
            title="Minimise"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 22, height: 22, borderRadius: 4,
              background: 'rgba(255,255,255,0.06)', border: 'none',
              color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
            }}
          >
            <X size={12} />
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
        {!parsed.embeddable || iframeFailed ? (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 12, padding: 'var(--space-xl)', textAlign: 'center',
          }}>
            <Tv size={36} style={{ color: 'rgba(255,255,255,0.4)' }} />
            <div>
              <div style={{ fontSize: 'var(--font-md)', fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                {parsed.embeddable === false
                  ? 'This stream cannot be embedded'
                  : 'Stream failed to load'}
              </div>
              <div style={{ fontSize: 'var(--font-sm)', color: 'rgba(255,255,255,0.5)' }}>
                {parsed.embeddable === false
                  ? `Open ${provider || 'the source'} in a new tab to watch ${matchTitle || 'the match'}.`
                  : 'The source may be down. Try opening it directly.'}
              </div>
            </div>
            <a
              href={parsed.openUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <ExternalLink size={14} /> Watch on {provider || 'source'}
            </a>
          </div>
        ) : parsed.kind === 'hls' ? (
          <video
            src={parsed.embedUrl}
            controls
            autoPlay
            muted
            playsInline
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              background: '#000',
            }}
          />
        ) : (
          <iframe
            src={parsed.embedUrl}
            title={matchTitle || 'Live stream'}
            onError={() => setIframeFailed(true)}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              border: 'none', background: '#000',
            }}
          />
        )}
      </div>
    </div>
  );

  // PiP must escape the page transform stacking context, otherwise position:fixed
  // anchors to the .animate-fade-in ancestor instead of the viewport.
  return isPip ? createPortal(playerNode, document.body) : playerNode;
}
