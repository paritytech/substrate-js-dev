const path = require('path');

module.exports = function importBinary (bin, dir) {
    console.log(`${bin} ${process.argv.slice(2).join(' ')}`);

    return require(path.join(process.cwd(), 'node_modules', dir));
}
