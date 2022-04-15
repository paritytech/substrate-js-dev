#!/usr/bin/env node
'use strict';

const fs = require('fs');
const execSync = require('child_process').execSync;
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
 * This will curl the latest release from github, and parse out the tag_name
 * 
 * @param {string} link Latest release link to curl
 * @returns 
 */
function fetchReleaseTag(link) {
    const cmd = `curl --silent ${link}`;
    const res = execSync(cmd).toString();
    const resJson = JSON.parse(res);

    return resJson['tag_name'];
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

    fs.writeFileSync(path, JSON.stringify(packageJson, null, 2).concat('\n'));
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
        const packageVersion = fetchReleaseTag(depSpecs[packageKey].releaseLink);
        for (const packageName of depSpecs[packageKey].packages) {
            packageToVersion[`@polkadot/${packageName}`] = packageVersion.substring(1);
        }
    }

    // Iterate through each file using the generator function and find the package.json
    for await (const path of getFiles(rootPath, pathsToIgnore)) {
        // GetFiles can return undefined so we make sure it's true
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
