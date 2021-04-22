#!/usr/bin/env node

console.log('$ substrate-dev-run-test', process.argv.slice(2).join(' '));

require('jest-cli/bin/jest');
