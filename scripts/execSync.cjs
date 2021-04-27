#!/usr/bin/env node

const { execSync } = require('child_process');

module.exports = function execute(cmd) {
    try {
        execSync(cmd, { stdio: 'inherit' });
    } catch (error) {
        process.exit(-1);
    }
};
