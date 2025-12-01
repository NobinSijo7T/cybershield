const { withAppBuildGradle, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Config plugin to exclude old Android Support Library dependencies
 * and force AndroidX compatibility
 */
const withAndroidXFix = (config) => {
    return withDangerousMod(config, [
        'android',
        async (config) => {
            const buildGradlePath = path.join(
                config.modRequest.platformProjectRoot,
                'app',
                'build.gradle'
            );

            if (!fs.existsSync(buildGradlePath)) {
                console.warn('⚠️  build.gradle not found, skipping AndroidX fix');
                return config;
            }

            let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');

            // Check if already added
            if (buildGradle.includes('configurations.all')) {
                console.log('✅ AndroidX exclusions already present');
                return config;
            }

            const exclusionsBlock = `
configurations.all {
    exclude group: 'com.android.support', module: 'support-compat'
    exclude group: 'com.android.support', module: 'support-v4'
    exclude group: 'com.android.support', module: 'versionedparcelable'
    exclude group: 'com.android.support', module: 'support-core-utils'
    exclude group: 'com.android.support', module: 'support-core-ui'
    exclude group: 'com.android.support', module: 'support-fragment'
}

`;

            // Find the dependencies block and insert before it
            const dependenciesPattern = /dependencies\s*\{/;
            const match = buildGradle.match(dependenciesPattern);

            if (match) {
                const insertIndex = match.index;
                buildGradle =
                    buildGradle.slice(0, insertIndex) +
                    exclusionsBlock +
                    buildGradle.slice(insertIndex);

                fs.writeFileSync(buildGradlePath, buildGradle, 'utf8');
                console.log('✅ Added AndroidX exclusions to build.gradle');
            } else {
                console.warn('⚠️  Could not find dependencies block in build.gradle');
            }

            return config;
        },
    ]);
};

module.exports = withAndroidXFix;
