import React, { useRef, useState, useEffect } from 'react';
import { Maximize2, Minimize2, Tv } from 'lucide-react';

export function GameCanvas({ frameBlob, isRunning, isConnected }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [hasReceivedFrame, setHasReceivedFrame] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Vẽ frame trực tiếp lên HTML5 Canvas bằng createImageBitmap (Chống giật/nhấp nháy 100%)
  useEffect(() => {
    if (!frameBlob) return;
    let isCancelled = false;

    createImageBitmap(frameBlob)
      .then((bitmap) => {
        if (isCancelled) {
          bitmap.close();
          return;
        }
        const canvas = canvasRef.current;
        if (canvas) {
          if (canvas.width !== bitmap.width || canvas.height !== bitmap.height) {
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
          }
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = false; // Chuẩn pixel art nét căng
          ctx.drawImage(bitmap, 0, 0);
          setHasReceivedFrame(true);
        }
        bitmap.close();
      })
      .catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, [frameBlob]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center bg-slate-900 border-2 border-slate-700 rounded-xl overflow-hidden shadow-2xl transition-all ${
        isFullscreen ? 'w-full h-full p-2' : 'w-full max-w-[360px] aspect-[3/4]'
      }`}
    >
      {/* Top Bezel Status */}
      <div className="w-full flex items-center justify-between px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Tv className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono font-medium">J2ME Screen (240x320)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <button
            onClick={toggleFullscreen}
            className="p-1 hover:text-white transition-colors"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Screen Display Area */}
      <div className="flex-1 w-full h-full relative flex items-center justify-center bg-black overflow-hidden">
        <canvas
          ref={canvasRef}
          className={`w-full h-full object-contain pixelated select-none pointer-events-none ${
            hasReceivedFrame ? 'block' : 'hidden'
          }`}
        />

        {!hasReceivedFrame && (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-700 animate-spin flex items-center justify-center mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-sm font-medium text-slate-400">
              {isRunning ? 'Đang đợi khung hình từ game...' : 'Chưa có game nào đang chạy'}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {isRunning ? 'Game đang khởi động ngầm trong Xvfb' : 'Vui lòng chọn game hoặc upload file .jar để bắt đầu'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
