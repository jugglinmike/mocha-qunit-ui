SRC = src/head.js src/assert.js src/is.js src/jsdump.js src/mocha-qunit-ui.js src/tail.js

mocha-qunit-ui.js: $(SRC)
	cat $(SRC) > mocha-qunit-ui.js

.PHONY: clean
clean:
	rm mocha-qunit-ui.js
