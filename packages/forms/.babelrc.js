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
        loose: true,
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
        loose: true,
      },
    ],
  ],
  plugins: [
    // don't use `loose` mode here - need to copy symbols when spreading
    '@babel/plugin-transform-template-literals',
    '@babel/proposal-object-rest-spread',
    '@babel/plugin-transform-spread',
    '@babel/plugin-proposal-class-properties',
    NODE_ENV === 'test' && '@babel/transform-modules-commonjs',
  ].filter(Boolean),
};
