import { getBackendUrl } from './api';

export async function startNsoBot(config) {
  const base = getBackendUrl();
  const res = await fetch(`${base}/api/nso/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Lỗi bật bot: HTTP ${res.status}`);
  }
  return res.json();
}

export async function stopNsoBot() {
  const base = getBackendUrl();
  const res = await fetch(`${base}/api/nso/stop`, { method: 'POST' });
  if (!res.ok) throw new Error(`Lỗi dừng bot: HTTP ${res.status}`);
  return res.json();
}

export async function fetchNsoStatus() {
  const base = getBackendUrl();
  const res = await fetch(`${base}/api/nso/status`);
  if (!res.ok) throw new Error(`Lỗi lấy trạng thái: HTTP ${res.status}`);
  return res.json();
}

export function getNsoSnapshotUrl() {
  const base = getBackendUrl();
  return `${base}/api/nso/snapshot?t=${Date.now()}`;
}
