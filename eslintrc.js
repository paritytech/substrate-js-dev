const base = require('./config/eslint.js');

module.exports = {
	...base,
	ignorePatterns: [
		'**/node_modules/*'
	],
	parserOptions: {}
};
