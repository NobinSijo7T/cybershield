/**
 * Test long text cyberbullying detection
 * Verifies that longer combined attacks are detected
 */

import { cyberbullyDetector } from '../services/semanticDetector';

// Test cases for long text attacks
const testCases = [
    {
        text: "Your future is as empty as your brain",
        shouldDetect: true,
        description: "Brain insult with future attack"
    },
    {
        text: "Everyone voted that you shouldn't be part of this",
        shouldDetect: true,
        description: "Group exclusion vote"
    },
    {
        text: "Your future is as empty as your brain,Everyone voted that you shouldn't be part of this",
        shouldDetect: true,
        description: "Combined long attack"
    },
    {
        text: "Nobody wants you here and you know it",
        shouldDetect: true,
        description: "Rejection with confirmation"
    },
    {
        text: "You are so stupid that everyone laughs at you behind your back",
        shouldDetect: true,
        description: "Intelligence attack with social mockery"
    },
    {
        text: "Your presence makes everything worse for everyone",
        shouldDetect: true,
        description: "Presence negativity claim"
    }
];

console.log('🧪 Testing Long Text Cyberbullying Detection\n');
console.log('='.repeat(60));

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
    const result = cyberbullyDetector.classify(testCase.text);
    const detected = result.label === 'CYBERBULLY';
    const testPassed = detected === testCase.shouldDetect;
    
    if (testPassed) {
        passed++;
        console.log(`✅ PASS: ${testCase.description}`);
    } else {
        failed++;
        console.log(`❌ FAIL: ${testCase.description}`);
    }
    
    console.log(`   Text: "${testCase.text}"`);
    console.log(`   Expected: ${testCase.shouldDetect ? 'CYBERBULLY' : 'NO_CYBERBULLY'}, Got: ${result.label}`);
    console.log(`   Score: ${result.score.toFixed(3)}, Severity: ${result.highSeverity ? 'HIGH' : 'LOW'}`);
    
    if (result.semanticMatches.length > 0) {
        console.log(`   Semantic: ${result.semanticMatches.slice(0, 2).join(', ')}`);
    }
    if (result.matchedSignals.length > 0) {
        console.log(`   Signals: ${result.matchedSignals.slice(0, 3).join(', ')}`);
    }
    console.log();
}

console.log('='.repeat(60));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);
console.log(`Success rate: ${((passed / testCases.length) * 100).toFixed(1)}%\n`);

if (failed === 0) {
    console.log('🎉 All tests passed! Long text attacks are now properly detected.');
} else {
    console.log('⚠️  Some tests failed. Review the patterns and thresholds.');
}
