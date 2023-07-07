#!/bin/bash

yarn test

VERSION="3.3.0"

echo "-----REDUCERS-----"
cd packages/core
yarn build
# VERSION=$(npm version prerelease --preid=RC | cut -c2-)
# VERSION=$(npm version patch | cut -c2-)
npm version $VERSION
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
