import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import pkg from './package.json';

export default [
  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // the `targets` option which can specify `dest` and `format`)
  {
    input: 'src/main.js',
    external: [
      'ramda',
      'react',
      '@k-frame/reducers',
      'react-redux',
      'prop-types',
      'redux-saga',
      'redux-saga/effects',
    ],
    output: [{file: pkg.main, format: 'cjs'}, {file: pkg.module, format: 'es'}],
    plugins: [
      babel({
        exclude: ['node_modules/**'],
      }),
    ],
  },
  {
    input: 'src/main.js',
    output: {
      file: pkg.unpkg,
      format: 'umd',
      name: 'K',
      indent: false,
      extend: true,
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        'redux-saga': 'ReduxSaga',
        'redux-saga/effects': 'ReduxSaga.effects',
        '@k-frame/core': 'K',
        ramda: 'R',
      },
    },
    external: [
      'react',
      'react-dom',
      'ramda',
      'redux-saga',
      'redux-saga/effects',
      '@k-frame/core',
    ],
    plugins: [
      nodeResolve({
        jsnext: true,
      }),
      babel({
        exclude: 'node_modules/**',
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
      }),
    ],
  },
];
