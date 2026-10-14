import React, { useState } from 'react';
import { Settings, Server, Check, AlertCircle, X } from 'lucide-react';
import { getBackendUrl, setBackendUrl, checkBackendHealth } from '../services/api';

export function BackendSettingsModal({ isOpen, onClose, onSaved }) {
  const [url, setUrl] = useState(getBackendUrl());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    try {
      setIsTesting(true);
      setTestResult(null);
      setBackendUrl(url);
      const res = await checkBackendHealth();
      setTestResult({ success: true, message: `Kết nối thành công! Server uptime: ${Math.round(res.uptime)}s` });
    } catch (err) {
      setTestResult({ success: false, message: `Không thể kết nối: ${err.message}` });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    setBackendUrl(url);
    if (onSaved) onSaved(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-slate-100">Cấu Hình Backend Server</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-slate-300">
            Địa chỉ Backend (Hugging Face / Koyeb / VPS):
          </label>
          <div className="relative">
            <Server className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://ten-ban-runner.hf.space"
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            Mẹo: Dùng URL Hugging Face Spaces (miễn phí 16GB RAM) hoặc URL localhost khi chạy thử nghiệm trên máy.
          </p>
        </div>

        {testResult && (
          <div
            className={`flex items-center gap-2 p-2.5 rounded-lg text-xs border ${
              testResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {testResult.success ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{testResult.message}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            disabled={isTesting}
            onClick={handleTest}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            {isTesting ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors"
          >
            Lưu cấu hình
          </button>
        </div>
      </div>
    </div>
  );
}
