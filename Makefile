SRC = lib/head.js lib/qunit-head.jslike test/qunit/qunit/qunit.js lib/qunit-tail.jslike lib/ui-head.jslike lib/mocha-qunit-ui.js lib/ui-tail.jslike lib/tail.js

mocha-qunit-ui.js: $(SRC)
	cat $(SRC) > mocha-qunit-ui.js

.PHONY: clean
clean:
	rm mocha-qunit-ui.js

node_modules:
	npm install

.PHONY: expected-failures
expected-failures: node_modules
	@./node_modules/.bin/mocha --ui tdd test/expected-failures.js

.PHONY: test
test: expected-failures
