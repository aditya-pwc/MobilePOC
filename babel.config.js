module.exports = function (api) {
    api.cache(true)

    const presets = [
        [
            '@babel/preset-env',
            {
                targets: {
                    node: 'current'
                }
            }
        ],
        'module:metro-react-native-babel-preset',
        '@babel/preset-typescript'
    ]

    const plugins = [
        ['react-native-reanimated/plugin'],
        ['@babel/plugin-transform-flow-strip-types'],
        ['@babel/plugin-proposal-decorators', { version: 'legacy' }],
        ['@babel/plugin-transform-class-properties', { loose: true }]
    ]

    return {
        presets,
        plugins
    }
}
