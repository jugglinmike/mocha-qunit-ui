A QUnit Interface for Mocha that supports all QUnit's assertion types.

Mocha ships with a QUnit interface, but it lacks assertions, support for `expect()`, and the `asyncTest` method.  This is an alternate QUnit interface that supports all of those things, and can be run either in node.js or the browser.  The goal is to get as close as possible to being able to run QUnit tests unaltered in Mocha.

##Installation
```npm install qunit-mocha-ui --save-dev```

##Usage
Mocha doesn't currently support loading external interfaces from the command line, so for now, you need to use Mocha progamatically to use this interface.
```
//Load qunit-mocha-ui
require("qunit-mocha-ui");
//Tell mocha to use the interface.
var mocha = new Mocha({ui:"qunit-mocha-ui", reporter:"spec"});
//Add your test files
mocha.addFile("path/to/my/testfile.js");
//Run your tests
mocha.run(function(failures){
  process.exit(failures);
});
```
You can also use qunit-mocha-ui from Grunt with the `grunt-mocha-test` task.
Here's an example Gruntfile.js
```
module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.initConfig({
    mochaTest: {
      test:{
        options:{reporter:"spec", require:"qunit-mocha-ui", ui:"qunit-mocha-ui"},
        src:["test/mytest.js"]
      }
    }
  });
  grunt.registerTask('default', ['mochaTest']);
};
```

You can even use qunit-mocha-ui from in the browser, by using the included browserified js file:
`qunit-mocha-ui-browser.js`
```
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Browserified test</title>
    <script src="path/to/mocha.js"></script>
    <script src="qunit-mocha-ui-browser.js"></script>
    <script>
      mocha.setup({ui:"qunit-mocha-ui"});
    </script>
    <link rel="stylesheet" type="text/css" href="path/to/mocha.css">
  </head>
  <body>
    <div id="mocha"></div>
    <script>
      suite("On page test!");
      test("An awesome QUnit style test", 2, function (){
        ok(true);
        equal(1, parseInt("1"));
      });
      mocha.run();
    </script>
  </body>
</html>
```

##Cool stuff
You can mix and match Mocha features with QUnit.  The `done` parameter works, so you can call it instead of `start`, and you have access to the currently running test object with the `this` keyword inside the test function, just like in Mocha.
```
test("my long test", function (done){
  expect(1);
  this.timeout(1000); //set the Mocha timeout.
  setTimeout(function (){
    ok(true, "It works");
    done(); //using done() instead of start(), either will work.
  }, 950);
});
```

##Known differences from QUnit API
* You have to use `suite` instead of `module` in your QUnit tests to declare a module.  This is unlikely to be fixed because `module` is a reserved word in node.js
* The QUnit object is not currently exposed 

##Running tests
Just run `npm test` from the project folder, or run `node testrunner.js`
The tests are all written using this interface, so you may want to peek at them for more examples.

##License:
Copyright (c) 2013 Ian Taylor

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
