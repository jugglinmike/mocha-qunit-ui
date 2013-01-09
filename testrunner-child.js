var Mocha = require("mocha");
Mocha.interfaces["qunit-mocha-ui"] = require("./qunit-mocha-ui.js");

process.on("message", function (msg){
  if(msg && msg.testfile){
    mocha = new Mocha({ui:"qunit-mocha-ui", reporter:"spec", bail:false});
    mocha.addFile(msg.testfile);
    mocha.run(function(failures){
      process.send(failures);
      process.exit(failures);
    });  
  }
});