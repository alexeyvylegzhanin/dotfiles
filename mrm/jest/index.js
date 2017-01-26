'use strict';

const { json, lines, install } = require('mrm-core');

const defaultTest = 'echo "Error: no test specified" && exit 1';
const packages = [
	'jest',
];

module.exports = function() {
	// package.json
	const packageJson = json('package.json')
		.merge({
			scripts: {
				'test:jest': 'jest',
				'test:watch': 'jest --watch',
				'test:coverage': 'jest --coverage',
			},
		})
	;

	// Babel
	if (packageJson.get(`devDependencies.babel-core`)) {
		packages.push('babel-jest');
		packageJson.merge({
			jest: {
				testPathIgnorePatterns: [
					"<rootDir>/lib/"
				],
			},
		});
	}

	// package.json: test command
	const test = packageJson.get('scripts.test');
	if (!test || test === defaultTest) {
		packageJson.set('scripts.test', 'npm run test:jest');
	}
	else if (!test.includes('test:jest')) {
		packageJson.set('scripts.test', `${test} && npm run test:jest`);
	}

	packageJson.save();

	// .npmignore
	lines('.npmignore')
		.append('__tests__')
		.save()
	;

	// package.json: dependencies
	install(packages);
};
module.exports.description = 'Adds Jest';
