.PHONY: components publish server

components:
	npm run publish:npm

publish:
	npm publish --access public

server:
	go build -o bin/shipyard-terminal main.go