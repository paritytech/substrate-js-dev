#!/usr/bin/env node
// Copyright 2022 Parity Technologies (UK) Ltd.
const fs = require('fs');

(function() {
    const dirs = process.argv.slice(2);
    
    for (const dir of dirs) {
        if (fs.existsSync(dir)) {
          fs.rmSync(dir, { force: true, recursive: true });
        }
    }
})();
