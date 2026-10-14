import React, { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { VirtualKeypad } from './components/VirtualKeypad';
import { GameUploader } from './components/GameUploader';
import { AfkPanel } from './components/AfkPanel';
import { BackendSettingsModal } from './components/BackendSettingsModal';
import NsoConfigForm from './components/NsoConfigForm';
import NsoStatusCard from './components/NsoStatusCard';
import { wsService } from './services/ws';
import { fetchGames, fetchSessionStatus } from './services/api';
import { startNsoBot, stopNsoBot, fetchNsoStatus } from './services/nsoApi';
import { useKeyboard } from './hooks/useKeyboard';
import { Settings, Gamepad2, Wifi, WifiOff, Swords, Monitor } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('nso'); // 'nso' | 'interactive'
  const [frameBlob, setFrameBlob] = useState(null);
  const [sessionStatus, setSessionStatus] = useState(null);
  const [nsoStatus, setNsoStatus] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [games, setGames] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNsoStarting, setIsNsoStarting] = useState(false);
  const [isNsoStopping, setIsNsoStopping] = useState(false);

  // Kích hoạt lắng nghe bàn phím PC chỉ khi ở tab interactive
  useKeyboard(activeTab === 'interactive');

  // Nạp dữ liệu định kỳ
  const refreshAllData = async () => {
    try {
      const [gamesData, sessionData, nsoData] = await Promise.all([
        fetchGames().catch(() => []),
        fetchSessionStatus().catch(() => null),
        fetchNsoStatus().catch(() => null),
      ]);
      setGames(gamesData);
      if (sessionData) setSessionStatus(sessionData);
      if (nsoData) setNsoStatus(nsoData);
    } catch (e) {}
  };

  useEffect(() => {
    refreshAllData();

    // Kết nối WebSocket khi ở tab interactive
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

    // Chu kỳ cập nhật trạng thái nhẹ mỗi 4 giây
    const timer = setInterval(refreshAllData, 4000);

    return () => {
      clearInterval(timer);
      wsService.disconnect();
    };
  }, []);

  const handleStartNsoBot = async (config) => {
    try {
      setIsNsoStarting(true);
      const res = await startNsoBot(config);
      setNsoStatus(res);
      await refreshAllData();
    } catch (err) {
      alert(err.message || 'Lỗi khi khởi động NSO Bot');
    } finally {
      setIsNsoStarting(false);
    }
  };

  const handleStopNsoBot = async () => {
    try {
      setIsNsoStopping(true);
      const res = await stopNsoBot();
      setNsoStatus(res);
      await refreshAllData();
    } catch (err) {
      alert(err.message || 'Lỗi khi dừng NSO Bot');
    } finally {
      setIsNsoStopping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center">
      {/* Top Header */}
      <header className="w-full max-w-6xl px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <span>NSO Web Runner</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                AFK 24/7
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Treo Ninja School Online & Game Java trên Cloud Vercel/Render</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
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

      {/* Tabs navigation */}
      <div className="w-full max-w-6xl px-4 pt-4 flex items-center gap-2">
        <button
          onClick={() => setActiveTab('nso')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition duration-200 border ${
            activeTab === 'nso'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white border-amber-500/40 shadow-lg shadow-orange-950/30'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Swords className="w-4 h-4" />
          <span>NSO Bot Treo 24/7</span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full font-bold">
            0.1% CPU
          </span>
        </button>

        <button
          onClick={() => setActiveTab('interactive')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition duration-200 border ${
            activeTab === 'interactive'
              ? 'bg-slate-800 text-white border-slate-700 shadow-md'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span>Giả Lập Java Trực Tiếp</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="w-full max-w-6xl p-4 md:p-6">
        {activeTab === 'nso' ? (
          /* TAB 1: NSO BOT TREO 24/7 (HEADLESS CHUYÊN BIỆT) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-12 xl:col-span-12 flex flex-col gap-6">
              {/* Card hiển thị trạng thái NSO Bot */}
              <NsoStatusCard
                status={nsoStatus}
                onStop={handleStopNsoBot}
                onRefresh={refreshAllData}
                isStopping={isNsoStopping}
              />

              {/* Form cấu hình tài khoản & server cày */}
              <NsoConfigForm
                onStart={handleStartNsoBot}
                isLoading={isNsoStarting}
              />
            </div>
          </div>
        ) : (
          /* TAB 2: GIẢ LẬP JAVA TRỰC TIẾP (INTERACTIVE STREAM) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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
                onRefresh={refreshAllData}
              />
              <GameUploader
                games={games}
                isRunning={sessionStatus?.running}
                onGameStarted={refreshAllData}
              />
            </section>
          </div>
        )}
      </main>

      {/* Modal Cài đặt Backend URL */}
      <BackendSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={() => {
          refreshAllData();
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
