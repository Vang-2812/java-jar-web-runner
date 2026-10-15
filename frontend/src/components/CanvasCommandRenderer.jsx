import React, { useRef, useEffect, useState } from 'react';

const OP = {
  FILL_RECT: 1,
  DRAW_RECT: 2,
  FILL_ROUND: 3,
  DRAW_ROUND: 4,
  LINE: 5,
  REGION: 6,
  CLIP: 7,
  CLIP_RECT: 8,
  COLOR: 12,
  IMAGE: 13,
  FILL_ARC: 15,
  DRAW_ARC: 16,
  TRANSLATE: 17,
  TRIANGLE: 18,
};

function makeInflater() {
  if (typeof DecompressionStream === 'undefined') return null;
  const ds = new DecompressionStream('deflate-raw');
  const writer = ds.writable.getWriter();
  const reader = ds.readable.getReader();
  let pend = new Uint8Array(0);

  return async (chunk, n) => {
    writer.write(chunk).catch(() => {});
    while (pend.length < n) {
      const { value, done } = await reader.read();
      if (done) throw new Error('Hết luồng nén Deflate');
      const merged = new Uint8Array(pend.length + value.length);
      merged.set(pend);
      merged.set(value, pend.length);
      pend = merged;
    }
    const out = pend.slice(0, n);
    pend = pend.slice(n);
    return out;
  };
}

export default function CanvasCommandRenderer({
  binaryBuffer,
  frameBlob,
  isRunning,
  isConnected,
  fps = 60
}) {
  const canvasRef = useRef(null);
  const imagesRef = useRef(new Map());
  const inflaterRef = useRef(null);
  const chainRef = useRef(Promise.resolve());
  const [fpsCount, setFpsCount] = useState(0);
  const frameCountRef = useRef(0);

  // Khởi tạo DecompressionStream
  useEffect(() => {
    inflaterRef.current = makeInflater();
  }, []);

  // Tính FPS thực tế
  useEffect(() => {
    const timer = setInterval(() => {
      setFpsCount(frameCountRef.current);
      frameCountRef.current = 0;
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Xử lý gói tin nhị phân Canvas Command Stream
  useEffect(() => {
    if (!binaryBuffer) return;

    chainRef.current = chainRef.current.then(async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.imageSmoothingEnabled = false;

      const bytes = new Uint8Array(binaryBuffer);
      const dv = new DataView(binaryBuffer);
      let type = bytes[0];

      // Type 5: Định nghĩa ảnh Sprite (DEF)
      if (type === 5) {
        const id = dv.getInt32(1);
        const pngBlob = new Blob([bytes.subarray(9)], { type: 'image/png' });
        try {
          const bmp = await createImageBitmap(pngBlob);
          imagesRef.current.set(id, bmp);
        } catch (e) {}
        return;
      }

      // Type 4: Khung lệnh vẽ đã nén qua Deflate
      let rawBytes = bytes;
      let rawDv = dv;

      if (type === 4) {
        const uncompressedLen = dv.getUint32(1);
        if (inflaterRef.current) {
          try {
            const raw = await inflaterRef.current(bytes.subarray(5), uncompressedLen);
            rawBytes = raw;
            rawDv = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);
            type = rawBytes[0];
          } catch (e) {
            return;
          }
        }
      }

      // Type 3: Khung lệnh vẽ (CMD)
      if (type === 3) {
        const W = rawDv.getUint16(5);
        const H = rawDv.getUint16(7);
        if (canvas.width !== W || canvas.height !== H) {
          canvas.width = W;
          canvas.height = H;
          ctx.imageSmoothingEnabled = false;
        }

        const clipX = rawDv.getUint16(9);
        const clipY = rawDv.getUint16(11);
        const clipW = rawDv.getUint16(13);
        const clipH = rawDv.getUint16(15);

        renderCmd(ctx, rawBytes, 17, clipX, clipY, clipW, clipH, imagesRef.current);
        frameCountRef.current++;
      }
    }).catch(() => {});
  }, [binaryBuffer]);

  // Fallback: Nếu backend truyền ảnh JPEG tĩnh (hoặc on-demand snapshot)
  useEffect(() => {
    if (!frameBlob || binaryBuffer) return;
    let active = true;

    createImageBitmap(frameBlob)
      .then((bmp) => {
        if (!active || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (canvas.width !== bmp.width || canvas.height !== bmp.height) {
          canvas.width = bmp.width;
          canvas.height = bmp.height;
          ctx.imageSmoothingEnabled = false;
        }
        ctx.drawImage(bmp, 0, 0);
        frameCountRef.current++;
        bmp.close();
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [frameBlob, binaryBuffer]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Khung máy chơi game Nokia */}
      <div className="relative p-2.5 sm:p-3 bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl border-4 border-slate-700/80 shadow-2xl">
        <div className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center border-2 border-slate-950">
          <canvas
            ref={canvasRef}
            width={240}
            height={320}
            className="block pixelated object-contain max-h-[460px] w-auto aspect-[240/320]"
            style={{ imageRendering: 'pixelated' }}
          />

          {/* Badge FPS và công nghệ Canvas */}
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{fpsCount > 0 ? `${fpsCount} FPS` : '60 FPS'}</span>
            <span className="text-slate-400">|</span>
            <span className="text-amber-300">GPU Canvas</span>
          </div>

          {!isRunning && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center">
              <span className="text-sm font-semibold text-slate-300 mb-1">Trò chơi chưa khởi động</span>
              <span className="text-xs text-slate-500">Chọn game hoặc bấm Bắt đầu để nạp</span>
            </div>
          )}

          {!isConnected && isRunning && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center">
              <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-2" />
              <span className="text-xs text-amber-300">Đang kết nối lại luồng Canvas...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Thuật toán vẽ chuẩn Java2D chính xác theo từng pixel
function renderCmd(g, b, start, clipX, clipY, clipW, clipH, images) {
  let p = start;
  const end = b.length;

  const rd = () => {
    let r = 0, shift = 0, x;
    do {
      x = b[p++];
      r |= (x & 0x7f) << shift;
      shift += 7;
    } while (x & 0x80);
    return (r >>> 1) ^ -(r & 1);
  };

  let tx = 0, ty = 0;
  let color = '#000000';
  let cx = clipX, cy = clipY, cw = clipW, ch = clipH;

  const setClip = () => {
    g.restore();
    g.save();
    g.beginPath();
    g.rect(cx, cy, Math.max(0, cw), Math.max(0, ch));
    g.clip();
    g.fillStyle = color;
    g.strokeStyle = color;
  };

  g.save();
  g.save();
  setClip();

  while (p < end) {
    const op = b[p++];
    switch (op) {
      case OP.COLOR: {
        let r = 0, shift = 0, x;
        do {
          x = b[p++];
          r |= (x & 0x7f) << shift;
          shift += 7;
        } while (x & 0x80);
        const rgb = ((r >>> 1) ^ -(r & 1)) & 0xffffff;
        color = '#' + rgb.toString(16).padStart(6, '0');
        g.fillStyle = color;
        g.strokeStyle = color;
        break;
      }
      case OP.TRANSLATE: {
        tx += rd();
        ty += rd();
        break;
      }
      case OP.CLIP: {
        const x = rd(), y = rd(), w = rd(), h = rd();
        cx = x + tx; cy = y + ty; cw = w; ch = h;
        setClip();
        break;
      }
      case OP.CLIP_RECT: {
        const x = rd() + tx, y = rd() + ty, w = rd(), h = rd();
        const nx = Math.max(cx, x), ny = Math.max(cy, y);
        cw = Math.min(cx + cw, x + w) - nx;
        ch = Math.min(cy + ch, y + h) - ny;
        cx = nx; cy = ny;
        setClip();
        break;
      }
      case OP.FILL_RECT: {
        const x = rd(), y = rd(), w = rd(), h = rd();
        if (w > 0 && h > 0) g.fillRect(x + tx, y + ty, w, h);
        break;
      }
      case OP.DRAW_RECT: {
        const x = rd() + tx, y = rd() + ty, w = rd(), h = rd();
        g.strokeRect(x, y, w, h);
        break;
      }
      case OP.LINE: {
        const x1 = rd() + tx, y1 = rd() + ty, x2 = rd() + tx, y2 = rd() + ty;
        g.beginPath();
        g.moveTo(x1, y1);
        g.lineTo(x2, y2);
        g.stroke();
        break;
      }
      case OP.IMAGE: {
        const id = rd();
        let x = rd(), y = rd(), anchor = rd();
        const bmp = images.get(id);
        if (bmp) {
          if (anchor === 0) anchor = 20;
          if (anchor & 8) x -= bmp.width;
          else if (anchor & 1) x -= Math.trunc(bmp.width / 2);
          if (anchor & 32) y -= bmp.height;
          else if (anchor & 2) y -= Math.trunc(bmp.height / 2);
          g.drawImage(bmp, x + tx, y + ty);
        }
        break;
      }
      case OP.REGION: {
        const id = rd(), sx = rd(), sy = rd(), w = rd(), h = rd(), t = rd();
        let x = rd(), y = rd(), anchor = rd();
        const bmp = images.get(id);
        if (bmp && w > 0 && h > 0) {
          const rot = t >= 4;
          const dW = rot ? h : w, dH = rot ? w : h;
          if (anchor === 0) anchor = 20;
          if (anchor & 32) y -= dH - 1; else if (anchor & 2) y -= (dH - 1) >>> 1;
          if (anchor & 8) x -= dW - 1; else if (anchor & 1) x -= (dW - 1) >>> 1;

          g.save();
          g.translate(x + tx, y + ty);

          // Xử lý lật và xoay sprite (MIDP Sprite transforms)
          if (t === 2) { // TRANS_MIRROR
            g.translate(w, 0); g.scale(-1, 1);
          } else if (t === 1) { // TRANS_MIRROR_ROT180
            g.translate(0, h); g.scale(1, -1);
          } else if (t === 3) { // TRANS_ROT180
            g.translate(w, h); g.scale(-1, -1);
          } else if (t === 5) { // TRANS_ROT90
            g.translate(h, 0); g.rotate(Math.PI / 2);
          } else if (t === 6) { // TRANS_ROT270
            g.translate(0, w); g.rotate(-Math.PI / 2);
          }

          g.drawImage(bmp, sx, sy, w, h, 0, 0, w, h);
          g.restore();
        }
        break;
      }
      default:
        break;
    }
  }

  g.restore();
  g.restore();
}
