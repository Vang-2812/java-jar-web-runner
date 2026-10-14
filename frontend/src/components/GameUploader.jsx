import React, { useState, useRef } from 'react';
import { Upload, Play, Gamepad2, FileArchive, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadGameFile, startSession } from '../services/api';

export function GameUploader({ games = [], onGameStarted, isRunning }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.jar')) {
      setError('Vui lòng chỉ chọn file game định dạng .jar');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      setIsUploading(true);
      const res = await uploadGameFile(file);
      setSuccess(`Đã tải lên: ${res.originalName}`);
      // Tự động khởi động game sau khi upload thành công
      await startSession(res.path);
      if (onGameStarted) onGameStarted(res.filename);
    } catch (err) {
      setError(err.message || 'Lỗi tải lên file .jar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartPreset = async (game) => {
    try {
      setError(null);
      await startSession(game.path);
      if (onGameStarted) onGameStarted(game.filename);
    } catch (err) {
      setError(err.message || 'Không thể khởi động game');
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-emerald-400" />
          <h2 className="font-semibold text-slate-200">Kho Game & Tải File .JAR</h2>
        </div>
        {isRunning && (
          <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 font-medium">
            Game đang chạy
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Drag & Drop Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
        }}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
          isUploading
            ? 'border-emerald-500 bg-emerald-500/5'
            : 'border-slate-700 hover:border-emerald-500/60 hover:bg-slate-800/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jar"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
          <Upload className={`w-5 h-5 ${isUploading ? 'animate-bounce text-emerald-400' : ''}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-300">
            {isUploading ? 'Đang tải lên server...' : 'Kéo thả hoặc bấm để nạp file .jar'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Hỗ trợ mọi game J2ME (Ninja School, Avatar, Gameloft...)</p>
        </div>
      </div>

      {/* Danh sách game có sẵn */}
      {games.length > 0 && (
        <div className="flex flex-col gap-2 mt-1">
          <p className="text-xs font-medium text-slate-400">Game có sẵn trên server:</p>
          <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
            {games.map((g, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileArchive className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate text-slate-300">{g.filename}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleStartPreset(g)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors shrink-0"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Chơi</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
