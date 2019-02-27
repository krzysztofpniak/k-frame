#!/usr/bin/env node
let shell = require('shelljs');
let colors = require('colors');
let fs = require('fs');
let path = require('path');

let appName = process.argv[2];
let appDirectory = `${process.cwd()}/${appName}`;

const createReactApp = () => {
  return new Promise(resolve => {
    if (appName) {
      shell.exec(`npx create-react-app ${appName}`, code => {
        console.log('Exited with code ', code);
        console.log('Created react app');
        resolve(true);
      });
    } else {
      console.log('\nNo app name was provided.'.red);
      console.log('\nProvide an app name in the following format: ');
      console.log('\ncreate-react-redux-router-app ', 'app-name\n'.cyan);
      resolve(false);
    }
  });
};

const cdIntoNewApp = () => {
  return new Promise(resolve => {
    shell.cd(appDirectory);
    resolve();
  });
};

const packagesToInstall = [
  '@k-frame/core',
  '@k-frame/forms',
  'ramda',
  'redux',
  'react-router-dom',
];

const installPackages = () => {
  return new Promise(resolve => {
    console.log(`\nInstalling ${packagesToInstall.join(', ')}\n`.cyan);
    shell.exec(`yarn add ${packagesToInstall.join(' ')}`, () => {
      console.log('\nFinished installing packages\n'.green);
      resolve();
    });
  });
};

const copyTemplate = templateFile => {
  return new Promise(res => {
    const content = fs.readFileSync(
      path.resolve(__dirname, 'templates', templateFile),
      'utf8'
    );
    fs.writeFile(
      path.resolve(appDirectory, 'src', templateFile),
      content,
      function(err) {
        if (err) {
          return console.log(err);
        }
        res();
      }
    );
  });
};

const copyTemplates = () => {
  return Promise.all([
    copyTemplate('./App.js'),
    copyTemplate('./App.css'),
    copyTemplate('./Counter.js'),
    copyTemplate('./Home.js'),
    copyTemplate('./Users.js'),
    copyTemplate('./UserEdit.js'),
    copyTemplate('./index.js'),
  ]);
};

const run = async () => {
  let success = await createReactApp();
  if (!success) {
    console.log(
      'Something went wrong while trying to create a new React app using create-react-app'
        .red
    );
    return false;
  }
  await cdIntoNewApp();
  await installPackages();
  await copyTemplates();
  console.log('All done');
};

run();
