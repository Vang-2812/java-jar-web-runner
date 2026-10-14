const { execSync } = require('child_process');

function getMidletClass(jarPath) {
  try {
    let out = '';
    try {
      out = execSync(`tar -xf "${jarPath}" -O META-INF/MANIFEST.MF 2>nul || tar -xf "${jarPath}" -O META-INF/MANIFEST.MF 2>/dev/null`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
    } catch (e) {
      try {
        out = execSync(`unzip -p "${jarPath}" META-INF/MANIFEST.MF 2>/dev/null`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
      } catch (e2) {}
    }

    if (out) {
      const match = out.match(/MIDlet-1:\s*[^,]+,[^,]*,\s*([^\r\n]+)/i);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  } catch (err) {}
  return null;
}

const midletClass = getMidletClass('c:/Users/vangk/Downloads/NST_X1.jar');
console.log('RESULT MIDLET CLASS:', midletClass);
