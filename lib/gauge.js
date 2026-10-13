'use strict';
const L = require('./levels');
function needle(level){
  const a = L.ANGLE[level]; if (a === undefined) throw new Error('Unknown exposure level: '+level);
  const r = a*Math.PI/180;
  return {angle:a, x:+(115+70*Math.cos(r)).toFixed(1), y:+(118-70*Math.sin(r)).toFixed(1)};
}
function gaugeSvg(level){
  const n = needle(level), on = L.BANDS[level], col = L.LEVEL_COLOUR[level];
  const paths = ['M27,118 A88,88 0 0 1 52.8,55.8','M54.9,53.8 A88,88 0 0 1 113.5,30','M116.5,30 A88,88 0 0 1 175.1,53.8','M177.2,55.8 A88,88 0 0 1 203,118'];
  const bands = paths.map((d,i)=>`<path d="${d}" stroke="${L.BAND_COLOURS[i]}" opacity="${on.includes(i)?1:.35}"/>`).join('');
  return `<svg viewBox="0 0 230 140" width="270" height="164"><g fill="none" stroke-width="15">${bands}</g><path d="M12,118 A103,103 0 0 1 218,118" fill="none" stroke="#2d2d45"/><line x1="115" y1="118" x2="${n.x}" y2="${n.y}" stroke="#e8e8ec" stroke-width="2.2" stroke-linecap="round"/><circle cx="115" cy="118" r="6" fill="#0a0a0c" stroke="${col}" stroke-width="2"/><g font-family="IBM Plex Mono" font-size="7" fill="#7a7a88"><text x="10" y="134">LOW</text><text x="190" y="134">HIGH</text></g><text x="115" y="12" text-anchor="middle" font-family="IBM Plex Mono" font-size="7" fill="${col}">${level.toUpperCase()}</text></svg>`;
}
module.exports = {needle, gaugeSvg};
