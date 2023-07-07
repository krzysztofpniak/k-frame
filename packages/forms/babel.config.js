const {NODE_ENV} = process.env;

module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: {
          browsers: ['ie >= 11'],
        },
        exclude: ['transform-async-to-generator', 'transform-regenerator'],
        modules: false,
        loose: false,
      },
    ],
    [
      '@babel/react',
      {
        targets: {
          browsers: ['ie >= 11'],
        },
        exclude: ['transform-async-to-generator', 'transform-regenerator'],
        modules: false,
        loose: false,
      },
    ],
    ['@babel/preset-flow'],
  ],
  plugins: [
    // don't use `loose` mode here - need to copy symbols when spreading
    '@babel/proposal-object-rest-spread',
    '@babel/plugin-transform-spread',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-async-to-generator',
    ['@babel/plugin-proposal-pipeline-operator', {proposal: 'minimal'}],
    NODE_ENV === 'test' && '@babel/transform-modules-commonjs',
  ].filter(Boolean),
};