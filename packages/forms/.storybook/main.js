import path from 'path';
import babelConfig from "../.babelrc.json";

const wrapForPnp = (packageName) =>
  path.dirname(require.resolve(path.join(packageName, 'package.json')));

export default {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  docs: {
    autodocs: false,
  },
};

