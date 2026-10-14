import React, { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { VirtualKeypad } from './components/VirtualKeypad';
import { GameUploader } from './components/GameUploader';
import { AfkPanel } from './components/AfkPanel';
import { BackendSettingsModal } from './components/BackendSettingsModal';
import { wsService } from './services/ws';
import { fetchGames, fetchSessionStatus } from './services/api';
import { useKeyboard } from './hooks/useKeyboard';
import { Settings, Gamepad2, Wifi, WifiOff } from 'lucide-react';

export default function App() {
  const [frameBlob, setFrameBlob] = useState(null);
  const [sessionStatus, setSessionStatus] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [games, setGames] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Kích hoạt lắng nghe bàn phím PC
  useKeyboard(true);

  // Nạp danh sách game và trạng thái ban đầu
  const refreshData = async () => {
    try {
      const [gamesData, statusData] = await Promise.all([
        fetchGames().catch(() => []),
        fetchSessionStatus().catch(() => null)
      ]);
      setGames(gamesData);
      if (statusData) setSessionStatus(statusData);
    } catch (e) {}
  };

  useEffect(() => {
    refreshData();

    // Kết nối WebSocket để stream hình ảnh và trạng thái
    wsService.connect(
      (newBlob) => {
        setFrameBlob(newBlob);
      },
      (msg) => {
        if (msg.type === 'INIT_STATUS' && msg.data) {
          setSessionStatus(msg.data);
        }
      },
      (connState) => {
        setIsConnected(connState);
      }
    );

    // Chu kỳ cập nhật trạng thái nhẹ mỗi 5 giây
    const timer = setInterval(refreshData, 5000);

    return () => {
      clearInterval(timer);
      wsService.disconnect();
    };
  }, []);

  const handleGameStarted = (gameName) => {
    refreshData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center">
      {/* Top Header */}
      <header className="w-full max-w-6xl px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <span>J2ME Web Runner</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                AFK 24/7
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Chạy & Treo game Java (.jar) trên Web Vercel</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Trạng thái kết nối Server */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}
          >
            {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isConnected ? 'Server Online' : 'Mất kết nối'}</span>
          </div>

          {/* Nút cài đặt Server URL */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Cài đặt kết nối server"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-6xl p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cột Trái: Màn hình Game + Bàn phím ảo */}
        <section className="lg:col-span-6 xl:col-span-5 flex flex-col items-center gap-4">
          <GameCanvas
            frameBlob={frameBlob}
            isRunning={sessionStatus?.running}
            isConnected={isConnected}
          />
          <VirtualKeypad />
        </section>

        {/* Cột Phải: Bảng điều khiển Treo máy 24/7 & Kho Game */}
        <section className="lg:col-span-6 xl:col-span-7 flex flex-col gap-5">
          <AfkPanel
            status={sessionStatus}
            onRefresh={refreshData}
          />
          <GameUploader
            games={games}
            isRunning={sessionStatus?.running}
            onGameStarted={handleGameStarted}
          />
        </section>
      </main>

      {/* Modal Cài đặt Backend URL */}
      <BackendSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={() => {
          refreshData();
          wsService.disconnect();
          wsService.connect(
            (blob) => setFrameBlob(blob),
            (msg) => msg.type === 'INIT_STATUS' && setSessionStatus(msg.data),
            (state) => setIsConnected(state)
          );
        }}
      />
    </div>
  );
}
