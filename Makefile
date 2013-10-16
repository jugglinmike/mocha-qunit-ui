SRC = lib/head.js lib/assert.js lib/is.js lib/jsdump.js lib/mocha-qunit-ui.js lib/tail.js

mocha-qunit-ui.js: $(SRC)
	cat $(SRC) > mocha-qunit-ui.js

.PHONY: clean
clean:
	rm mocha-qunit-ui.js
