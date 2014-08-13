var zeriousify = module.exports;

/**
 * Expose the version to module users.
 */
Object.defineProperty(zeriousify, 'version', {
  get: function () {
    return require('./package.json').version;
  }
});

/**
 * Test a module that requires zeriousify.
 */
zeriousify.test = function () {
  require('./test/zeriousifyTest');
};
