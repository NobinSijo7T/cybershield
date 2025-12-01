const { withGradleProperties } = require('@expo/config-plugins');

/**
 * Config plugin to enable AndroidX and Jetifier
 * Jetifier automatically converts old support library dependencies to AndroidX
 */
module.exports = function withCustomGradleProperties(config) {
    return withGradleProperties(config, (config) => {
        // Enable AndroidX
        config.modResults.push({
            type: 'property',
            key: 'android.useAndroidX',
            value: 'true',
        });

        // Enable Jetifier to automatically migrate support libraries to AndroidX
        config.modResults.push({
            type: 'property',
            key: 'android.enableJetifier',
            value: 'true',
        });

        console.log('✅ Added AndroidX and Jetifier properties to gradle.properties');

        return config;
    });
};
