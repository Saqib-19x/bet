// Shared date helpers. Kept out of component files so fast-refresh keeps
// working (a module that exports both components and constants loses it).

export function fmtTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

export const isoDay = (d) => d.toISOString().slice(0, 10);

// Evaluated once at module load — these only seed the default filter range,
// so they don't need to track the clock, and computing them during render
// would make the component impure.
export const TODAY = isoDay(new Date());
export const DAYS_AGO = (n) => isoDay(new Date(Date.now() - n * 864e5));
