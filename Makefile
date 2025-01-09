# run in parallel
MAKEFLAGS += -j2

.PHONY: start client server clean install build test

start: client server

client:
	npm start --prefix ./client	
	
server:
	tsc --build server
	node ./server/dist/index.js

clean:
	tsc --build --clean server
	rm -rf ./client/build/*

install:
	npm --prefix ./client install
	npm --prefix ./server install
	tsc --build server

build:
	npm --prefix ./client run build
	tsc --build server

test:
	npm --prefix ./server test
