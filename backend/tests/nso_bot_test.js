const assert = require('assert');
const { NsoBotManager } = require('../src/nsoBotManager');

const bot = new NsoBotManager();
const status = bot.getStatus();
assert.strictEqual(status.running, false, 'Trạng thái ban đầu của bot phải là false');
assert.strictEqual(status.uptimeSeconds, 0, 'Uptime ban đầu phải là 0');

bot.saveAccountConfig({
  username: 'testuser',
  password: 'testpassword',
  server: '1',
  map: '22',
  zone: '5'
});

const updatedStatus = bot.getStatus();
assert.strictEqual(updatedStatus.username, 'testuser');
assert.strictEqual(updatedStatus.server, '1');

console.log("✔ NsoBotManager unit test passed!");
