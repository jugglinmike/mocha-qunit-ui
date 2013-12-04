# Mocha QUnit UI

An interface for [Mocha](http://visionmedia.github.io/mocha/) that implements
[QUnit](http://qunitjs.com/)'s API.

Mocha ships with a QUnit interface, but it lacks assertions, support for
expected assertion count, and the `asyncTest` method (among other things). This
is an alternate implementation that fully supports [the entire QUnit
API](http://api.qunitjs.com/). It may be run either in Node.js or the browser.
The goal is to get as close as possible to being able to run QUnit tests
unaltered in Mocha.

## Installation

    $ npm install mocha-qunit-ui --save-dev

## Usage

### Node.js

From the command line:

    $ mocha --ui mocha-qunit-ui test/test-file-1.js

Programatically:

```JavaScript
// Load mocha-qunit-ui
require("mocha-qunit-ui");
// Tell mocha to use the interface.
var mocha = new Mocha({
  ui:"qunit"
});
// Add your test files
mocha.addFile("path/to/my/testfile.js");
// Run your tests
mocha.run(function(failures){
  process.exit(failures);
});
```

### Browser environments

Declare an HTML file with the following markup to run tests in the browser:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Tests</title>
    <script src="path/to/mocha.js"></script>
    <script src="mocha-qunit-ui.js"></script>
    <script>
      mocha.setup({
        ui: "qunit"
      });
    </script>
    <link rel="stylesheet" type="text/css" href="path/to/mocha.css">
  </head>
  <body>
    <div id="mocha"></div>
    <script>
      module("On page test!");
      test("An awesome QUnit style test", 2, function () {
        ok(true);
        equal(1, parseInt("1"));
      });
      mocha.run();
    </script>
  </body>
</html>
```

You can also use qunit-mocha-ui from [Grunt](http://gruntjs.com/) with [the
`grunt-mocha` task](https://github.com/kmiyashiro/grunt-mocha). Here's an
example `Gruntfile.js`:

```JavaScript
module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-mocha');
  grunt.initConfig({
    mocha: {
      test:{
        options:{
          mocha: {
            ui: 'qunit'
          }
        },
        src: [
          "test/test-file-1.js"
        ]
      }
    }
  });
  grunt.registerTask('default', ['mocha']);
};
```

## Known differences from QUnit API

* The global variable `module` is reserved in Node.js. If you want to define a
  QUnit module in that environment, use the `QUnit.module` alias.

## Running tests

Just run `npm test` from the project directory. You can run QUnit's test suite
by opening `test/qunit.html` in a browser.

## License

Copyright (c) 2013 Mike Pennisi  
Licensed under the MIT license.
