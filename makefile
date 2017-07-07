
clean:
	rm -rf coverage dist

tests: 
	npm run lint
	nyc mocha --require babel-register

prepublish: clean
	babel src --out-dir dist

watch:
		mocha --require babel-register --watch
