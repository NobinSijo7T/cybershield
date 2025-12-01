const { withPlugins } = require('@expo/config-plugins');
const { withBootSplash } = require('@expo/config-plugins');

module.exports = function withCustomBootSplash(config) {
    return withPlugins(config, [
        [
            require('react-native-bootsplash/dist/expo-plugin').withBootSplash,
            {
                assetsDir: 'assets/bootsplash',
                android: {
                    parentTheme: 'TransparentStatus',
                },
            },
        ],
    ]);
};
