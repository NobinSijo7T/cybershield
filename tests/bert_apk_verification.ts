/**
 * BERT Model APK Verification Test
 * 
 * This test helps diagnose why BERT model might be showing as unavailable
 * in Android APK builds even when the model files are present.
 * 
 * Run this in the Android app to see detailed diagnostics.
 */

import { Asset } from 'expo-asset';
import { Platform } from 'react-native';
import { bertDetector } from '../services/bertDetector';

export async function verifyBERTModelInAPK(): Promise<void> {
    console.log('='.repeat(60));
    console.log('BERT MODEL APK VERIFICATION TEST');
    console.log('='.repeat(60));
    
    // Step 1: Check platform
    console.log('\n[Step 1] Platform Information:');
    console.log(`- Platform: ${Platform.OS}`);
    console.log(`- Version: ${Platform.Version}`);
    console.log(`- Is Testing: ${Platform.isTesting}`);
    
    // Step 2: Check TFLite module availability
    console.log('\n[Step 2] Checking TFLite Module:');
    try {
        const tfliteModule = require('react-native-fast-tflite');
        console.log('✓ TFLite module imported successfully');
        console.log(`- Module keys: ${Object.keys(tfliteModule).join(', ')}`);
        
        if (tfliteModule.loadTensorflowModel) {
            console.log('✓ loadTensorflowModel function exists');
        } else {
            console.error('✗ loadTensorflowModel function NOT found');
        }
        
        if (tfliteModule.useTensorflowModel) {
            console.log('✓ useTensorflowModel hook exists');
        }
    } catch (error) {
        console.error('✗ Failed to import TFLite module:', error);
        console.error('  This is normal in Expo Go, but should work in development/production builds');
    }
    
    // Step 3: Check model file assets
    console.log('\n[Step 3] Checking Model Assets:');
    try {
        // Check model file
        const modelAsset = Asset.fromModule(require('../assets/models/cyberbully_model.tflite'));
        console.log('✓ Model asset reference created');
        console.log(`- Name: ${modelAsset.name}`);
        console.log(`- Type: ${modelAsset.type}`);
        console.log(`- URI: ${modelAsset.uri}`);
        
        console.log('  Downloading asset...');
        await modelAsset.downloadAsync();
        console.log(`✓ Model asset downloaded`);
        console.log(`- Local URI: ${modelAsset.localUri}`);
        console.log(`- Downloaded: ${modelAsset.downloaded}`);
        
        // Check vocab file
        const vocabAsset = Asset.fromModule(require('../assets/models/vocab.txt'));
        console.log('✓ Vocab asset reference created');
        await vocabAsset.downloadAsync();
        console.log(`✓ Vocab asset downloaded`);
        console.log(`- Local URI: ${vocabAsset.localUri}`);
        
    } catch (error) {
        console.error('✗ Failed to load assets:', error);
    }
    
    // Step 4: Check BERT detector initialization
    console.log('\n[Step 4] BERT Detector Initialization:');
    console.log(`- Initial state: ${bertDetector.isLoaded() ? 'LOADED' : 'NOT LOADED'}`);
    
    try {
        console.log('  Attempting to initialize...');
        await bertDetector.initialize();
        console.log(`- After init: ${bertDetector.isLoaded() ? 'LOADED ✓' : 'NOT LOADED ✗'}`);
        
        if (bertDetector.isLoaded()) {
            console.log('\n✓✓✓ SUCCESS! BERT model loaded successfully');
        } else {
            console.error('\n✗✗✗ FAILED! BERT model did not load');
            console.error('  Check the errors above for details');
        }
    } catch (error) {
        console.error('✗ Initialization error:', error);
    }
    
    // Step 5: Test model inference (if loaded)
    if (bertDetector.isLoaded()) {
        console.log('\n[Step 5] Testing Model Inference:');
        try {
            const testText = "You are stupid and worthless";
            console.log(`  Test text: "${testText}"`);
            
            const result = await bertDetector.analyzeText(testText);
            console.log('✓ Inference completed successfully');
            console.log(`- Is Cyberbullying: ${result.isCyberbullying}`);
            console.log(`- Confidence: ${(result.confidence * 100).toFixed(2)}%`);
            console.log(`- Risk Level: ${result.riskLevel}/100`);
            console.log(`- Processing Time: ${result.processingTime}ms`);
            console.log(`- Probabilities: [${result.probabilities.map(p => p.toFixed(3)).join(', ')}]`);
        } catch (error) {
            console.error('✗ Inference test failed:', error);
        }
    } else {
        console.log('\n[Step 5] SKIPPED - Model not loaded');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('VERIFICATION TEST COMPLETE');
    console.log('='.repeat(60));
}

/**
 * Quick test function to run from app
 */
export async function runBERTTest() {
    try {
        await verifyBERTModelInAPK();
    } catch (error) {
        console.error('Test execution error:', error);
    }
}

// Export for use in app
export default {
    verifyBERTModelInAPK,
    runBERTTest
};
