/**
 * BERT Model File Verification
 * Quick check to verify model files exist before building APK
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(60));
console.log('BERT MODEL FILE VERIFICATION');
console.log('='.repeat(60));

const projectRoot = path.join(__dirname, '..');
const modelDir = path.join(projectRoot, 'assets', 'models');

console.log('\n[1] Checking directory structure...');
console.log(`Project root: ${projectRoot}`);
console.log(`Model directory: ${modelDir}`);

if (!fs.existsSync(modelDir)) {
    console.error('✗ Model directory does NOT exist!');
    console.error(`  Expected: ${modelDir}`);
    process.exit(1);
}
console.log('✓ Model directory exists');

console.log('\n[2] Checking model files...');

// Check TFLite model
const modelPath = path.join(modelDir, 'cyberbully_model.tflite');
if (!fs.existsSync(modelPath)) {
    console.error('✗ cyberbully_model.tflite NOT found!');
    console.error(`  Expected: ${modelPath}`);
} else {
    const stats = fs.statSync(modelPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`✓ cyberbully_model.tflite exists`);
    console.log(`  Size: ${sizeMB} MB`);
    console.log(`  Path: ${modelPath}`);
    
    if (stats.size < 100 * 1024 * 1024) {
        console.warn(`  ⚠ Warning: File seems small (expected ~105 MB)`);
    }
}

// Check vocab file
const vocabPath = path.join(modelDir, 'vocab.txt');
if (!fs.existsSync(vocabPath)) {
    console.error('✗ vocab.txt NOT found!');
    console.error(`  Expected: ${vocabPath}`);
} else {
    const stats = fs.statSync(vocabPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`✓ vocab.txt exists`);
    console.log(`  Size: ${sizeKB} KB`);
    console.log(`  Path: ${vocabPath}`);
    
    // Count lines
    const content = fs.readFileSync(vocabPath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim()).length;
    console.log(`  Tokens: ${lines}`);
    
    if (lines < 30000) {
        console.warn(`  ⚠ Warning: Vocab seems small (expected ~30,000+ tokens)`);
    }
}

console.log('\n[3] Checking app.json configuration...');
const appJsonPath = path.join(projectRoot, 'app.json');
if (fs.existsSync(appJsonPath)) {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8'));
    const plugins = appJson.expo.plugins || [];
    
    const tflitePlugin = plugins.find(p => 
        Array.isArray(p) && p[0] === 'react-native-fast-tflite'
    );
    
    if (tflitePlugin) {
        console.log('✓ react-native-fast-tflite plugin configured');
        console.log(`  Models: ${JSON.stringify(tflitePlugin[1].models)}`);
    } else {
        console.error('✗ react-native-fast-tflite plugin NOT configured in app.json');
    }
}

console.log('\n[4] Checking package.json dependencies...');
const packageJsonPath = path.join(projectRoot, 'package.json');
if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (deps['react-native-fast-tflite']) {
        console.log('✓ react-native-fast-tflite installed');
        console.log(`  Version: ${deps['react-native-fast-tflite']}`);
    } else {
        console.error('✗ react-native-fast-tflite NOT in dependencies');
    }
    
    if (deps['expo-asset']) {
        console.log('✓ expo-asset installed');
        console.log(`  Version: ${deps['expo-asset']}`);
    } else {
        console.warn('⚠ expo-asset not found (may cause issues)');
    }
}

console.log('\n[5] Checking metro.config.js...');
const metroConfigPath = path.join(projectRoot, 'metro.config.js');
if (fs.existsSync(metroConfigPath)) {
    const metroConfig = fs.readFileSync(metroConfigPath, 'utf-8');
    
    if (metroConfig.includes('tflite')) {
        console.log('✓ .tflite extension configured in metro.config.js');
    } else {
        console.warn('⚠ .tflite may not be in assetExts');
    }
} else {
    console.warn('⚠ metro.config.js not found');
}

console.log('\n' + '='.repeat(60));
console.log('VERIFICATION COMPLETE');
console.log('='.repeat(60));

console.log('\nNext Steps:');
console.log('1. Clean build: cd android && ./gradlew clean && cd ..');
console.log('2. Build APK: npx expo run:android --variant debug');
console.log('3. Check logs: adb logcat | grep "BERT"');
console.log('\nFor runtime testing, use: tests/bert_apk_verification.ts in the app');
