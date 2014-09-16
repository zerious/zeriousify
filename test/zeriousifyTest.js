var is = require('exam/lib/is');
var fs = require('fs');
var cwd = process.cwd();
var name = cwd.replace(/.*\//, '');
var zPath = __dirname.replace(/[\/\\]test$/, '');
var zeriousify = require(zPath + '/zeriousify.js');
var isModule = !fs.existsSync('app.js');
var api;
try {
  api = require(cwd);
}
catch (e) {
  console.error(e);
  api = {version: '0.0.0'};
}

describe('zeriousify', function () {

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

  function setDefault(object, key, value) {
    object[key] = object[key] || value;
  }

  describe('package.json', function () {

    var content = getContent('package.json') || '{}';
    var json = JSON.parse(content);

    var zeriousifyPackage = require('../package.json');

    setDefault(json, 'name', name);
    setDefault(json, 'description', name + ' is a Zerious module');
    setDefault(json, 'keywords', [name]);
    setDefault(json, 'version', api.version || '0.0.0');
    setDefault(json, 'main', name + '.js');
    setDefault(json, 'homepage', 'https://github.com/lighterio/' + name);
    setDefault(json, 'repository', 'https://github.com/lighterio/' + name + '.git');
    setDefault(json, 'bugs', {url: 'https://github.com/lighterio/' + name + '/issues'});
    setDefault(json, 'author', zeriousifyPackage.author);
    setDefault(json, 'contributors', zeriousifyPackage.contributors);
    if (isModule) {
      setDefault(json, 'license', 'MIT');
    }
    setDefault(json, 'engines', ['node >= 0.2.6']);
    setDefault(json, 'scripts', {});
    // A mis-named "script" property instead of "scripts" will cause a warning.
    delete json.script;
    var scripts = json.scripts;
    setDefault(scripts, 'test', './node_modules/exam/exam.js');
    setDefault(scripts, 'cover', 'istanbul cover ./node_modules/exam/exam.js');
    setDefault(scripts, 'report', 'open coverage/lcov-report/index.html');
    setDefault(scripts, 'coveralls', 'istanbul cover ./node_modules/exam/exam.js --report lcovonly -- -R spec && cat ./coverage/lcov.info | coveralls && rm -rf ./coverage');
    setDefault(json, 'dependencies', {});
    setDefault(json, 'devDependencies', {});

    // If this module isn't zeriousify, make it depend on zeriousify.
    if (name != 'zeriousify') {
      setDefault(json.devDependencies, 'zeriousify', zeriousify.version);
    }

    setDefault(json.devDependencies, 'exam', zeriousifyPackage.dependencies.exam);
    setDefault(json.devDependencies, 'istanbul', zeriousifyPackage.dependencies.istanbul);
    setDefault(json.devDependencies, 'coveralls', zeriousifyPackage.dependencies.coveralls);

    var clean = JSON.stringify(json, null, '  ') + '\n';

    function saveJson(done) {
      clean = JSON.stringify(json, null, '  ') + '\n';
      setContent('package.json', clean, done);
    }

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
        function writeFile(content) {
          fs.mkdir(cwd + '/test', function () {
            setContent(filename, content, done);
          });
        }
        function writeDefaultContent() {
          if (defaultContent) {
            writeFile(defaultContent);
          } else {
            fs.readFile(zPath + filename, function (err, content) {
              writeFile('' + content);
            });
          }
        }
        if (!content) {
          writeDefaultContent(content);
        } else if (filename == '.travis.yml') {
          var clean = content.replace(/\t/g, '  ');
          if (clean == content) {
            done();
          } else {
            writeFile(clean);
          }
        } else {
          done();
        }
      });
    });
  }

  testFile('.travis.yml');
  testFile('test/mocha.opts');

  testFile('test/' + (isModule ? name : 'app') + 'Test.js',
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

  var gitignore = '*.seed,*.log,*.csv,*.dat,*.out,*.pid,*.gz,' +
    '.idea,.project,.DS_Store,.cache,' +
    'pids,logs,results,coverage,node_modules,build';

  describe('.gitignore', function () {
    testIgnoreFile('.gitignore', gitignore.split(','));
  });

  var npmignore = gitignore +
    (name == 'zeriousify' ? '' : ',test') + ',.travis.yml,.npmignore';

  describe('.npmignore', function () {
    testIgnoreFile('.npmignore', npmignore.split(','));
  });

  if (isModule) {
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
  }

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

    if (isModule) {
      it('has badges', function (done) {
        var hasNpm = /npmjs\.org/.test(content);
        var hasTravis = /travis-ci\.org/.test(content);
        var hasCover = /coveralls\.io/.test(content);
        var hasDeps = /david-dm\.org/.test(content);
        var hasTip = /(gratipay|gittip)\.com/.test(content);
        if (!hasNpm || !hasTravis || !hasCover || !hasDeps || !hasTip) {
          content += '\n' +
            '[![NPM Version](https://img.shields.io/npm/v/' + name + '.svg) ![Downloads](https://img.shields.io/npm/dm/' + name + '.svg)](https://npmjs.org/package/' + name + '' + name + ')\n' +
            '[![Build Status](https://img.shields.io/travis/lighterio/' + name + '.svg)](https://travis-ci.org/lighterio/' + name + ')\n' +
            '[![Code Coverage](https://img.shields.io/coveralls/lighterio/' + name + '/master.svg)](https://coveralls.io/r/lighterio/' + name + ')\n' +
            '[![Dependencies](https://img.shields.io/david/lighterio/' + name + '.svg)](https://david-dm.org/lighterio/' + name + ')\n' +
            '[![Support](https://img.shields.io/gratipay/Lighter.io.svg)](https://gratipay.com/Lighter.io/)\n';
          setContent('README.md', content, done);
        } else {
          done();
        }
      });

      describe('mentions API methods', function () {
        var checkForDocumentation = function (property) {
          it('including ' + property, function () {
            is.in(content, property);
          });
        };
        for (var key in api) {
          if (key[0] != '_' && api.hasOwnProperty(key) && key != 'version') {
            checkForDocumentation(key);
          }
        }
      });
    }
  });

});
