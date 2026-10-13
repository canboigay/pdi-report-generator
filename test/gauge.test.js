'use strict';
const test = require('node:test'), assert = require('node:assert');
const {needle, gaugeSvg} = require('../lib/gauge');
const expected = {'Low':157,'Moderate':113,'Moderate-High':90,'High':67,'High-Critical':45,'Critical':23};
test('needle angles match the skill', () => { for (const [l,a] of Object.entries(expected)) assert.strictEqual(needle(l).angle, a, l); });
test('needle tip = (115+70cos θ, 118-70sin θ)', () => {
  assert.deepStrictEqual([needle('Moderate-High').x, needle('Moderate-High').y], [115, 48]);
  assert.deepStrictEqual([needle('Moderate').x, needle('Moderate').y], [87.6, 53.6]);
  for (const l of Object.keys(expected)) { const n = needle(l); assert.ok(Math.abs(Math.hypot(n.x-115, 118-n.y) - 70) < 0.2, l); }
});
test('active bands at full opacity, others at .35', () => {
  const count = s => (s.match(/opacity="1"/g)||[]).length;
  assert.strictEqual(count(gaugeSvg('Low')), 1); assert.strictEqual(count(gaugeSvg('Moderate-High')), 2); assert.strictEqual(count(gaugeSvg('Critical')), 1);
  assert.match(gaugeSvg('High'), /MODERATE|HIGH/);
});
test('unknown level throws', () => assert.throws(() => needle('Severe')));
