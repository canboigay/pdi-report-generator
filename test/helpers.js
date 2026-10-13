'use strict';
const fs = require('fs'), path = require('path');
const EXAMPLE = path.join(__dirname,'..','examples','fictional-subject.json');
const example = () => JSON.parse(fs.readFileSync(EXAMPLE,'utf8'));
module.exports = {example, EXAMPLE};
