#!/usr/bin/env node

console.log('rimraf', process.argv.slice(2).join(' '));

require('rimraf/bin');
