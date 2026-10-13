'use strict';
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const wbr = s => esc(s).replace(/\//g,'/<wbr>');
module.exports = {esc, wbr};
