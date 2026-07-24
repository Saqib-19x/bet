import { useEffect, useState } from 'react';
import client from '../api/client';

/**
 * <img> for endpoints behind auth. The browser won't attach the JWT to a plain
 * src, so the bytes are fetched through the axios client (which does) and
 * handed to the tag as an object URL.
 */
export default function AuthImage({ fileId, alt, className, style }) {
  const [src, setSrc] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!fileId) return undefined;
    let url = null;
    let alive = true;

    client.get(`/uploads/${fileId}`, { responseType: 'blob' })
      .then((res) => {
        if (!alive) return;
        url = URL.createObjectURL(res.data);
        setSrc(url);
      })
      .catch(() => { if (alive) setFailed(true); });

    return () => {
      alive = false;
      // Object URLs leak the blob until revoked.
      if (url) URL.revokeObjectURL(url);
    };
  }, [fileId]);

  if (failed) return <div className="xc-qr-missing">Image unavailable</div>;
  if (!src) return <div className="xc-qr-missing">Loading…</div>;
  return <img src={src} alt={alt} className={className} style={style} />;
}
