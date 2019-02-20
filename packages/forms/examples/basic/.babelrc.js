const {NODE_ENV} = process.env;

module.exports = {
    presets: ['@babel/env', '@babel/react'],
    plugins: [
        // don't use `loose` mode here - need to copy symbols when spreading
        '@babel/plugin-proposal-class-properties',
        '@babel/proposal-object-rest-spread',
        '@babel/plugin-transform-spread',
        '@babel/plugin-transform-regenerator',
        NODE_ENV === 'test' && '@babel/transform-modules-commonjs',
    ].filter(Boolean),
};
