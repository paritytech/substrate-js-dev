#!/usr/bin/env node

console.log('jest', process.argv.slice(2).join(' '));

require('jest-cli/bin/jest');
