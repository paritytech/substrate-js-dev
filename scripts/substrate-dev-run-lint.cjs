#!/usr/bin/env node
// Copyright 2022 Parity Technologies (UK) Ltd.

// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0
//
// This has been converted from the original version which can be found here:
//
// https://github.com/polkadot-js/dev/blob/ce1831b8d17a41211f99fa71551450524d9bb61e/packages/dev/scripts/polkadot-dev-run-lint.mjs

const execSync = require('./execSync.cjs');

const argv = require('yargs')
    .options({
        '--fix': {
            description: 'Eslint --fix flag',
            type: 'boolean'
        }
    })
    .strict()
    .argv;

const fix = argv.fix ? '--fix' : '';

execSync(`yarn substrate-exec-tsc --noEmit && substrate-exec-eslint . --ext ts ${fix}`);
