#!/usr/bin/env node
'use strict';

const fs = require('fs');
const execSync = require('child_process').execSync;
const { resolve } = require('path');
const { readdir, stat } = require('fs').promises;

const depSpecs = {
    api: {
        releaseLink: 'https://api.github.com/repos/polkadot-js/api/releases/latest',
        packages: [
            'api',
            'api-augment',
            'api-base',
            'api-derive',
            'rpc-core',
            'rpc-augment',
            'rpc-provider',
            'types',
            'types-augment',
            'types-codec',
            'types-create',
            'types-support',
            'types-known',
        ],
    },
    apps: {
        releaseLink: 'https://api.github.com/repos/polkadot-js/apps/releases/latest',
        packages: [
            'apps-config'
        ],
    },
    common: {
        releaseLink: 'https://api.github.com/repos/polkadot-js/common/releases/latest',
        packages: [
            'util',
            'util-crypto',
            'keyring',
            'networks',
            'x-fetch',
            'x-global',
            'x-bigint',
            'x-ws',
        ],
    },
    wasm: {
        releaseLink: 'https://api.github.com/repos/polkadot-js/wasm/releases/latest',
        packages: [
            'wasm-crypto'
        ],
    }
}

function fetchReleaseTag(link) {
    const cmd = `curl --silent ${link}`;
    const res = execSync(cmd).toString();
    const resJson = JSON.parse(res);

    return resJson['tag_name'];
}

function updatePackageJson(path, config) {
    const rawData = fs.readFileSync(path);
    const packageJson = JSON.parse(rawData);
    const deps = packageJson['dependencies'];
    const resolutions = packageJson['resolutions'];

    for(const packageName of Object.keys(config)) {
        // check and update dependencies key
        if (Object.keys(deps).includes(packageName)) {
            packageJson['dependencies'][packageName] = config[packageName];
        }

        // check and update resolutions key
        if (Object.keys(resolutions).includes(packageName)) {
            packageJson['resolutions'][packageName] = config[packageName];
        }
    }

    fs.writeFileSync(path, JSON.stringify(packageJson, null, 2).concat('\n'));
}

// Generator function
async function* getFiles(rootPath) {
    const fileNames = await readdir(rootPath);
    for (const fileName of fileNames) {
        const path = resolve(rootPath, fileName);
        if (path.endsWith('node_modules')) {
            // Do not traverse any node_modules directories
            yield;
        } else if (path.split('/').slice(-1)[0].startsWith('.')) {
            // Do no traverse any hidden directories
            yield;
        } else if ((await stat(path)).isDirectory()) {
            yield* getFiles(path);
        } else if (path.endsWith('package.json')) {
            yield path;
        }
    }
}

async function main(rootPath = './') {
    // iterate through constants and create an object that stores each packages name
    // to their corresponding versions. 
    const packageToVersion = {};
    for (const packageKey of Object.keys(depSpecs)) {
        const packageVersion = fetchReleaseTag(depSpecs[packageKey].releaseLink);
        
        for (const packageName of depSpecs[packageKey].packages) {
            packageToVersion[`@polkadot/${packageName}`] = packageVersion.substring(1);
        }
    }

    // Iterate through each file using the generator function and find the package.json
    for await (const path of getFiles(rootPath)) {
        // GetFiles can return undefined so we make sure it's a string
        if (typeof path === 'string') {
            updatePackageJson(path, packageToVersion);
        }
    }
}

const argv = require('yargs')
    .options({
        '--path': {
            description: 'Path to directory',
            type: 'string'
        }
    })
    .strict()
    .argv;

main(argv.path);
