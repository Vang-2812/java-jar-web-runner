const assert = require('assert');
const http = require('http');
const { app, nsoBot } = require('../src/index');

assert(typeof app === 'function', 'Express app phải được export');
assert(nsoBot, 'nsoBot instance phải được export');

// Kiểm tra các route NSO tồn tại trên router của express
const routes = [];
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    routes.push({
      path: middleware.route.path,
      methods: Object.keys(middleware.route.methods)
    });
  }
});

const paths = routes.map(r => r.path);
assert(paths.includes('/api/nso/start'), 'Thiếu route /api/nso/start');
assert(paths.includes('/api/nso/stop'), 'Thiếu route /api/nso/stop');
assert(paths.includes('/api/nso/status'), 'Thiếu route /api/nso/status');
assert(paths.includes('/api/nso/snapshot'), 'Thiếu route /api/nso/snapshot');

console.log('✔ API NSO routes test passed!');
