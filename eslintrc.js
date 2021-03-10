const base = require('./config/eslint.js');

module.exports = {
	...base,
	ignorePatterns: [
		'.eslintrc.js',
		'**/node_modules/*'
	],
	parserOptions: {}
}