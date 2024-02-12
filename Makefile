THIS_FILE := $(lastword $(MAKEFILE_LIST))

.PHONY: start client server clean install build

start:
	$(MAKE) -f $(THIS_FILE) client & $(MAKE) -f $(THIS_FILE) server

client:
	npm start --prefix ./client	
	
server:
	tsc --build server
	node ./server/build/index.js

clean:
	tsc --build --clean server

install:
	npm --prefix ./client install
	npm --prefix ./server install
	tsc --build server

build:
	npm --prefix ./client run build