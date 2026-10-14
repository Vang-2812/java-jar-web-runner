import React, { useState } from 'react';
import { Power, Camera, Clock, Server, Terminal, ShieldCheck, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import NsoSnapshotModal from './NsoSnapshotModal';

const SERVER_NAMES = {
  '1': 'Server 1 - Bokken',
  '2': 'Server 2 - Shuriken',
  '3': 'Server 3 - Tessen',
  '4': 'Server 4 - Kunai',
  '5': 'Server 5 - Katana',
  '6': 'Server 6 - Tone',
  '7': 'Server 7 - Sanzu',
};

function formatUptime(seconds = 0) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (d > 0) return `${d}d ${h}h ${m}m ${s}s`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

export default function NsoStatusCard({ status, onStop, onRefresh, isStopping }) {
  const [showSnapshot, setShowSnapshot] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const isRunning = !!status?.running;
  const serverName = SERVER_NAMES[status?.server] || `Server ${status?.server || 1}`;

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      {/* Header status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-3.5 h-3.5 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
            {isRunning && (
              <div className="absolute inset-0 w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-lg">
                {isRunning ? 'NSO Bot Đang Treo 24/7' : 'NSO Bot Đang Dừng'}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                isRunning ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-700 text-slate-300'
              }`}>
                {isRunning ? 'Headless Online' : 'Offline'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRunning
                ? 'Đang duy trì kết nối game liên tục trên Cloud Render (0.1% CPU)'
                : 'Nhấn Bắt Đầu Treo ở form bên dưới để kích hoạt'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isRunning && (
            <>
              <button
                onClick={() => setShowSnapshot(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-700/80 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-semibold text-white shadow-sm transition"
              >
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Xem Ảnh Màn Hình</span>
              </button>

              <button
                onClick={onStop}
                disabled={isStopping}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
              >
                <Power className="w-4 h-4" />
                <span>{isStopping ? 'Đang Dừng...' : 'Dừng Bot'}</span>
              </button>
            </>
          )}

          <button
            onClick={onRefresh}
            title="Làm mới trạng thái"
            className="p-2 bg-slate-700/60 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-5 border-b border-slate-700/60 text-sm">
        <div className="p-3 bg-slate-900/60 border border-slate-700/40 rounded-xl">
          <span className="text-xs text-slate-400 block mb-1">Tài Khoản</span>
          <span className="font-semibold text-white truncate block">
            {status?.username || 'Chưa thiết lập'}
          </span>
        </div>

        <div className="p-3 bg-slate-900/60 border border-slate-700/40 rounded-xl">
          <span className="text-xs text-slate-400 block mb-1 flex items-center gap-1">
            <Server className="w-3 h-3 text-amber-400" /> Server
          </span>
          <span className="font-semibold text-amber-300 truncate block">
            {serverName}
          </span>
        </div>

        <div className="p-3 bg-slate-900/60 border border-slate-700/40 rounded-xl">
          <span className="text-xs text-slate-400 block mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-400" /> Thời Gian Treo
          </span>
          <span className="font-semibold text-blue-300 block">
            {formatUptime(status?.uptimeSeconds || 0)}
          </span>
        </div>

        <div className="p-3 bg-slate-900/60 border border-slate-700/40 rounded-xl">
          <span className="text-xs text-slate-400 block mb-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Map / Khu
          </span>
          <span className="font-semibold text-emerald-300 block">
            Map {status?.map || 0} (Khu {status?.zone || 0})
          </span>
        </div>
      </div>

      {/* Cloud Tip */}
      {isRunning && (
        <div className="my-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Treo 24/7 an toàn:</strong> Bot đang chạy hoàn toàn độc lập trên Cloud Server. Bạn có thể tắt máy tính hoặc đóng tab trình duyệt, tài khoản Ninja School của bạn vẫn sẽ duy trì online cày level và gom yên.
          </span>
        </div>
      )}

      {/* Logs section */}
      <div className="pt-2">
        <button
          onClick={() => setShowLogs(!showLogs)}
          className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 hover:text-slate-300 py-2 transition"
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-400" />
            <span>Nhật Ký Tiến Trình ({status?.logs?.length || 0} dòng)</span>
          </div>
          {showLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showLogs && (
          <div className="mt-2 p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto space-y-1">
            {status?.logs?.length > 0 ? (
              status.logs.map((line, idx) => (
                <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                  {line}
                </div>
              ))
            ) : (
              <div className="text-slate-500 italic">Chưa có nhật ký ghi nhận...</div>
            )}
          </div>
        )}
      </div>

      {/* Snapshot Modal */}
      <NsoSnapshotModal
        isOpen={showSnapshot}
        onClose={() => setShowSnapshot(false)}
      />
    </div>
  );
}
