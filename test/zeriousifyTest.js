var assert = require('assert-plus');
var fs = require('fs');
var cwd = process.cwd();
var name = cwd.replace(/.*\//, '');
var api = require(cwd);
var npm = require('npm');


describe('API', function () {
	var packageJson = require(cwd + '/package.json');
	describe('version', function () {
		var packageVersion = packageJson.version;
		it('should match package.json version (' + packageVersion + ')', function () {
			var apiVersion = api.version;
			assert.equal(apiVersion, packageVersion);
		});
	});
});


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
		console.log('      * written');
		done();
	});
}

describe('Root', function () {

	describe('package.json', function () {

		var content = getContent('package.json');
		var json = JSON.parse(content);
		var clean = JSON.stringify(json, null, '  ');

		function saveJson(done) {
			clean = JSON.stringify(json, null, '  ');
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

	describe('.travis.yml', function () {
		it('should exist', function (done) {
			var content = getContent('.travis.yml');
			if (!content) {
				content = 'language: node_js\n' +
					'node_js:\n' +
					'	- "0.10"\n' +
					'after_script:\n' +
					'	- npm run coveralls';
				setContent('.travis.yml', content, done);
			} else {
				done();
			}
		});
	});

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
				setContent(filename, lines.join('\n'), done);
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

	describe('LICENSE', function (done) {
		var year = (new Date()).getFullYear();
		var license = 'The MIT License (MIT)\n' +
			'\n' +
			'Copyright (c) ' + year + ' Sam Eubank\n' +
			'\n' +
			'Permission is hereby granted, free of charge, to any person obtaining a copy\n' +
			'of this software and associated documentation files (the "Software"), to deal\n' +
			'in the Software without restriction, including without limitation the rights\n' +
			'to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n' +
			'copies of the Software, and to permit persons to whom the Software is\n' +
			'furnished to do so, subject to the following conditions:\n' +
			'\n' +
			'The above copyright notice and this permission notice shall be included in all\n' +
			'copies or substantial portions of the Software.\n' +
			'\n' +
			'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n' +
			'IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n' +
			'FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n' +
			'AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n' +
			'LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n' +
			'OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\n' +
			'SOFTWARE.';
		var content = getContent('LICENSE');

		it('is MIT', function (done) {
			if (!/MIT License/.test(content)) {
				setContent('LICENSE', license, done);
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
				content = '# ' + name + '\n\n' + content;
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
				content += '\n\n' +
					'[![NPM Version](https://badge.fury.io/js/' + name + '.png)](http://badge.fury.io/js/' + name + ')\n' +
					'[![Build Status](https://travis-ci.org/zerious/' + name + '.png?branch=master)](https://travis-ci.org/zerious/' + name + ')\n' +
					'[![Code Coverage](https://coveralls.io/repos/zerious/' + name + '/badge.png?branch=master)](https://coveralls.io/r/zerious/' + name + ')\n' +
					'[![Dependencies](https://david-dm.org/zerious/' + name + '.png?theme=shields.io)](https://david-dm.org/zerious/' + name + ')\n' +
					'[![Support](http://img.shields.io/gittip/zerious.png)](https://www.gittip.com/zerious/)';
				setContent('README.md', content, done);
			} else {
				done();
			}
		});
	});

});
