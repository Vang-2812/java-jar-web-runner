const zlib = require('zlib');

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

function encodeZigzag(n) {
  return (n << 1) ^ (n >> 31);
}

function decodeZigzag(n) {
  return (n >>> 1) ^ -(n & 1);
}

function writeVarInt(buf, offset, val) {
  let z = encodeZigzag(val);
  let p = offset;
  while ((z & ~0x7f) !== 0) {
    buf[p++] = (z & 0x7f) | 0x80;
    z >>>= 7;
  }
  buf[p++] = z & 0x7f;
  return p - offset;
}

function readVarInt(buf, offset) {
  let r = 0;
  let shift = 0;
  let p = offset;
  let b;
  do {
    b = buf[p++];
    r |= (b & 0x7f) << shift;
    shift += 7;
  } while (b & 0x80);

  return { value: decodeZigzag(r), bytesRead: p - offset };
}

// Đóng gói frame định nghĩa ảnh (DEF - Type 5)
function packDefFrame(id, width, height, pngBuffer) {
  const header = Buffer.alloc(9);
  header[0] = 5; // Type DEF
  header.writeInt32BE(id, 1);
  header.writeUInt16BE(width, 5);
  header.writeUInt16BE(height, 7);
  return Buffer.concat([header, pngBuffer]);
}

// Đóng gói frame lệnh vẽ nén Deflate (Type 4)
function packCmdFrame(slot, width, height, clipX, clipY, clipW, clipH, commandsBuffer) {
  const rawHeader = Buffer.alloc(17);
  rawHeader[0] = 3; // Inner type CMD
  rawHeader.writeUInt32BE(slot, 1);
  rawHeader.writeUInt16BE(width, 5);
  rawHeader.writeUInt16BE(height, 7);
  rawHeader.writeUInt16BE(clipX, 9);
  rawHeader.writeUInt16BE(clipY, 11);
  rawHeader.writeUInt16BE(clipW, 13);
  rawHeader.writeUInt16BE(clipH, 15);

  const rawPayload = Buffer.concat([rawHeader, commandsBuffer]);
  const compressed = zlib.deflateRawSync(rawPayload);

  const outHeader = Buffer.alloc(5);
  outHeader[0] = 4; // Type Compressed CMD
  outHeader.writeUInt32BE(rawPayload.length, 1);

  return Buffer.concat([outHeader, compressed]);
}

module.exports = {
  OP,
  encodeZigzag,
  decodeZigzag,
  writeVarInt,
  readVarInt,
  packDefFrame,
  packCmdFrame,
};
