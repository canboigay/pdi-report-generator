#!/usr/bin/env node
'use strict';
// Usage: node render.js input.json out.pdf   (also writes out.html next to the PDF)
const fs = require('fs'), path = require('path');
const {validate} = require('./lib/validate');
const {buildHtml} = require('./lib/build');
const {headerTemplate, footerTemplate} = require('./lib/templates');
const {findChrome} = require('./lib/chrome');

async function render(inFile, outPdf){
  const data = JSON.parse(fs.readFileSync(inFile,'utf8'));
  const errs = validate(data);
  if (errs.length) { const e = new Error('Validation failed:\n  '+errs.join('\n  ')); e.validation = errs; throw e; }
  const html = buildHtml(data);
  const outHtml = outPdf.replace(/\.pdf$/i,'') + '.html';
  fs.writeFileSync(outHtml, html);
  const exe = findChrome(); if (!exe) throw new Error('No Chrome/Chromium found. Run scripts/setup.sh or set PDI_CHROME.');
  const {chromium} = require('playwright-core');
  const b = await chromium.launch({executablePath: exe, args:['--font-render-hinting=none']});
  try {
    const p = await b.newPage();
    await p.goto('file://'+path.resolve(outHtml), {waitUntil:'load'});
    await p.evaluate(() => document.fonts.ready);
    await p.pdf({path: outPdf, printBackground:true, preferCSSPageSize:true, displayHeaderFooter:true,
      headerTemplate: headerTemplate(data.subject.name), footerTemplate: footerTemplate()});
  } finally { await b.close(); }
  return {html: outHtml, pdf: outPdf};
}
module.exports = {render};
if (require.main === module){
  const [,,i,o] = process.argv;
  if (!i || !o){ console.error('Usage: node render.js input.json out.pdf'); process.exit(2); }
  render(i,o).then(r=>console.log(`Wrote ${r.html}\nWrote ${r.pdf}`)).catch(e=>{ console.error(e.message); process.exit(1); });
}
