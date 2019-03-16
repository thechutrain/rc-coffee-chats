#!/bin/sh

echo "pulling from github ..."
git pull origin master

echo "installing new npm modules"
npm install

npm run tsc 

npm run dev