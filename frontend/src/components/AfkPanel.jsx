import React, { useState, useEffect, useRef } from 'react';
import { Power, RotateCcw, Clock, Terminal, Activity, ShieldCheck } from 'lucide-react';
import { stopSession, startSession } from '../services/api';

export function AfkPanel({ status, onRefresh }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const logEndRef = useRef(null);

  const isRunning = !!status?.running;
  const gameName = status?.game || 'Chưa chọn';
  const uptimeSec = status?.uptimeSeconds || 0;

  // Format uptime thành hh:mm:ss
  const formatUptime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStop = async () => {
    try {
      setIsProcessing(true);
      await stopSession();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Lỗi dừng game');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [status?.logs]);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
      {/* Header trạng thái */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h2 className="font-semibold text-slate-200">Trạng Thái Treo Máy 24/7</h2>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
              isRunning
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            {isRunning ? 'Đang Treo 24/7' : 'Đã Dừng'}
          </span>
        </div>
      </div>

      {/* Thông tin Uptime & Game */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Thời gian đã treo</span>
          </div>
          <span className="text-lg font-mono font-bold text-slate-100">
            {formatUptime(uptimeSec)}
          </span>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Game hiện tại</span>
          </div>
          <span className="text-sm font-semibold text-emerald-300 truncate block" title={gameName}>
            {gameName}
          </span>
        </div>
      </div>

      {/* Hành động điều khiển */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!isRunning || isProcessing}
          onClick={handleStop}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-rose-600/90 hover:bg-rose-600 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-all shadow-md active:scale-98"
        >
          <Power className="w-4 h-4" />
          <span>Dừng Treo Máy</span>
        </button>

        <button
          type="button"
          disabled={isProcessing}
          onClick={onRefresh}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
          title="Làm mới trạng thái"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Bảng Log Terminal */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span>Nhật ký hoạt động (Server Logs):</span>
        </div>
        <div className="bg-black/90 border border-slate-800 rounded-lg p-2.5 h-32 overflow-y-auto font-mono text-[11px] text-emerald-400/90 flex flex-col gap-1 leading-relaxed">
          {status?.logs && status.logs.length > 0 ? (
            status.logs.map((log, index) => (
              <div key={index} className="break-all whitespace-pre-wrap">
                {log}
              </div>
            ))
          ) : (
            <span className="text-slate-600 italic">Chưa có nhật ký hoạt động nào...</span>
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
