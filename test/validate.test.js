'use strict';
const test = require('node:test'), assert = require('node:assert');
const {validate} = require('../lib/validate');
const {example} = require('./helpers');

test('fictional example validates cleanly', () => assert.deepStrictEqual(validate(example()), []));
test('rejects non-object input', () => assert.ok(validate(null).length));
test('missing required fields are reported', () => {
  const d = example(); delete d.subject.name; delete d.tiles.domains; d.timeline[0].event = '';
  const e = validate(d).join('\n');
  assert.match(e, /subject\.name/); assert.match(e, /tiles\.domains/); assert.match(e, /timeline\[0\]\.event/);
});
test('exposure level limited to allowed values', () => {
  for (const ok of ['Low','Moderate','Moderate-High','High','High-Critical','Critical']) { const d = example(); d.exposure.level = ok; assert.deepStrictEqual(validate(d), [], ok); }
  for (const bad of ['Medium','Moderate-high','Extreme','']) { const d = example(); d.exposure.level = bad; assert.match(validate(d).join(), /exposure\.level/, bad); }
});
test('severity limited to High/Medium/Low', () => {
  for (const bad of ['Low-Medium','Critical','Moderate']) { const d = example(); d.exposures[0].severity = bad; assert.match(validate(d).join(), /exposures\[0\]\.severity/, bad); }
});
test('at most five top exposures', () => { const d = example(); while (d.exposures.length < 6) d.exposures.push({...d.exposures[0]}); assert.match(validate(d).join(), /at most 5/); });
test('confidence values and zero-source rule', () => {
  let d = example(); d.findings[0].confidence = 'Certain'; assert.match(validate(d).join(), /findings\[0\]\.confidence/);
  d = example(); d.findings[0].sources = 0; assert.match(validate(d).join(), /0 sources must be Unverified/);
});
test('map: column range, duplicate ids, unknown edge endpoints, edge kinds', () => {
  const d = example();
  d.map.nodes[0].col = 9; d.map.nodes.push({...d.map.nodes[1]}); d.map.edges.push({from:'nope',to:'site',kind:'maybe'});
  const e = validate(d).join('\n');
  assert.match(e, /out of range/); assert.match(e, /duplicate/); assert.match(e, /unknown node "nope"/); assert.match(e, /edges\[\d+\]\.kind/);
});
test('map needs 2 to 4 columns', () => { const d = example(); d.map.columns = ['a','b','c','d','e']; assert.match(validate(d).join(), /2 to 4 columns/); });
test('mentions tile note must say what kinds were counted', () => { const d = example(); d.tiles.mentions.note = 'LinkedIn posts'; assert.match(validate(d).join(), /tiles\.mentions\.note/); });
test('dossier status values', () => { const d = example(); d.dossier[0].status = 'Verified'; assert.match(validate(d).join(), /dossier\[0\]\.status/); });
