'use strict';
const fs = require('fs'), path = require('path');
const {esc, wbr} = require('./esc');
const {gaugeSvg} = require('./gauge');
const {mapSvg} = require('./map');
const L = require('./levels');
const FONT_DIR = path.join(__dirname,'..','fonts');
const EYE = '<svg width="30" height="30" viewBox="0 0 32 32"><path d="M2 16C6 8.5 11 5 16 5s10 3.5 14 11c-4 7.5-9 11-14 11S6 23.5 2 16z" fill="none" stroke="#6ee7b7" stroke-width="2"/><circle cx="16" cy="16" r="5.5" fill="none" stroke="#6ee7b7" stroke-width="2"/><circle cx="16" cy="16" r="2" fill="#6ee7b7"/></svg>';
const FONTS = [['Outfit','Outfit-Variable.ttf','100 900'],['IBM Plex Mono','IBMPlexMono-Regular.ttf','400'],['IBM Plex Mono','IBMPlexMono-Medium.ttf','500'],['IBM Plex Mono','IBMPlexMono-SemiBold.ttf','600 700']];
function fontFaces(){
  return FONTS.map(([fam,file,w])=>`@font-face{font-family:"${fam}";src:url(data:font/ttf;base64,${fs.readFileSync(path.join(FONT_DIR,file)).toString('base64')}) format("truetype");font-weight:${w};font-style:normal;font-display:block}`).join('\n');
}
const CSS = () => fs.readFileSync(path.join(__dirname,'style.css'),'utf8');
const WH = w => `<span class="withheld">${esc(w)} withheld</span>`;
const cell = v => (v && typeof v==='object' && 'withheld' in v) ? `${v.label?esc(v.label)+' ':''}${WH(v.withheld)}` : esc(v);
const link = (u,t) => /^https?:\/\//.test(u) ? `<a href="${esc(u)}">${wbr(t||u.replace(/^https?:\/\//,''))}</a>` : wbr(u);
const CONF = {High:'b-high',Medium:'b-med',Low:'b-low',Unverified:'b-low'};
const STAT = {Confirmed:'b-high',Possible:'b-med','Not them':'b-low'};
const SEV = {High:'s-high',Medium:'s-med',Low:'s-low'};
const TILE_LABEL = {accounts:'Accounts',domains:'Domains',mentions:'Mentions',filings:'Filings',dataBrokers:'Data brokers',breaches:'Breaches'};
const TILE_CLS = {found:'',warn:'warn',none:'none'};
const sec = (n,t,body,cls='') => `<section${cls?` class="${cls}"`:''}><h2><span class="num">${n}</span>${esc(t)}</h2>${body}</section>`;
const list = a => a.length ? a.map(x=>esc(x)).join(' · ') : '<span style="color:var(--dim)">None in public sources</span>';

function buildHtml(d){
  const col = L.LEVEL_COLOUR[d.exposure.level];
  let o = `<!doctype html><html><head><meta charset="utf-8"><title>${esc('PDI · '+d.subject.name)}</title><style>\n${fontFaces()}\n${CSS()}</style></head><body><div class="wrap">`;
  o += `<div class="cover"><div class="brandrow"><div class="brand">${EYE}<div><div class="name">Private Digital Investigator</div><div class="by">by nuculair.com</div></div></div><div class="tag">Open-Source Dossier</div></div><div class="kicker">Subject file</div><h1>${esc(d.subject.name)}</h1><div class="sub">${esc(d.subject.city)}</div><div class="meta"><div><div class="k">Report date</div><div class="v">${esc(d.meta.reportDate)}</div></div><div><div class="k">Overall exposure</div><div class="v" style="color:${col};font-weight:600">${esc(d.exposure.level)}</div></div><div><div class="k">Sources checked</div><div class="v">${esc(d.meta.sourcesChecked)}</div></div></div><div class="status">Public sources only · email addresses and phone values withheld from this report</div></div>`;
  o += sec('01','At a glance',`<div class="tiles">${Object.keys(TILE_LABEL).map(k=>{const t=d.tiles[k];return `<div class="tile ${TILE_CLS[t.state]}"><div class="k">${TILE_LABEL[k]}</div><div class="v">${esc(t.value)}${t.extra?` <small>${esc(t.extra)}</small>`:''}</div><div class="d">${esc(t.note)}</div></div>`;}).join('')}</div>`);
  o += sec('02','Overall exposure',`<div class="panel exposure">${gaugeSvg(d.exposure.level)}<div><div class="lbl">Assessment</div><div class="level" style="color:${col}">${esc(d.exposure.level)}</div><p>${esc(d.exposure.assessment)}</p></div></div>`,'avoid');
  o += sec('03','Life timeline',`<div class="panel" style="padding:10px 14px 10px 4px"><div class="tl">${d.timeline.map(t=>`<div class="ev"><div class="when">${esc(t.when)}</div><div class="what">${esc(t.event)}<span class="src">${t.url?link(t.url,t.source):esc(t.source)}</span></div></div>`).join('')}</div></div>`,'pb');
  o += sec('04','Connection map',`<div class="panel map">${mapSvg(d.map)}<div class="legend"><span><i></i>Confirmed link</span><span><i class="dash"></i>Unconfirmed</span><span><i class="red"></i>Different owner</span></div></div>`,'avoid');
  o += sec('05','Identity dossier',`<table><thead><tr><th>Identifier</th><th>Type</th><th>Status</th><th>Evidence</th></tr></thead><tbody>${d.dossier.map(r=>`<tr><td>${cell(r.identifier)}</td><td>${esc(r.type)}</td><td><span class="badge ${STAT[r.status]}">${esc(r.status)}</span></td><td>${r.evidenceUrl?link(r.evidenceUrl,r.evidence):esc(r.evidence)}</td></tr>`).join('')}</tbody></table>`);
  o += sec('06','Findings',`<table><thead><tr><th>Finding</th><th>Type</th><th>Link</th><th>Date</th><th>Sources</th><th>Confidence</th></tr></thead><tbody>${d.findings.map(r=>`<tr><td>${esc(r.finding)}</td><td>${esc(r.type)}</td><td class="link">${link(r.link)}</td><td class="date">${esc(r.date)}</td><td>${r.sources}</td><td><span class="badge ${CONF[r.confidence]}">${esc(r.confidence)}</span></td></tr>`).join('')}</tbody></table>`);
  o += sec('07','Network',`<div class="grid3"><div class="panel"><div class="k">Co-founders / colleagues</div><p>${list(d.network.colleagues)}</p></div><div class="panel"><div class="k">Co-speakers / hosts</div><p>${list(d.network.speakers)}</p></div><div class="panel"><div class="k">Organisations</div><p>${list(d.network.organisations)}</p></div></div>`);
  o += sec('08','Top exposures', d.exposures.map((x,i)=>`<div class="card"><div class="n">${String(i+1).padStart(2,'0')}</div><div><div class="t"><h3>${esc(x.title)}</h3><span class="badge ${SEV[x.severity]}">${esc(x.severity)}</span></div><p>${esc(x.description)}</p><div class="fix"><b>FIX</b>${esc(x.fix)}${x.fixLink?' '+link(x.fixLink):''}</div></div></div>`).join('') || '<div class="panel" style="padding:12px 14px">No significant exposures found.</div>');
  o += sec('09','Breaches',`<div class="panel" style="padding:12px 14px">${d.breaches.status==='not-checked'?'<b style="color:var(--amber)">Not checked.</b> ':''}${esc(d.breaches.text)}</div>`,'avoid');
  o += sec('10','Investigator notes',`<div class="panel"><ul class="notes">${d.notes.map(n=>`<li>${esc(n)}</li>`).join('')}</ul></div>`);
  o += sec('11','Cleanup checklist',`<div class="panel"><ul class="check">${d.checklist.map(n=>`<li>${esc(n)}</li>`).join('')}</ul></div>`,'avoid');
  o += sec('12','Gaps and possible matches',`<div class="grid3"><div class="panel"><div class="k">Unreachable</div><p>${esc(d.gaps.unreachable)}</p></div><div class="panel"><div class="k">Possible matches</div><p>${esc(d.gaps.possible)}</p></div><div class="panel"><div class="k">Ruled out</div><p>${esc(d.gaps.ruledOut)}</p></div></div><div class="endmark">END OF FILE</div>`,'avoid');
  return o + '</div></body></html>';
}
module.exports = {buildHtml};
