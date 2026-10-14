import React, { useState } from 'react';
import { Play, Shield, Eye, EyeOff, Server, MapPin, Sparkles, AlertCircle } from 'lucide-react';

const SERVERS = [
  { id: '1', name: 'Server 1 - Bokken' },
  { id: '2', name: 'Server 2 - Shuriken' },
  { id: '3', name: 'Server 3 - Tessen' },
  { id: '4', name: 'Server 4 - Kunai' },
  { id: '5', name: 'Server 5 - Katana' },
  { id: '6', name: 'Server 6 - Tone' },
  { id: '7', name: 'Server 7 - Sanzu' },
];

export default function NsoConfigForm({ onStart, isLoading }) {
  const [username, setUsername] = useState(() => localStorage.getItem('nso_username') || '');
  const [password, setPassword] = useState('');
  const [server, setServer] = useState(() => localStorage.getItem('nso_server') || '1');
  const [map, setMap] = useState(() => localStorage.getItem('nso_map') || '22');
  const [zone, setZone] = useState(() => localStorage.getItem('nso_zone') || '5');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  // Auto options
  const [options, setOptions] = useState({
    autoAttack: true,
    autoPick: true,
    autoFood: true,
    autoRevive: true,
    autoRejoin: true,
  });

  const handleToggleOption = (key) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Vui lòng nhập tài khoản Ninja School');
      return;
    }
    setError(null);

    // Lưu lại cài đặt ngoại trừ mật khẩu để người dùng tiện sử dụng lại
    localStorage.setItem('nso_username', username.trim());
    localStorage.setItem('nso_server', server);
    localStorage.setItem('nso_map', map);
    localStorage.setItem('nso_zone', zone);

    onStart({
      username: username.trim(),
      password,
      server,
      map,
      zone,
      options,
    });
  };

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700/60">
        <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-500/30 text-amber-400">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Cấu Hình Treo NSO 24/7
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
              Headless 0.1% CPU
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Tự động đăng nhập, train quái liên tục không cần treo tab trình duyệt
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tài khoản & Mật khẩu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Tài Khoản (Username)
            </label>
            <input
              type="text"
              required
              placeholder="VD: ninjaxx123"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white placeholder-slate-500 text-sm outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Mật Khẩu (Password)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu game"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-900/80 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white placeholder-slate-500 text-sm outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Server & Map & Khu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-amber-400" /> Server Game
            </label>
            <select
              value={server}
              onChange={(e) => setServer(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 focus:border-amber-500 text-white text-sm outline-none transition"
            >
              {SERVERS.map(srv => (
                <option key={srv.id} value={srv.id}>
                  {srv.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-400" /> ID Map Cày
            </label>
            <input
              type="text"
              placeholder="VD: 22"
              value={map}
              onChange={(e) => setMap(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 focus:border-blue-500 text-white placeholder-slate-500 text-sm outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Khu (Zone)
            </label>
            <input
              type="number"
              min="0"
              max="29"
              placeholder="0 - 29"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 focus:border-blue-500 text-white placeholder-slate-500 text-sm outline-none transition"
            />
          </div>
        </div>

        {/* Tùy chọn Auto nâng cao */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Tùy Chọn Auto Mod
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            {[
              { id: 'autoAttack', label: 'Tự đánh quái' },
              { id: 'autoPick', label: 'Tự nhặt đồ/yên' },
              { id: 'autoFood', label: 'Tự ăn thức ăn' },
              { id: 'autoRevive', label: 'Tự hồi sinh' },
              { id: 'autoRejoin', label: 'Tự vào lại khu' },
            ].map(({ id, label }) => (
              <label
                key={id}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/40 border border-slate-700/60 hover:border-slate-600 cursor-pointer select-none transition"
              >
                <input
                  type="checkbox"
                  checked={options[id]}
                  onChange={() => handleToggleOption(id)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-400 h-4 w-4 bg-slate-900"
                />
                <span className="text-slate-300">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Nút hành động */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 hover:from-amber-500 hover:to-orange-500 shadow-lg shadow-orange-950/40 border border-amber-400/30 flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Play className="w-5 h-5 fill-current text-amber-200 group-hover:scale-110 transition-transform" />
                <span>Bắt Đầu Treo NSO 24/7 (Headless)</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
