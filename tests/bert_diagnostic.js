/**
 * BERT Model Diagnostic Script
 * Checks all requirements for BERT model to work correctly
 */

const fs = require('fs');
const path = require('path');

console.log('\n═══════════════════════════════════════════════════════════');
console.log('   BERT MODEL DIAGNOSTIC TEST');
console.log('═══════════════════════════════════════════════════════════\n');

let allChecksPassed = true;

// CHECK 1: Model file exists and is correct size
console.log('CHECK 1: Model File (cyberbully_model.tflite)');
console.log('─────────────────────────────────────────────────────────');
const modelPaths = [
    path.join(__dirname, '../assets/models/cyberbully_model.tflite'),
    path.join(__dirname, '../android/app/src/main/assets/models/cyberbully_model.tflite')
];

let modelFound = false;
for (const modelPath of modelPaths) {
    if (fs.existsSync(modelPath)) {
        const stats = fs.statSync(modelPath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`✓ Found at: ${modelPath}`);
        console.log(`  Size: ${sizeMB} MB (${stats.size} bytes)`);
        
        if (stats.size > 100 * 1024 * 1024 && stats.size < 120 * 1024 * 1024) {
            console.log('  ✓ Size is correct (~106 MB expected)');
        } else {
            console.log(`  ✗ WARNING: Size unexpected (expected ~106 MB, got ${sizeMB} MB)`);
            allChecksPassed = false;
        }
        modelFound = true;
        break;
    }
}

if (!modelFound) {
    console.log('✗ Model file NOT FOUND in any expected location:');
    modelPaths.forEach(p => console.log(`  - ${p}`));
    allChecksPassed = false;
}
console.log();

// CHECK 2: Vocabulary file exists and is correct size
console.log('CHECK 2: Vocabulary File (vocab.txt)');
console.log('─────────────────────────────────────────────────────────');
const vocabPaths = [
    path.join(__dirname, '../assets/models/vocab.txt'),
    path.join(__dirname, '../android/app/src/main/assets/models/vocab.txt')
];

let vocabFound = false;
for (const vocabPath of vocabPaths) {
    if (fs.existsSync(vocabPath)) {
        const stats = fs.statSync(vocabPath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        console.log(`✓ Found at: ${vocabPath}`);
        console.log(`  Size: ${sizeKB} KB (${stats.size} bytes)`);
        
        // Read and validate vocab structure
        const vocabContent = fs.readFileSync(vocabPath, 'utf8');
        const lines = vocabContent.trim().split('\n');
        console.log(`  Vocab size: ${lines.length} tokens`);
        
        if (lines.length > 25000 && lines.length < 35000) {
            console.log('  ✓ Vocab size is correct (~30k tokens expected for BERT)');
        } else {
            console.log(`  ✗ WARNING: Vocab size unexpected (expected ~30k, got ${lines.length})`);
            allChecksPassed = false;
        }
        
        // Check for required special tokens
        const hasUnk = lines.includes('[UNK]');
        const hasCls = lines.includes('[CLS]');
        const hasSep = lines.includes('[SEP]');
        const hasPad = lines.includes('[PAD]');
        
        if (hasUnk && hasCls && hasSep && hasPad) {
            console.log('  ✓ All required special tokens found ([UNK], [CLS], [SEP], [PAD])');
        } else {
            console.log('  ✗ WARNING: Missing special tokens:');
            if (!hasUnk) console.log('    - [UNK] not found');
            if (!hasCls) console.log('    - [CLS] not found');
            if (!hasSep) console.log('    - [SEP] not found');
            if (!hasPad) console.log('    - [PAD] not found');
            allChecksPassed = false;
        }
        
        vocabFound = true;
        break;
    }
}

if (!vocabFound) {
    console.log('✗ Vocabulary file NOT FOUND in any expected location:');
    vocabPaths.forEach(p => console.log(`  - ${p}`));
    allChecksPassed = false;
}
console.log();

// CHECK 3: Config files exist
console.log('CHECK 3: Configuration Files');
console.log('─────────────────────────────────────────────────────────');
const configFiles = [
    'config.json',
    'tokenizer_config.json',
    'special_tokens_map.json'
];

for (const configFile of configFiles) {
    const configPaths = [
        path.join(__dirname, `../assets/models/${configFile}`),
        path.join(__dirname, `../android/app/src/main/assets/models/${configFile}`)
    ];
    
    let found = false;
    for (const configPath of configPaths) {
        if (fs.existsSync(configPath)) {
            console.log(`✓ ${configFile} found at: ${configPath}`);
            found = true;
            break;
        }
    }
    
    if (!found) {
        console.log(`✗ ${configFile} NOT FOUND`);
        allChecksPassed = false;
    }
}
console.log();

// CHECK 4: Tokenizer logic test
console.log('CHECK 4: Tokenizer Logic Test');
console.log('─────────────────────────────────────────────────────────');
console.log('Testing if tokenizer can be imported and basic tokenization works...');

try {
    // Try to import tokenizer
    const tokenizerModule = require('../services/tokenizer.ts');
    console.log('✓ Tokenizer module can be imported');
    
    // We can't fully test without vocab loaded, but we checked vocab exists above
    console.log('  Note: Full tokenization test requires running in app context');
} catch (error) {
    console.log('✗ Failed to import tokenizer module:');
    console.log(`  Error: ${error.message}`);
    allChecksPassed = false;
}
console.log();

// CHECK 5: BERT Detector service structure
console.log('CHECK 5: BERT Detector Service');
console.log('─────────────────────────────────────────────────────────');
const bertDetectorPath = path.join(__dirname, '../services/bertDetector.ts');
if (fs.existsSync(bertDetectorPath)) {
    const bertCode = fs.readFileSync(bertDetectorPath, 'utf8');
    
    // Check for proper tokenizer usage
    if (bertCode.includes('tokenizerInstance.encode')) {
        console.log('✓ BERT detector uses proper tokenizer');
    } else {
        console.log('✗ WARNING: BERT detector may not be using tokenizer correctly');
        allChecksPassed = false;
    }
    
    // Check for TFLite model loading
    if (bertCode.includes('loadTensorflowModel')) {
        console.log('✓ BERT detector loads TFLite model');
    } else {
        console.log('✗ WARNING: BERT detector missing TFLite model loading');
        allChecksPassed = false;
    }
    
    // Check for softmax function
    if (bertCode.includes('softmax')) {
        console.log('✓ BERT detector has softmax for probability conversion');
    } else {
        console.log('✗ WARNING: BERT detector missing softmax function');
        allChecksPassed = false;
    }
    
    // Check for debug logging
    if (bertCode.includes('[BERT Detector] Logits:')) {
        console.log('✓ BERT detector has debug logging enabled');
    } else {
        console.log('⚠ BERT detector missing debug logging (not critical)');
    }
} else {
    console.log('✗ BERT detector service file not found');
    allChecksPassed = false;
}
console.log();

// CHECK 6: Android APK assets directory
console.log('CHECK 6: Android APK Assets Directory');
console.log('─────────────────────────────────────────────────────────');
const androidAssetsDir = path.join(__dirname, '../android/app/src/main/assets/models');
if (fs.existsSync(androidAssetsDir)) {
    console.log(`✓ Android assets directory exists: ${androidAssetsDir}`);
    
    const files = fs.readdirSync(androidAssetsDir);
    console.log(`  Files in directory: ${files.length}`);
    files.forEach(file => {
        const filePath = path.join(androidAssetsDir, file);
        const stats = fs.statSync(filePath);
        const size = stats.size > 1024 * 1024 
            ? `${(stats.size / (1024 * 1024)).toFixed(2)} MB`
            : `${(stats.size / 1024).toFixed(2)} KB`;
        console.log(`    - ${file} (${size})`);
    });
    
    const hasModel = files.includes('cyberbully_model.tflite');
    const hasVocab = files.includes('vocab.txt');
    
    if (hasModel && hasVocab) {
        console.log('  ✓ All required model files present in Android assets');
    } else {
        console.log('  ✗ Missing required files in Android assets:');
        if (!hasModel) console.log('    - cyberbully_model.tflite');
        if (!hasVocab) console.log('    - vocab.txt');
        allChecksPassed = false;
    }
} else {
    console.log('✗ Android assets directory NOT FOUND');
    console.log('  Expected at: ' + androidAssetsDir);
    console.log('  This means model files won\'t be bundled in APK!');
    allChecksPassed = false;
}
console.log();

// CHECK 7: Package dependencies
console.log('CHECK 7: Package Dependencies');
console.log('─────────────────────────────────────────────────────────');
const packageJsonPath = path.join(__dirname, '../package.json');
if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (deps['react-native-fast-tflite']) {
        console.log('✓ react-native-fast-tflite dependency found');
        console.log(`  Version: ${deps['react-native-fast-tflite']}`);
    } else {
        console.log('✗ react-native-fast-tflite NOT FOUND in dependencies');
        console.log('  This is required for BERT model inference!');
        allChecksPassed = false;
    }
    
    if (deps['expo-asset']) {
        console.log('✓ expo-asset dependency found (for asset loading)');
    } else {
        console.log('⚠ expo-asset not found (may cause asset loading issues)');
    }
} else {
    console.log('✗ package.json not found');
    allChecksPassed = false;
}
console.log();

// FINAL SUMMARY
console.log('═══════════════════════════════════════════════════════════');
console.log('   DIAGNOSTIC SUMMARY');
console.log('═══════════════════════════════════════════════════════════\n');

if (allChecksPassed) {
    console.log('✓ ALL CHECKS PASSED!');
    console.log('\nBERT model setup is correct. If still showing "not cyberbullying"');
    console.log('for everything, the issue is likely:');
    console.log('  1. Model was trained on different label encoding');
    console.log('     (label 0 = bullying, label 1 = safe instead of reverse)');
    console.log('  2. Model input preprocessing mismatch');
    console.log('  3. Model outputs need different interpretation');
    console.log('\nCheck the app logs for:');
    console.log('  - [BERT Detector] Logits: [...]');
    console.log('  - If logits are always similar (e.g., [0.5, 0.5]) - model issue');
    console.log('  - If logits have range but wrong label - try swapping label indices');
} else {
    console.log('✗ SOME CHECKS FAILED');
    console.log('\nPlease fix the issues above before testing BERT model.');
    console.log('The semantic detector will work as fallback in the meantime.');
}

console.log('\n═══════════════════════════════════════════════════════════\n');
