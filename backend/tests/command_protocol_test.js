const assert = require('assert');
const { encodeZigzag, decodeZigzag, writeVarInt, readVarInt, OP, packCmdFrame, packDefFrame } = require('../src/commandProtocol');

// 1. Kiểm tra mã hoá / giải mã số nguyên Zigzag
assert.strictEqual(decodeZigzag(encodeZigzag(0)), 0);
assert.strictEqual(decodeZigzag(encodeZigzag(-1)), -1);
assert.strictEqual(decodeZigzag(encodeZigzag(1)), 1);
assert.strictEqual(decodeZigzag(encodeZigzag(-12345)), -12345);
assert.strictEqual(decodeZigzag(encodeZigzag(65535)), 65535);

// 2. Kiểm tra ghi và đọc VarInt vào buffer
const buf = Buffer.alloc(32);
const written = writeVarInt(buf, 0, -250);
const { value, bytesRead } = readVarInt(buf, 0);
assert.strictEqual(value, -250);
assert.strictEqual(bytesRead, written);

// 3. Kiểm tra packDefFrame (Type 5)
const fakePng = Buffer.from([0x89, 0x50, 0x4e, 0x47]); // PNG header
const defPacket = packDefFrame(101, 24, 32, fakePng);
assert.strictEqual(defPacket[0], 5, 'Type phải là 5');
assert.strictEqual(defPacket.readInt32BE(1), 101, 'Image ID phải là 101');
assert.strictEqual(defPacket.readUInt16BE(5), 24, 'Width phải là 24');
assert.strictEqual(defPacket.readUInt16BE(7), 32, 'Height phải là 32');
assert.deepStrictEqual(defPacket.subarray(9), fakePng, 'Dữ liệu PNG phải khớp');

// 4. Kiểm tra packCmdFrame (Type 4)
const rawCommands = Buffer.from([OP.COLOR, 0x00, OP.FILL_RECT, 0x02, 0x04, 0x06, 0x08]);
const cmdPacket = packCmdFrame(1, 240, 320, 0, 0, 240, 320, rawCommands);
assert.strictEqual(cmdPacket[0], 4, 'Type nén phải là 4');
const uncompressedLen = cmdPacket.readUInt32BE(1);
assert(uncompressedLen > 0, 'Uncompressed length phải > 0');
assert(cmdPacket.length > 5, 'Gói nén phải có dữ liệu');

console.log('✔ commandProtocol unit tests passed!');
