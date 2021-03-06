#!/bin/bash

yarn test

VERSION=""

echo "-----REDUCERS-----"
cd packages/core
yarn build
VERSION=$(npm version patch | cut -c2-)
npm publish

echo "-----SAGAS-----"
cd ../sagas
json -I -f ./package.json -e "this.peerDependencies['@k-frame/core']='^$VERSION';this.devDependencies['@k-frame/core']='^$VERSION'"
yarn
yarn build
npm version $VERSION
npm publish

echo "-----FORMS-----"
cd ../forms
json -I -f ./package.json -e "this.peerDependencies['@k-frame/core']='^$VERSION';this.devDependencies['@k-frame/core']='^$VERSION'"
yarn
yarn build
npm version $VERSION
npm publish
