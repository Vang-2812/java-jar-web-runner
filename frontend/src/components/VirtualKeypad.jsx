import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Hash } from 'lucide-react';
import { wsService } from '../services/ws';

export function VirtualKeypad() {
  const [showNumpad, setShowNumpad] = useState(false);

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch (e) {}
    }
  };

  const handlePressDown = (keyName) => {
    triggerHaptic();
    wsService.sendKey(keyName, 'KEY_DOWN');
  };

  const handlePressUp = (keyName) => {
    wsService.sendKey(keyName, 'KEY_UP');
  };

  // Nút bấm cơ bản
  const KeyButton = ({ keyName, label, className = '', children }) => (
    <button
      type="button"
      onMouseDown={() => handlePressDown(keyName)}
      onMouseUp={() => handlePressUp(keyName)}
      onMouseLeave={() => handlePressUp(keyName)}
      onTouchStart={(e) => { e.preventDefault(); handlePressDown(keyName); }}
      onTouchEnd={(e) => { e.preventDefault(); handlePressUp(keyName); }}
      className={`relative select-none active:scale-95 active:brightness-125 transition-all duration-75 flex flex-col items-center justify-center font-bold shadow-md rounded-xl border border-slate-700/60 bg-gradient-to-b from-slate-800 to-slate-900 text-slate-200 hover:text-white ${className}`}
    >
      {children ? children : <span className="leading-none">{label}</span>}
    </button>
  );

  return (
    <div className="w-full max-w-[360px] flex flex-col gap-3 p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-sm">
      {/* Hàng nút Hành động: Menu (Trái) và Trở về (Phải) */}
      <div className="grid grid-cols-2 gap-3">
        <KeyButton
          keyName="SOFT_LEFT"
          className="h-11 bg-gradient-to-b from-emerald-800/80 to-slate-900 border-emerald-500/40 text-emerald-300 hover:text-emerald-200 text-sm font-bold tracking-wide"
        >
          <span>MENU (Q / F1)</span>
        </KeyButton>

        <KeyButton
          keyName="SOFT_RIGHT"
          className="h-11 bg-gradient-to-b from-rose-900/60 to-slate-900 border-rose-500/40 text-rose-300 hover:text-rose-200 text-sm font-bold tracking-wide"
        >
          <span>TRỞ VỀ (E / Esc)</span>
        </KeyButton>
      </div>

      {/* Cụm D-pad điều hướng Gamepad tinh gọn */}
      <div className="flex flex-col items-center gap-1.5 py-1">
        {/* Nút Lên */}
        <KeyButton keyName="UP" className="w-14 h-12 bg-slate-800/90 hover:bg-slate-700/80">
          <ChevronUp className="w-6 h-6 text-emerald-400" />
        </KeyButton>

        {/* Hàng ngang: Trái - OK - Phải */}
        <div className="flex items-center justify-center gap-2">
          <KeyButton keyName="LEFT" className="w-14 h-12 bg-slate-800/90 hover:bg-slate-700/80">
            <ChevronLeft className="w-6 h-6 text-emerald-400" />
          </KeyButton>

          <KeyButton
            keyName="OK"
            className="w-16 h-12 bg-emerald-600 hover:bg-emerald-500 border-emerald-400/50 text-white font-black text-base shadow-lg shadow-emerald-900/30 active:scale-90"
          >
            <span>OK</span>
          </KeyButton>

          <KeyButton keyName="RIGHT" className="w-14 h-12 bg-slate-800/90 hover:bg-slate-700/80">
            <ChevronRight className="w-6 h-6 text-emerald-400" />
          </KeyButton>
        </div>

        {/* Nút Xuống */}
        <KeyButton keyName="DOWN" className="w-14 h-12 bg-slate-800/90 hover:bg-slate-700/80">
          <ChevronDown className="w-6 h-6 text-emerald-400" />
        </KeyButton>
      </div>

      {/* Nút mở rộng bàn phím số (Ẩn/Hiện linh hoạt khi cần gõ tài khoản/mật khẩu) */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
        <span className="text-slate-500">Phím tắt PC: WASD / Mũi tên / Enter</span>
        <button
          type="button"
          onClick={() => setShowNumpad(!showNumpad)}
          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <Hash className="w-3 h-3 text-emerald-400" />
          <span>{showNumpad ? 'Ẩn số' : 'Hiện số (0-9)'}</span>
        </button>
      </div>

      {/* Bàn phím số mở rộng (chỉ hiện khi người dùng bấm cần gõ số) */}
      {showNumpad && (
        <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800/60 animate-fadeIn">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => {
            const keyName = k === '*' ? 'STAR' : k === '#' ? 'POUND' : `NUM${k}`;
            return (
              <KeyButton
                key={k}
                keyName={keyName}
                label={k}
                className="h-9 text-sm font-semibold bg-slate-800/70"
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
