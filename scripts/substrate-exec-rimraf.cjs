#!/usr/bin/env node
// Copyright 2024 Parity Technologies (UK) Ltd.

const fs = require('fs');

(function() {
    const dirs = process.argv.slice(2);

    if (!dirs.length) {
        throw new Error(`rimraf-exec: Invalid args length: retrieved ${dirs.length}`)
    }
    
    for (const dir of dirs) {
        if (fs.existsSync(dir)) {
          console.log(`rimraf-exec: ${dir}`)
          fs.rmSync(dir, { force: true, recursive: true });
        } else {
            console.warn(`rimraf-exec: ${dir} is an invalid file path and does not exist`)
        }
    }
})();
