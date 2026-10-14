import React, { useState } from 'react';
import { X, RefreshCw, Camera, AlertCircle } from 'lucide-react';
import { getNsoSnapshotUrl } from '../services/nsoApi';

export default function NsoSnapshotModal({ isOpen, onClose }) {
  const [snapshotUrl, setSnapshotUrl] = useState(() => getNsoSnapshotUrl());
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(() => new Date());

  if (!isOpen) return null;

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    setSnapshotUrl(getNsoSnapshotUrl());
  };

  const handleImageLoaded = () => {
    setIsLoading(false);
    setLastRefreshed(new Date());
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Ảnh Chụp Game Tức Thì</h3>
              <p className="text-xs text-slate-400">
                Chụp theo yêu cầu (Tiết kiệm CPU 100%)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Snapshot View Area */}
        <div className="p-6 flex flex-col items-center justify-center bg-slate-950 min-h-[380px] relative">
          {isLoading && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center z-10 gap-3">
              <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
              <span className="text-xs text-slate-300">Đang chụp ảnh màn hình từ server...</span>
            </div>
          )}

          {hasError ? (
            <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400 gap-2">
              <AlertCircle className="w-10 h-10 text-rose-400 mb-1" />
              <p className="text-sm font-medium text-rose-300">Không thể chụp ảnh màn hình</p>
              <p className="text-xs text-slate-500 max-w-xs">
                Có thể bot chưa được khởi động hoặc tiến trình Java đang khởi tạo.
              </p>
            </div>
          ) : (
            <div className="relative rounded-lg overflow-hidden border-2 border-slate-700 shadow-xl bg-black">
              <img
                src={snapshotUrl}
                alt="NSO Game Snapshot"
                width={240}
                height={320}
                onLoad={handleImageLoaded}
                onError={handleImageError}
                className="pixelated block object-contain"
                style={{ imageRendering: 'pixelated', width: '240px', height: '320px' }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Cập nhật lúc: {lastRefreshed.toLocaleTimeString()}</span>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/30 text-amber-300 hover:bg-amber-600/50 border border-amber-500/40 rounded-lg font-medium transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Làm Mới Ảnh</span>
          </button>
        </div>
      </div>
    </div>
  );
}
