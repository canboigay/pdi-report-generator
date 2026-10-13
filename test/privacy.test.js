'use strict';
const test = require('node:test'), assert = require('node:assert');
const {validate, privacyScan} = require('../lib/validate');
const {example} = require('./helpers');

const inject = (fn) => { const d = example(); fn(d); return validate(d).filter(x=>x.startsWith('PRIVACY')); };
test('email in any field fails', () => {
  assert.ok(inject(d => d.findings[0].finding = 'Contact at someone@example.com').length);
  assert.ok(inject(d => d.gaps.possible = 'see first.last+tag@mail.example.org').length);
  assert.ok(inject(d => d.network.colleagues.push('x@y.io')).length);
});
test('phone patterns fail', () => {
  for (const ph of ['250-555-0199','(250) 555 0199','250.555.0199','+1 250 555 0199','+44 20 7946 0958','1-800-555-0100'])
    assert.ok(inject(d => d.notes.push('call '+ph)).length, ph);
});
test('withheld field passes but may not carry a value', () => {
  assert.deepStrictEqual(inject(()=>{}), []);
  assert.ok(inject(d => d.dossier[4].identifier.value = 'hidden@example.com').length);
  assert.ok(inject(d => d.dossier[4].identifier.withheld = 'ssn').length);
});
test('dates, years, ids and long URL ids are not false positives', () => {
  assert.deepStrictEqual(privacyScan({a:'2021-03-02', b:'2017–2020', c:'Jan 15, 2030, 10:00 AM PT', d:'https://news.example.com/posts/activity-7435424871813242880-Tqif', e:'HL-0001', f:'medium.com/@handle'}), []);
});
