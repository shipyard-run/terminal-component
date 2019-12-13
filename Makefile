.PHONY: components publish

all: components publish

components:
	npm run publish:npm

publish:
	npm publish --access public