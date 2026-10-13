'use strict';
const test = require('node:test'), assert = require('node:assert');
const fs = require('fs'), os = require('os'), path = require('path'), {execFileSync} = require('child_process');
const {render} = require('../render');
const {findChrome} = require('../lib/chrome');
const {mapSvg} = require('../lib/map');
const {example, EXAMPLE} = require('./helpers');
const has = cmd => { try { execFileSync('which',[cmd]); return true; } catch { return false; } };

test('map SVG has a node per node and an arrow per edge', () => {
  const d = example(), s = mapSvg(d.map);
  assert.strictEqual((s.match(/<rect x=/g)||[]).length, d.map.nodes.length);
  assert.strictEqual((s.match(/marker-end=/g)||[]).length, d.map.edges.length);
  assert.match(s, /stroke-dasharray="5 4"/);
});
test('render refuses input that fails the privacy guard', async () => {
  const d = example(); d.notes.push('reach me at leak@example.com');
  const f = path.join(os.tmpdir(), 'pdi-bad.json'); fs.writeFileSync(f, JSON.stringify(d));
  await assert.rejects(render(f, path.join(os.tmpdir(),'pdi-bad.pdf')), /PRIVACY/);
});
test('smoke render: pages > 0, fonts embedded, html self-contained', {skip: !findChrome() && 'no Chrome'}, async () => {
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(),'pdi-')), 'smoke.pdf');
  const r = await render(EXAMPLE, out);
  const html = fs.readFileSync(r.html,'utf8');
  assert.match(html, /@font-face\{font-family:"Outfit";src:url\(data:font\/ttf;base64,/);
  assert.match(html, /@font-face\{font-family:"IBM Plex Mono";src:url\(data:font\/ttf;base64,/);
  assert.doesNotMatch(html, /<link |src="http|url\(http/, 'no external resources');
  assert.ok(fs.statSync(out).size > 10000);
  if (has('pdfinfo')) { const pages = +execFileSync('pdfinfo',[out]).toString().match(/Pages:\s+(\d+)/)[1]; assert.ok(pages > 0); }
  if (has('pdffonts')) {
    const f = execFileSync('pdffonts',[out]).toString();
    assert.match(f, /Outfit/); assert.match(f, /IBMPlexMono/);
    for (const line of f.split('\n').slice(2).filter(Boolean)) assert.match(line, /\syes\s/, 'every font embedded: '+line);
  }
});
