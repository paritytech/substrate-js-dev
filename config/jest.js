// Copyright 2022 Parity Technologies (UK) Ltd.

module.exports = {
	preset: 'ts-jest/presets/js-with-babel',
	transformIgnorePatterns: ['<rootDir>/node_modules/(?!@polkadot|@babel/runtime/helpers/esm/)'],
};
