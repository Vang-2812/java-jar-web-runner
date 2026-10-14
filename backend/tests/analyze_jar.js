const fs = require('fs');

const buf = fs.readFileSync('c:/Users/vangk/Downloads/NST_X1.jar');
const str = buf.toString('latin1');

// Tìm socket URLs
const socketMatches = str.match(/socket:\/\/[^\x00\s"']+/g) || [];
console.log('--- Socket Matches ---');
console.log(Array.from(new Set(socketMatches)));

// Tìm http URLs
const httpMatches = str.match(/https?:\/\/[^\x00\s"']+/g) || [];
console.log('--- HTTP Matches ---');
console.log(Array.from(new Set(httpMatches)));

// Tìm port numbers (thường 14444 hoặc tương tự)
const portMatches = str.match(/:1444[0-9]/g) || [];
console.log('--- Port Matches ---');
console.log(Array.from(new Set(portMatches)));
