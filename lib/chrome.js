'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
function findChrome(){
  const cands = [process.env.PDI_CHROME, '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium'];
  // playwright-managed browsers (installed by scripts/setup.sh)
  const pw = path.join(process.env.PLAYWRIGHT_BROWSERS_PATH || path.join(os.homedir(), '.cache','ms-playwright'));
  if (fs.existsSync(pw)) for (const d of fs.readdirSync(pw).filter(x=>/^chromium/.test(x)).sort().reverse())
    for (const sub of ['chrome-linux/chrome','chrome-linux64/chrome','chrome-headless-shell-linux64/chrome-headless-shell']) cands.push(path.join(pw,d,sub));
  return cands.find(f => f && fs.existsSync(f)) || null;
}
module.exports = {findChrome};
