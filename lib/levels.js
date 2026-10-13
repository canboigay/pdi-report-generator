'use strict';
const EXPOSURE = ['Low','Moderate','Moderate-High','High','High-Critical','Critical'];
const SEVERITY = ['High','Medium','Low'];
const CONFIDENCE = ['High','Medium','Low','Unverified'];
const DOSSIER_STATUS = ['Confirmed','Possible','Not them'];
const EDGE_KINDS = ['confirmed','possible','notthem'];
const TILE_STATES = ['found','warn','none'];
// Needle angle (degrees) per exposure level, from the skill.
const ANGLE = {'Low':157,'Moderate':113,'Moderate-High':90,'High':67,'High-Critical':45,'Critical':23};
// Band indexes lit for each level (0 Low,1 Moderate,2 High,3 Critical).
const BANDS = {'Low':[0],'Moderate':[1],'Moderate-High':[1,2],'High':[2],'High-Critical':[2,3],'Critical':[3]};
const BAND_COLOURS = ['#6ee7b7','#d6e36f','#fbbf24','#f87171'];
const LEVEL_COLOUR = {'Low':'#6ee7b7','Moderate':'#d6e36f','Moderate-High':'#d6e36f','High':'#fbbf24','High-Critical':'#fbbf24','Critical':'#f87171'};
module.exports = {EXPOSURE,SEVERITY,CONFIDENCE,DOSSIER_STATUS,EDGE_KINDS,TILE_STATES,ANGLE,BANDS,BAND_COLOURS,LEVEL_COLOUR};
