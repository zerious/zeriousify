var assert = require('assert-plus');
var fs = require('fs');
var cwd = process.cwd();
var name = cwd.replace(/.*\//, '');
var zPath = require.resolve('zeriousify').replace(/zeriousify\.js/, '');
var api;
try {
	api = require(cwd);
}
catch (e) {
	api = defaultApi;
}

describe('ZMS', function () {

	function getContent(filename) {
		try {
			return '' + fs.readFileSync(cwd + '/' + filename);
		}
		catch (e) {
			return '';
		}
	}

	function setContent(filename, content, done) {
		fs.writeFile(cwd + '/' + filename, content, function (err) {
			if (err) {
				throw err;
			}
			console.log('      * wrote: ' + cwd + '/' + filename);
			done();
		});
	}

	describe('package.json', function () {

		var content = getContent('package.json') || '{}';
		var json = JSON.parse(content);

		function setDefault(object, key, value) {
			object[key] = object[key] || value;
		}

		var zeriousifyPackage = require('../package.json');

		setDefault(json, 'name', name);
		setDefault(json, 'description', name + ' is a Zerious module');
		setDefault(json, 'keywords', [name]);
		setDefault(json, 'version', '0.0.0');
		setDefault(json, 'main', name + '.js');
		setDefault(json, 'homepage', 'http://github.com/zerious/' + name);
		setDefault(json, 'repository', 'http://github.com/zerious/' + name + '.git');
		setDefault(json, 'bugs', {url: 'http://github.com/zerious/' + name + '/issues'});
		setDefault(json, 'author', zeriousifyPackage.author);
		setDefault(json, 'contributors', zeriousifyPackage.author);
		setDefault(json, 'license', 'MIT');
		setDefault(json, 'engines', ['node >= 0.2.6']);
		setDefault(json, 'scripts', {});
		json.scripts.test = 'mocha';
		json.scripts.retest = 'mocha --watch';
		json.scripts.cover = 'istanbul cover _mocha';
		json.scripts.report = 'open coverage/lcov-report/index.html';
		json.scripts.coveralls = 'istanbul cover _mocha --report lcovonly -- -R spec && cat ./coverage/lcov.info | coveralls && rm -rf ./coverage';
		setDefault(json, 'dependencies', {});
		setDefault(json, 'devDependencies', {});
		setDefault(json.devDependencies, 'zeriousify', '~' + zeriousifyPackage.version);
		setDefault(json.devDependencies, 'mocha', zeriousifyPackage.devDependencies.mocha);
		setDefault(json.devDependencies, 'istanbul', zeriousifyPackage.devDependencies.istanbul);
		setDefault(json.devDependencies, 'assert-plus', zeriousifyPackage.devDependencies['assert-plus']);

		it('should match API version (' + api.version + ')', function () {
			assert.equal(json.version, api.version);
		});

		var clean = JSON.stringify(json, null, '  ') + '\n';

		function saveJson(done) {
			clean = JSON.stringify(json, null, '  ') + '\n';
			setContent('package.json', clean, done);
		};

		it('should be unchanged after parsing and stringifying with 2 spaces', function (done) {
			// If the content isn't equivalent to itself parsed and
			// stringified with 2 spaces, save the clean version over it.
			if (content != clean) {
				saveJson(done);
			}
			// If package.json doesn't need any changes, we're done.
			else {
				done();
			}
		});

	});

	function testFile(filename, defaultContent) {
		describe(filename, function () {
			it('should exist', function (done) {
				var content = getContent(filename);
				if (!content) {
					function writeFile(content) {
						fs.mkdir(cwd + '/test', function () {
							setContent(filename, content, done);
						});
					}
					if (defaultContent) {
						writeFile(defaultContent);
					} else {
						fs.readFile(zPath + filename, function (err, content) {
							writeFile('' + content);
						});
					}
				} else {
					done();
				}
			});
		});
	}

	testFile('.travis.yml');
	testFile('test/mocha.opts');

	testFile('test/' + name + 'Test.js',
		"var assert = require('assert-plus');\n\n" +
		"require('zeriousify').test();\n\n" +
		"describe('API', function () {\n\t/\/TODO: Write API tests.\n})\n");



	function testIgnoreFile(filename, mustIgnore) {
		it('should be fully populated', function (done) {
			var content = getContent(filename);
			var lines = content.split('\n');
			var dict = {};
			lines.forEach(function (line) {
				dict[line] = true;
			});
			var mustSave = false;
			mustIgnore.forEach(function (name) {
				if (!dict[name]) {
					lines.push(name);
					mustSave = true;
				}
			});
			if (mustSave) {
				setContent(filename, lines.join('\n') + '\n', done);
			} else {
				done();
			}
		});
	}

	describe('.gitignore', function () {
		testIgnoreFile('.gitignore', [
			'*.seed',
			'*.log',
			'*.csv',
			'*.dat',
			'*.out',
			'*.pid',
			'*.gz',
			'.idea',
			'.project',
			'.DS_Store',
			'.cache',
			'pids',
			'logs',
			'results',
			'coverage',
			'node_modules'
		]);
	});

	describe('.npmignore', function () {
		testIgnoreFile('.npmignore', [
			'*.seed',
			'*.log',
			'*.csv',
			'*.dat',
			'*.out',
			'*.pid',
			'*.gz',
			'.idea',
			'.project',
			'.DS_Store',
			'.cache',
			'.gitignore',
			'pids',
			'logs',
			'results',
			'coverage',
			'node_modules',
			'test'
		]);
	});

	describe('MIT-LICENSE.md', function () {
		var content = getContent('MIT-LICENSE.md');

		it('exists', function (done) {
			if (!/MIT License/.test(content)) {
				var year = (new Date()).getFullYear();
				fs.readFile(zPath + 'MIT-LICENSE.md', function (err, content) {
					license = ('' + content).replace(/[0-9]{4}/, year);
					setContent('MIT-LICENSE.md', license, done);
				});
			} else {
				done();
			}
		});
	});

	describe('README.md', function () {
		var pattern = new RegExp(name, 'i');
		var content = getContent('README.md');

		it('mentions ' + name, function (done) {
			if (!pattern.test(content)) {
				content = '# ' + name + '\n' + content + '\n';
				setContent('README.md', content, done);
			} else {
				done();
			}
		});

		it('has badges', function (done) {
			var hasNpm = /badge\.fury\.io/.test(content);
			var hasTravis = /travis-ci\.org/.test(content);
			var hasCover = /coveralls\.io/.test(content);
			var hasDeps = /david-dm\.org/.test(content);
			var hasTip = /gittip/.test(content);
			if (!hasNpm || !hasTravis || !hasCover || !hasDeps || !hasTip) {
				content += '\n' +
					'[![NPM Version](https://badge.fury.io/js/' + name + '.png)](http://badge.fury.io/js/' + name + ')\n' +
					'[![Build Status](https://travis-ci.org/zerious/' + name + '.png?branch=master)](https://travis-ci.org/zerious/' + name + ')\n' +
					'[![Code Coverage](https://coveralls.io/repos/zerious/' + name + '/badge.png?branch=master)](https://coveralls.io/r/zerious/' + name + ')\n' +
					'[![Dependencies](https://david-dm.org/zerious/' + name + '.png?theme=shields.io)](https://david-dm.org/zerious/' + name + ')\n' +
					'[![Support](http://img.shields.io/gittip/zerious.png)](https://www.gittip.com/zerious/)\n';
				setContent('README.md', content, done);
			} else {
				done();
			}
		});

		describe('mentions API methods', function () {
			for (var property in api) {
				if (property[0] != '_' && api.hasOwnProperty(property)) {
					it('including ' + property, function () {
						var flags = (property == 'version' ? 'i' : '');
						var pattern = new RegExp(property, flags);
						assert.equal(pattern.test(content), true);
					});
				}
			}
		});
	});

});
