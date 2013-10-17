SRC = src/head.js src/qunit-head.jslike test/qunit/qunit/qunit.js src/qunit-tail.jslike src/ui-head.jslike src/mocha-qunit-ui.js src/ui-tail.jslike src/tail.js

mocha-qunit-ui.js: $(SRC)
	cat $(SRC) > mocha-qunit-ui.js

.PHONY: clean
clean:
	rm mocha-qunit-ui.js
