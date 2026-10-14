const assert = require('assert');
const { ProcessManager } = require('../src/processManager');

console.log("=== BẮT ĐẦU KIỂM THỬ PROCESS MANAGER ===");

const pm = new ProcessManager();

// Test 1: Trạng thái ban đầu
const initialStatus = pm.getStatus();
assert.strictEqual(initialStatus.running, false, "Ban đầu không được có tiến trình chạy");
assert.strictEqual(initialStatus.game, null, "Game ban đầu phải là null");
console.log("✔ Test 1: Trạng thái ban đầu chính xác (running = false)");

// Test 2: Báo lỗi khi file jar không tồn tại
assert.throws(() => {
  pm.start('/path/to/non_existent_game.jar');
}, /File không tồn tại/, "Phải ném lỗi khi file jar không tồn tại");
console.log("✔ Test 2: Kiểm tra bắt lỗi file không tồn tại thành công");

// Test 3: Log hoạt động
pm.log("Kiểm thử ghi log");
const statusWithLogs = pm.getStatus();
assert(statusWithLogs.logs.length > 0, "Log phải được ghi nhận");
console.log("✔ Test 3: Ghi nhận log hoạt động thành công");

// Test 4: Stop an toàn khi không có tiến trình
const stopStatus = pm.stop();
assert.strictEqual(stopStatus.running, false);
console.log("✔ Test 4: Dừng an toàn khi không chạy");

console.log("🎉 TẤT CẢ CÁC BÀI TEST PROCESS MANAGER ĐÃ VƯỢT QUA!");
