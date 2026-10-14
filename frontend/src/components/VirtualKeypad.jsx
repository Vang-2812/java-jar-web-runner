import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Phone, PhoneOff } from 'lucide-react';
import { wsService } from '../services/ws';

export function VirtualKeypad() {
  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(20);
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

  // Helper cho mỗi nút bấm
  const KeyButton = ({ keyName, label, subLabel, className = '', children }) => (
    <button
      type="button"
      onMouseDown={() => handlePressDown(keyName)}
      onMouseUp={() => handlePressUp(keyName)}
      onMouseLeave={() => handlePressUp(keyName)}
      onTouchStart={(e) => { e.preventDefault(); handlePressDown(keyName); }}
      onTouchEnd={(e) => { e.preventDefault(); handlePressUp(keyName); }}
      className={`relative select-none active:scale-95 active:brightness-125 transition-all duration-75 flex flex-col items-center justify-center font-bold shadow-md rounded-lg border border-slate-700/60 bg-gradient-to-b from-slate-800 to-slate-900 text-slate-200 hover:text-white ${className}`}
    >
      {children ? children : (
        <>
          <span className="text-base leading-none">{label}</span>
          {subLabel && <span className="text-[9px] font-normal text-slate-400 leading-none mt-0.5">{subLabel}</span>}
        </>
      )}
    </button>
  );

  return (
    <div className="w-full max-w-[360px] flex flex-col gap-2 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-sm">
      {/* Cụm điều hướng & Softkeys */}
      <div className="grid grid-cols-5 gap-1.5 items-center">
        {/* Soft Left */}
        <KeyButton
          keyName="SOFT_LEFT"
          className="h-11 col-span-1 bg-slate-800/90 text-xs font-semibold"
        >
          <span>Menu</span>
        </KeyButton>

        {/* D-Pad Up */}
        <div className="col-span-3 flex justify-center">
          <KeyButton keyName="UP" className="w-12 h-10">
            <ChevronUp className="w-5 h-5 text-emerald-400" />
          </KeyButton>
        </div>

        {/* Soft Right */}
        <KeyButton
          keyName="SOFT_RIGHT"
          className="h-11 col-span-1 bg-slate-800/90 text-xs font-semibold"
        >
          <span>Trở về</span>
        </KeyButton>
      </div>

      {/* D-pad Ngang + Phím Giữa */}
      <div className="grid grid-cols-5 gap-1.5 items-center">
        <KeyButton keyName="CALL" className="h-10 text-emerald-400">
          <Phone className="w-4 h-4" />
        </KeyButton>

        <div className="col-span-3 flex items-center justify-center gap-1.5">
          <KeyButton keyName="LEFT" className="w-12 h-10">
            <ChevronLeft className="w-5 h-5 text-emerald-400" />
          </KeyButton>
          <KeyButton keyName="OK" className="w-12 h-10 bg-emerald-700/80 hover:bg-emerald-600 text-white font-black text-sm">
            <span>OK</span>
          </KeyButton>
          <KeyButton keyName="RIGHT" className="w-12 h-10">
            <ChevronRight className="w-5 h-5 text-emerald-400" />
          </KeyButton>
        </div>

        <KeyButton keyName="END" className="h-10 text-rose-400">
          <PhoneOff className="w-4 h-4" />
        </KeyButton>
      </div>

      <div className="flex justify-center -mt-1">
        <KeyButton keyName="DOWN" className="w-12 h-10">
          <ChevronDown className="w-5 h-5 text-emerald-400" />
        </KeyButton>
      </div>

      {/* Cụm bàn phím số 3x4 Nokia */}
      <div className="grid grid-cols-3 gap-2 mt-1">
        <KeyButton keyName="NUM1" label="1" subLabel=".,-" className="h-11" />
        <KeyButton keyName="NUM2" label="2" subLabel="ABC" className="h-11" />
        <KeyButton keyName="NUM3" label="3" subLabel="DEF" className="h-11" />

        <KeyButton keyName="NUM4" label="4" subLabel="GHI" className="h-11" />
        <KeyButton keyName="NUM5" label="5" subLabel="JKL" className="h-11 border-emerald-500/40 text-emerald-300" />
        <KeyButton keyName="NUM6" label="6" subLabel="MNO" className="h-11" />

        <KeyButton keyName="NUM7" label="7" subLabel="PQRS" className="h-11" />
        <KeyButton keyName="NUM8" label="8" subLabel="TUV" className="h-11" />
        <KeyButton keyName="NUM9" label="9" subLabel="WXYZ" className="h-11" />

        <KeyButton keyName="STAR" label="*" subLabel="+" className="h-11" />
        <KeyButton keyName="NUM0" label="0" subLabel="␣" className="h-11" />
        <KeyButton keyName="POUND" label="#" subLabel="⇧" className="h-11" />
      </div>
    </div>
  );
}
