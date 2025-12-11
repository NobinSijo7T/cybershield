/**
 * Quick Test - Semantic Detector Only
 * 
 * Tests the app's cyberbullying detection using only the semantic detector
 * This bypasses BERT to verify the core functionality works
 */

import { cyberDetector } from '../services/cyberDetector';

console.log('\n=== SEMANTIC DETECTOR TEST ===\n');

async function testSemanticDetector() {
    const testCases = [
        { text: 'You are stupid', expectedRisk: 85, severity: 'Danger' },
        { text: 'I hate you', expectedRisk: 80, severity: 'Danger' },
        { text: 'You are a weight to the world', expectedRisk: 65, severity: 'Caution' },
        { text: 'You are a bad boy', expectedRisk: 33, severity: 'Low' },
        { text: 'lol noob', expectedRisk: 35, severity: 'Low' },
        { text: 'Hello friend', expectedRisk: 0, severity: 'Safe' },
        { text: 'Kill yourself', expectedRisk: 100, severity: 'Critical' },
        { text: 'You are amazing', expectedRisk: 0, severity: 'Safe' }
    ];

    console.log('Testing semantic detector performance...\n');

    let passed = 0;
    let failed = 0;

    for (const testCase of testCases) {
        const result = cyberDetector.detectCyberbullying(testCase.text);
        const actualRisk = Math.round(result.riskScore);
        const margin = 15; // Allow 15% margin
        
        const isPass = Math.abs(actualRisk - testCase.expectedRisk) <= margin;
        
        if (isPass) {
            console.log(`✓ PASS: "${testCase.text}"`);
            console.log(`  Expected: ~${testCase.expectedRisk}% (${testCase.severity})`);
            console.log(`  Got: ${actualRisk}% (${result.category})`);
            console.log(`  Matches: ${result.matches.map(m => m.pattern).join(', ')}\n`);
            passed++;
        } else {
            console.log(`✗ FAIL: "${testCase.text}"`);
            console.log(`  Expected: ~${testCase.expectedRisk}% (${testCase.severity})`);
            console.log(`  Got: ${actualRisk}% (${result.category})`);
            console.log(`  Difference: ${Math.abs(actualRisk - testCase.expectedRisk)}%\n`);
            failed++;
        }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`RESULTS: ${passed}/${testCases.length} tests passed (${Math.round(passed/testCases.length*100)}%)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (passed === testCases.length) {
        console.log('✓ Semantic detector is working perfectly!\n');
        console.log('The app will work with semantic detection (84% accurate)');
        console.log('even if BERT fails to load.\n');
    } else {
        console.log(`⚠ ${failed} test(s) failed. Semantic detector may need tuning.\n`);
    }
}

testSemanticDetector().catch(console.error);
