module.exports = {
    expo: {
        name: 'CyberShield AI',
        slug: 'cybershield',
        owner: 'nobin_77t',
        version: '1.0.0',
        orientation: 'portrait',
        icon: './assets/images/icon.png',
        scheme: 'cybershield',
        userInterfaceStyle: 'automatic',
        newArchEnabled: true,
        extra: {
            eas: {
                projectId: '0b0ac99e-afa7-44cd-a8f3-f4ada3d42dce'
            }
        },
        ios: {
            supportsTablet: true,
        },
        android: {
            adaptiveIcon: {
                backgroundColor: '#E6F4FE',
                foregroundImage: './assets/images/android-icon-foreground.png',
                backgroundImage: './assets/images/android-icon-background.png',
                monochromeImage: './assets/images/android-icon-monochrome.png',
            },
            package: 'com.nobin360t.cybershield',
            edgeToEdgeEnabled: true,
            predictiveBackGestureEnabled: false,
            permissions: [
                'RECORD_AUDIO',
                'INTERNET'
            ],
        },
        web: {
            output: 'static',
            favicon: './assets/images/favicon.png',
        },
        plugins: [
            'expo-router',
            'expo-asset',
            'expo-speech-recognition',
            './plugins/withGradleProperties.js',
            [
                'react-native-fast-tflite',
                {
                    models: [
                        './assets/models/cyberbully_model.tflite'
                    ]
                }
            ],
        ],
        experiments: {
            typedRoutes: true,
            reactCompiler: true,
        },
    },
};
