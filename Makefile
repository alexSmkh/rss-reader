develop:
	npx webpack serve --open google-chrome

install:
	npm ci

build:
	rm -rf dist
	NODE_ENV=production npx webpack

start-dev:
	npm start

lint:
	npx eslint .

.PHONY: test
