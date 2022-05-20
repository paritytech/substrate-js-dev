#!/usr/bin/env node
// Copyright 2022 Parity Technologies (UK) Ltd.

'use strict';

const fs = require('fs');
const https = require('https');
const { resolve } = require('path');
const { readdir, stat } = require('fs').promises;

/**
 * polkadot-js package information, and specifications
 */
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

/**
 * This will fetch the latest release from github, returns the response as
 * a JSON object.
 * 
 * @param {string} url Latest release link
 * @returns 
 */
async function fetchRelease(url) {
    const [h, ...args] = url.split('://')[1].split('/');
    const [host, _port] = h.split(':');

    const options = {
        method: 'GET',
        host,
        port: 443,
        path: '/' + args.join('/'),
        headers: {
            'User-Agent': 'request'
        }
    };

    return new Promise(function(resolve, reject) {
        const req = https.request(options, function (res) {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error(`Status Code: ${res.statusCode}`));
            }

            const data = [];

            res.on('data', chunk => {
                data.push(chunk);
            });

            res.on('end', function() {
                resolve(JSON.parse(Buffer.concat(data).toString()))
            });
        })

        req.on('error', reject);

        req.end();
    })
}

/**
 * Given a package.json file update all the resolutions and dependencies
 * that are polkadot-js packages
 * 
 * @param {string} path Path to the package.json file
 * @param {object} config Object contains keys that are package names, and values 
 * which are their corresponding versions
 */
function updatePackageJson(path, config) {
    const rawData = fs.readFileSync(path);
    const packageJson = JSON.parse(rawData);
    const deps = packageJson['dependencies'];
    const resolutions = packageJson['resolutions'];

    for(const packageName of Object.keys(config)) {
        // check and update dependencies key
        if (deps && Object.keys(deps).includes(packageName)) {
            packageJson['dependencies'][packageName] = config[packageName];
        }

        // check and update resolutions key
        if (resolutions && Object.keys(resolutions).includes(packageName)) {
            packageJson['resolutions'][packageName] = config[packageName];
        }
    }

    try {
        fs.writeFileSync(path, JSON.stringify(packageJson, null, 2).concat('\n'));
        console.log(`Succesfully updated => ${path}`);
    } catch (e) {
        console.error(e)
    }
}

/**
 * Generator function to recursively lazy iterate through each directory. This searches
 * for all package.json files in a dir, not including node_modules, and hidden dirs.
 * 
 * @param {string} rootPath root path of the repository
 * @param {array} ignorePaths an array of paths to ignore
 */
async function* getFiles(rootPath, ignorePaths) {
    const fileNames = await readdir(rootPath);
    for (const fileName of fileNames) {
        const path = resolve(rootPath, fileName);
        const curPath = path.split('/').slice(-1)[0];
        if (ignorePaths.includes(curPath)) {
            // Do not traverse any path that is ignored
            continue;
        } else if (curPath.startsWith('.')) {
            // Do no traverse any hidden directories
            continue;
        } else if ((await stat(path)).isDirectory()) {
            yield* getFiles(path, ignorePaths);
        } else if (path.endsWith('package.json')) {
            yield path;
        }
    }
}

async function main(rootPath = './') {
    /**
     * Paths to ignore when travesing a directions
     */
    const pathsToIgnore = [
        'node_modules',
        'build',
        'lib',
    ];
    // iterate through constants and create an object that stores each packages name
    // to their corresponding versions. 
    const packageToVersion = {};
    for (const packageKey of Object.keys(depSpecs)) {
        const packageRelease = await fetchRelease(depSpecs[packageKey].releaseLink);
        const packageVersion = packageRelease['tag_name'];
        for (const packageName of depSpecs[packageKey].packages) {
            packageToVersion[`@polkadot/${packageName}`] = packageVersion.substring(1);
        }
    }

    // Iterate through each file using the generator function and find the package.json
    for await (const path of getFiles(rootPath, pathsToIgnore)) {
        if (path) {
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

main(argv.path).catch(err => console.log(err)).finally(() => process.exit());
