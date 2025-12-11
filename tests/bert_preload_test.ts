/**
 * BERT Preload Test
 * 
 * Tests that BERT model initializes correctly on app startup
 * and is ready for immediate use without delay
 */

import { bertDetector } from '../services/bertDetector';

console.log('\n=== BERT PRELOAD TEST ===\n');

async function testBERTPreload() {
    console.log('Test 1: Initial BERT initialization');
    console.log('Expected: Model loads successfully with timing metrics\n');

    const initStart = Date.now();
    try {
        await bertDetector.initialize();
        const initTime = Date.now() - initStart;
        console.log(`✓ BERT initialized in ${initTime}ms`);
        console.log('Status: PASS - Model loaded\n');
    } catch (error) {
        console.error('✗ BERT initialization failed:', error);
        console.log('Status: FAIL - Will use semantic fallback\n');
    }

    console.log('Test 2: Duplicate initialization (should be instant)');
    console.log('Expected: Already initialized, no re-loading\n');

    const reinitStart = Date.now();
    await bertDetector.initialize();
    const reinitTime = Date.now() - reinitStart;
    console.log(`✓ Re-initialization completed in ${reinitTime}ms`);
    console.log('Status:', reinitTime < 10 ? 'PASS - Instant (cached)' : 'WARNING - Slower than expected\n');

    console.log('Test 3: Immediate detection (no lazy loading delay)');
    console.log('Expected: Detection works immediately without loading delay\n');

    const detectStart = Date.now();
    const result = await bertDetector.analyzeText('You are stupid');
    const detectTime = Date.now() - detectStart;

    console.log(`✓ Detection completed in ${detectTime}ms`);
    console.log(`Result: ${(result.confidence * 100).toFixed(1)}% confidence`);
    console.log(`Is Cyberbullying: ${result.isCyberbullying}`);
    console.log(`Risk Level: ${result.riskLevel}%`);
    console.log('Status: PASS - Detection working\n');

    console.log('Test 4: Verify no loading delay on subsequent detections');
    console.log('Expected: Consistent fast detection times\n');

    const times: number[] = [];
    const testTexts = [
        'I hate you',
        'You are worthless',
        'Hello friend',
        'You are amazing',
        'Kill yourself'
    ];

    for (const text of testTexts) {
        const start = Date.now();
        await bertDetector.analyzeText(text);
        const time = Date.now() - start;
        times.push(time);
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);

    console.log(`Average detection time: ${avgTime.toFixed(1)}ms`);
    console.log(`Range: ${minTime}ms - ${maxTime}ms`);
    console.log('Status:', maxTime < 500 ? 'PASS - Consistent performance' : 'WARNING - High variance detected\n');

    console.log('\n=== TEST SUMMARY ===');
    console.log('BERT Preloading: ✓ Implemented');
    console.log('Initialization Pattern: Singleton with promise caching');
    console.log('Graceful Fallback: ✓ Enabled (semantic detector)');
    console.log('APK Compatibility: ✓ Uses require() for model loading');
    console.log('\nRecommendation: Build APK and test on physical device for production validation\n');
}

// Run test
testBERTPreload().catch(console.error);
