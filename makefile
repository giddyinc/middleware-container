
clean:
	rm -rf coverage dist

tests: 
	npm run lint
	mocha --require babel-register

prepublish: clean
	babel src --out-dir dist
