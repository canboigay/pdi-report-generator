'use strict';
const {esc} = require('./esc');
const COL = {confirmed:'#6ee7b7', possible:'#fbbf24', notthem:'#f87171'};
const NW = 190, NH = 34, GAP = 22, TOP = 44, W = 1000;
function layout(map){
  const n = map.columns.length, slot = W/n, pos = {};
  const perCol = map.columns.map((_,i)=>map.nodes.filter(x=>x.col===i));
  const rows = Math.max(...perCol.map(c=>c.length), 1);
  const H = TOP + rows*(NH+GAP) + 10;
  perCol.forEach((nodes,i)=>{
    const total = nodes.length*NH + (nodes.length-1)*GAP, y0 = TOP + ((H-TOP-10) - total)/2;
    nodes.forEach((nd,j)=>{ pos[nd.id] = {x: i*slot + (slot-NW)/2, y: y0 + j*(NH+GAP), col:i}; });
  });
  return {pos, H, slot};
}
function mapSvg(map){
  const {pos, H, slot} = layout(map);
  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="g" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M22 0H0V22" fill="none" stroke="rgba(110,231,183,.05)"/></pattern>`;
  for (const [k,c] of Object.entries(COL)) s += `<marker id="a-${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="${c}"/></marker>`;
  s += `</defs><rect width="${W}" height="${H}" fill="url(#g)"/>`;
  map.columns.forEach((c,i)=>{ s += `<text x="${i*slot+slot/2}" y="20" text-anchor="middle" font-family="IBM Plex Mono" font-size="9" letter-spacing="2" fill="#7a7a88">${esc(c.toUpperCase())}</text>`; });
  for (const e of map.edges){
    const a = pos[e.from], b = pos[e.to];
    let x1,y1,x2,y2;
    const dash0 = e.kind==='confirmed' ? '' : ' stroke-dasharray="5 4"';
    if (a.col === b.col){ // same column: curve out to the left so the line never crosses nodes in between
      const xa=a.x, ya=a.y+NH/2, yb=b.y+NH/2, bulge=Math.min(a.x-4, 14+Math.abs(yb-ya)*0.12);
      s += `<path d="M${xa.toFixed(1)},${ya.toFixed(1)} C${(xa-bulge).toFixed(1)},${ya.toFixed(1)} ${(xa-bulge).toFixed(1)},${yb.toFixed(1)} ${(xa-2).toFixed(1)},${yb.toFixed(1)}" fill="none" stroke="${COL[e.kind]}" stroke-width="1.5"${dash0} marker-end="url(#a-${e.kind})"/>`;
      continue;
    }
    else if (b.col > a.col){ x1=a.x+NW; y1=a.y+NH/2; x2=b.x-2; y2=b.y+NH/2; }
    else { x1=a.x; y1=a.y+NH/2; x2=b.x+NW+2; y2=b.y+NH/2; }
    const dash = e.kind==='confirmed' ? '' : ' stroke-dasharray="5 4"';
    s += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${COL[e.kind]}" stroke-width="1.5"${dash} marker-end="url(#a-${e.kind})"/>`;
  }
  for (const nd of map.nodes){
    const p = pos[nd.id];
    s += `<rect x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}" width="${NW}" height="${NH}" rx="7" fill="#111114" stroke="${nd.own?'#6ee7b7':'#2d2d45'}" stroke-width="1.3"/><text x="${(p.x+NW/2).toFixed(1)}" y="${(p.y+21).toFixed(1)}" text-anchor="middle" font-family="Outfit" font-size="12" fill="#e8e8ec">${esc(nd.label)}</text>`;
  }
  return s + '</svg>';
}
module.exports = {mapSvg, layout};
