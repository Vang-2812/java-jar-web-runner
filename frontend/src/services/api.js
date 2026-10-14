const STORAGE_KEY = 'j2me_runner_backend_url';

export function getBackendUrl() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved.trim().replace(/\/+$/, '');
  }
  return (import.meta.env.VITE_BACKEND_URL || 'http://localhost:7860').replace(/\/+$/, '');
}

export function setBackendUrl(url) {
  const clean = url.trim().replace(/\/+$/, '');
  localStorage.setItem(STORAGE_KEY, clean);
  return clean;
}

export async function checkBackendHealth() {
  const base = getBackendUrl();
  const res = await fetch(`${base}/api/health`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchGames() {
  const base = getBackendUrl();
  const res = await fetch(`${base}/api/games`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function uploadGameFile(file) {
  const base = getBackendUrl();
  const formData = new FormData();
  formData.append('game', file);

  const res = await fetch(`${base}/api/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Upload thất bại: HTTP ${res.status}`);
  }
  return res.json();
}

export async function startSession(jarPath, gameName) {
  const base = getBackendUrl();
  const res = await fetch(`${base}/api/session/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jarPath, gameName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Khởi động game thất bại: HTTP ${res.status}`);
  }
  return res.json();
}

export async function stopSession() {
  const base = getBackendUrl();
  const res = await fetch(`${base}/api/session/stop`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Dừng game thất bại: HTTP ${res.status}`);
  return res.json();
}

export async function fetchSessionStatus() {
  const base = getBackendUrl();
  const res = await fetch(`${base}/api/session/status`);
  if (!res.ok) throw new Error(`Lấy trạng thái thất bại: HTTP ${res.status}`);
  return res.json();
}
