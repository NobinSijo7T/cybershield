/**
 * Debug Test - Test BERT & Semantic Detectors with Detailed Logging
 * Run with: npx ts-node tests/debug_test.ts
 */

import { cyberDetector } from '../services/cyberDetector.js';
import { bertDetector } from '../services/bertDetector.js';

const testCases = [
    { text: 'you are good for nothing', expected: 'CYBERBULLY', description: 'Phrase "good for nothing" should be detected' },
    { text: 'You are stupid', expected: 'CYBERBULLY', description: 'Direct insult' },
    { text: 'I hate you', expected: 'CYBERBULLY', description: 'Hate expression' },
    { text: 'Hello friend', expected: 'SAFE', description: 'Friendly greeting' },
    { text: 'You are amazing', expected: 'SAFE', description: 'Compliment' },
    { text: 'kill yourself', expected: 'CYBERBULLY', description: 'Critical threat' },
    { text: 'everyone hates you', expected: 'CYBERBULLY', description: 'Social rejection' },
    { text: 'you are a burden', expected: 'CYBERBULLY', description: 'Worth attack' },
];

async function runDebugTest() {
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║           DEBUG TEST - BERT & SEMANTIC DETECTORS              ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    // Initialize detectors
    console.log('[Debug Test] Initializing cyber detector...');
    await cyberDetector.initialize();
    
    console.log('[Debug Test] Attempting to initialize BERT detector...');
    await bertDetector.initialize();
    console.log('[Debug Test] BERT loaded:', bertDetector.isLoaded());
    console.log();

    let passed = 0;
    let failed = 0;

    for (const testCase of testCases) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📝 TEST: "${testCase.text}"`);
        console.log(`   Expected: ${testCase.expected} (${testCase.description})`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        try {
            // Test with CyberDetector (uses semantic + heuristic)
            console.log('\n[1] CyberDetector (Semantic + Heuristic):');
            const cyberResult = await cyberDetector.analyzeText(testCase.text);
            console.log('   Result:', {
                isCyberbullying: cyberResult.isCyberbullying,
                riskLevel: cyberResult.riskLevel,
                confidence: cyberResult.confidence.toFixed(3),
                categories: {
                    toxicity: cyberResult.categories.toxicity.toFixed(3),
                    threat: cyberResult.categories.threat.toFixed(3),
                    insult: cyberResult.categories.insult.toFixed(3),
                    identity_hate: cyberResult.categories.identity_hate.toFixed(3),
                }
            });

            // Test with BERT (if loaded)
            if (bertDetector.isLoaded()) {
                console.log('\n[2] BERT Detector:');
                const bertResult = await bertDetector.analyzeText(testCase.text);
                console.log('   Result:', {
                    isCyberbullying: bertResult.isCyberbullying,
                    riskLevel: bertResult.riskLevel,
                    confidence: bertResult.confidence.toFixed(3),
                    severity: bertResult.severity.toFixed(3),
                    probabilities: bertResult.probabilities.map(p => p.toFixed(4)),
                    processingTime: `${bertResult.processingTime}ms`
                });

                // Check for consistency
                if (cyberResult.isCyberbullying !== bertResult.isCyberbullying) {
                    console.warn('   ⚠️  WARNING: CyberDetector and BERT disagree on classification!');
                }
            } else {
                console.log('\n[2] BERT Detector: NOT LOADED (expected in dev environment)');
            }

            // Evaluate against expected
            const actualLabel = cyberResult.isCyberbullying ? 'CYBERBULLY' : 'SAFE';
            const isPass = actualLabel === testCase.expected;

            if (isPass) {
                console.log(`\n✅ PASS: Classification matches expected result`);
                passed++;
            } else {
                console.log(`\n❌ FAIL: Expected ${testCase.expected}, got ${actualLabel}`);
                failed++;
            }

        } catch (error) {
            console.error('\n❌ ERROR during test:', error);
            failed++;
        }

        console.log();
    }

    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                        TEST SUMMARY                           ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    console.log(`Total Tests: ${testCases.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Accuracy: ${Math.round((passed / testCases.length) * 100)}%`);
    console.log();

    if (failed === 0) {
        console.log('🎉 All tests passed! The detectors are working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Review the logs above for details.');
        console.log('   Check:');
        console.log('   1. Semantic patterns in semanticDetector.ts');
        console.log('   2. Keyword lists in cyberDetector.ts');
        console.log('   3. BERT model outputs (if loaded)');
        console.log('   4. Tokenization (tokens should match BERT vocab)');
    }
    console.log();
}

// Run the test
runDebugTest()
    .then(() => {
        console.log('[Debug Test] Test completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('[Debug Test] Test failed with error:', error);
        process.exit(1);
    });
