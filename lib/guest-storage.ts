// SSR-safe versioned localStorage helpers for guest-mode progress snapshots.
// Signed-in users never touch these — persistence goes through the DB for them.

const NS = "imtehan.guest";
const VERSION = 1;

function key(kind: string, id: string): string {
  return `${NS}.${kind}.v${VERSION}.${id}`;
}

export function readSnapshot<T>(kind: string, id: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key(kind, id));
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeSnapshot<T>(kind: string, id: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(kind, id), JSON.stringify(data));
  } catch {
    // Quota exceeded or storage disabled — silently drop.
  }
}

export function clearSnapshot(kind: string, id: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key(kind, id));
  } catch {
    // No-op.
  }
}
