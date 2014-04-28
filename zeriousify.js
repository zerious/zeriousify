var api = module.exports;

/**
 * Expose the version to module users.
 * @type {string}
 */
api.version = require('./package.json').version;

/**
 * Test a module that requires zeriousify.
 */
api.test = function () {
	require('./test/zeriousifyTest');
}