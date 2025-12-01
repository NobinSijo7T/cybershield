const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for CSS files on web
config.resolver.sourceExts.push('css');

// Add support for additional asset extensions
config.resolver.assetExts.push('csv', 'txt', 'tflite');

// Add Node.js polyfills for bytez.js
config.resolver.extraNodeModules = {
  stream: require.resolve('stream-browserify'),
  events: require.resolve('events'),
  util: require.resolve('util'),
  buffer: require.resolve('buffer'),
};

module.exports = config;
