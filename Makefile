# run in parallel
MAKEFLAGS += -j2

.PHONY: start client server clean install build

start: client server

client:
	npm start --prefix ./client	
	
server:
	tsc --build server
	node ./server/build/index.js

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