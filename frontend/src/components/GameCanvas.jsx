import React, { useRef, useState, useEffect } from 'react';
import { Maximize2, Minimize2, Tv } from 'lucide-react';
import CanvasCommandRenderer from './CanvasCommandRenderer';

export function GameCanvas({ binaryBuffer, frameBlob, isRunning, isConnected }) {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
      className={`relative flex flex-col items-center justify-center bg-slate-900 border-2 border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl transition-all ${
        isFullscreen ? 'w-full h-full p-2' : 'w-full max-w-[360px]'
      }`}
    >
      {/* Top Bezel Status */}
      <div className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-950/90 border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Tv className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono font-medium text-slate-300">J2ME 60 FPS Canvas</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <button
            onClick={toggleFullscreen}
            className="p-1 hover:text-white text-slate-400 transition-colors"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Screen Display Area */}
      <div className="w-full p-2 flex items-center justify-center bg-slate-950">
        <CanvasCommandRenderer
          binaryBuffer={binaryBuffer}
          frameBlob={frameBlob}
          isRunning={isRunning}
          isConnected={isConnected}
        />
      </div>
    </div>
  );
}
