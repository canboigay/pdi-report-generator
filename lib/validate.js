'use strict';
const L = require('./levels');
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const PHONE = [
  /(?:\+?1[\s.-]?)?\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/,          // NANP: 250-555-0100, (250) 555 0100
  /\+\d{1,3}[\s.-]?\(?\d{1,4}\)?(?:[\s.-]?\d{2,4}){2,4}/,            // international with +
  /\b\d{3}[.]\d{3}[.]\d{4}\b/,
];
const TILE_KEYS = ['accounts','domains','mentions','filings','dataBrokers','breaches'];

function privacyScan(obj){
  const hits = [];
  (function walk(v, path){
    if (v && typeof v === 'object'){
      if (!Array.isArray(v) && 'withheld' in v){
        // A withheld field may carry only a label and a type: never a value.
        for (const k of Object.keys(v)) if (!['label','withheld'].includes(k)) hits.push(`${path}.${k}: withheld fields may only have "label" and "withheld"`);
        if (!['email','phone','address'].includes(v.withheld)) hits.push(`${path}.withheld: must be email, phone or address`);
      }
      for (const [k,x] of Object.entries(v)) walk(x, Array.isArray(v)?`${path}[${k}]`:`${path}.${k}`);
      return;
    }
    if (typeof v !== 'string') return;
    // URLs are scanned too, but the path part of a URL may contain long numeric ids; strip those before phone checks.
    const noUrlDigits = v.replace(/https?:\/\/\S+/g, u => u.replace(/\d{6,}/g,'#'));
    if (EMAIL.test(v)) hits.push(`${path}: looks like an email address`);
    if (PHONE.some(r=>r.test(noUrlDigits))) hits.push(`${path}: looks like a phone number`);
  })(obj, '$');
  return hits;
}

function validate(d){
  const e = [];
  const str = (v,p) => { if (typeof v !== 'string' || !v.trim()) e.push(`${p}: required non-empty string`); };
  const arr = (v,p) => { if (!Array.isArray(v)) { e.push(`${p}: required array`); return []; } return v; };
  const oneOf = (v,list,p) => { if (!list.includes(v)) e.push(`${p}: "${v}" not one of ${list.join(' | ')}`); };
  const cellText = (v,p) => { if (v && typeof v === 'object' && 'withheld' in v) return; str(v,p); };
  if (!d || typeof d !== 'object') return ['$: input must be a JSON object'];
  str(d.subject?.name,'subject.name'); str(d.subject?.city,'subject.city');
  str(d.meta?.reportDate,'meta.reportDate'); str(d.meta?.sourcesChecked,'meta.sourcesChecked');
  for (const k of TILE_KEYS){ const t = d.tiles?.[k]; if (!t){ e.push(`tiles.${k}: required`); continue; }
    if (t.value === undefined || t.value === '') e.push(`tiles.${k}.value: required`); str(t.note,`tiles.${k}.note`); oneOf(t.state,L.TILE_STATES,`tiles.${k}.state`); }
  if (d.tiles?.mentions && !/press|news|podcast|event/i.test(d.tiles.mentions.note||'')) e.push('tiles.mentions.note: must say which kinds were counted (press/news/podcasts/events)');
  oneOf(d.exposure?.level, L.EXPOSURE, 'exposure.level'); str(d.exposure?.assessment,'exposure.assessment');
  arr(d.timeline,'timeline').forEach((t,i)=>{ str(t.when,`timeline[${i}].when`); str(t.event,`timeline[${i}].event`); str(t.source,`timeline[${i}].source`); });
  const m = d.map || {}; const cols = arr(m.columns,'map.columns'); if (cols.length<2||cols.length>4) e.push('map.columns: 2 to 4 columns');
  const ids = new Set();
  arr(m.nodes,'map.nodes').forEach((n,i)=>{ str(n.id,`map.nodes[${i}].id`); str(n.label,`map.nodes[${i}].label`);
    if (!Number.isInteger(n.col)||n.col<0||n.col>=cols.length) e.push(`map.nodes[${i}].col: column index out of range`);
    if (ids.has(n.id)) e.push(`map.nodes[${i}].id: duplicate "${n.id}"`); ids.add(n.id); });
  arr(m.edges,'map.edges').forEach((x,i)=>{ if(!ids.has(x.from)) e.push(`map.edges[${i}].from: unknown node "${x.from}"`); if(!ids.has(x.to)) e.push(`map.edges[${i}].to: unknown node "${x.to}"`); oneOf(x.kind,L.EDGE_KINDS,`map.edges[${i}].kind`); });
  arr(d.dossier,'dossier').forEach((r,i)=>{ cellText(r.identifier,`dossier[${i}].identifier`); str(r.type,`dossier[${i}].type`); oneOf(r.status,L.DOSSIER_STATUS,`dossier[${i}].status`); str(r.evidence,`dossier[${i}].evidence`); });
  arr(d.findings,'findings').forEach((r,i)=>{ for (const k of ['finding','type','link','date']) str(r[k],`findings[${i}].${k}`);
    if (!Number.isInteger(r.sources)||r.sources<0) e.push(`findings[${i}].sources: integer >= 0`); oneOf(r.confidence,L.CONFIDENCE,`findings[${i}].confidence`);
    if (r.sources===0 && r.confidence!=='Unverified') e.push(`findings[${i}].confidence: a finding with 0 sources must be Unverified`); });
  for (const k of ['colleagues','speakers','organisations']) arr(d.network?.[k],`network.${k}`);
  const ex = arr(d.exposures,'exposures'); if (ex.length>5) e.push('exposures: at most 5');
  ex.forEach((x,i)=>{ str(x.title,`exposures[${i}].title`); oneOf(x.severity,L.SEVERITY,`exposures[${i}].severity`); str(x.description,`exposures[${i}].description`); str(x.fix,`exposures[${i}].fix`); });
  oneOf(d.breaches?.status,['checked','not-checked'],'breaches.status'); str(d.breaches?.text,'breaches.text');
  arr(d.notes,'notes'); arr(d.checklist,'checklist');
  for (const k of ['unreachable','possible','ruledOut']) str(d.gaps?.[k],`gaps.${k}`);
  return e.concat(privacyScan(d).map(h=>'PRIVACY '+h));
}
module.exports = {validate, privacyScan, EMAIL, PHONE};
