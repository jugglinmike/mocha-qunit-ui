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
	@F=0; \
	for f in test/expected-failures/*.js; do \
		./node_modules/.bin/mocha --ui ../../../mocha-qunit-ui.js $$f > /dev/null 2> /dev/null;\
		if [ "$$?" -eq 0 ]; then \
			echo "False positive reported by test file '$$f'"; \
			F=1; \
		fi \
	done; \
	exit $$F

.PHONY: test
test: expected-failures
