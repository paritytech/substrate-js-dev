#!/usr/bin/env node
// Copyright 2022 Parity Technologies (UK) Ltd.

// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0
//
// This has been converted from the original version which can be found here:
//
// https://github.com/polkadot-js/dev/blob/ce1831b8d17a41211f99fa71551450524d9bb61e/packages/dev/scripts/polkadot-dev-run-lint.mjs

const execSync = require('./execSync.cjs');
const args = process.argv.slice(2).join(' ');

const checkArgs = process.argv.slice(2).filter((val) => {
    return val.split(' ').length > 1;
});

if (checkArgs.length === 0) {
    execSync(`yarn substrate-exec-tsc --noEmit && substrate-exec-eslint . --ext ts ${args}`);
} else {
    console.warn(`Incorrect input. String arguments can't have spaces: ${checkArgs.join(' - ')}`)
}
