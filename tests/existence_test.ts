/**
 * Test existence-based cyberbullying detection
 * Verifies that "Your existence is burden" and similar attacks are detected
 */

import { cyberbullyDetector } from '../services/semanticDetector';

// Test cases for existence-based attacks
const testCases = [
    {
        text: "Your existence is burden",
        shouldDetect: true,
        description: "Direct existence burden attack"
    },
    {
        text: "Your existence is a burden",
        shouldDetect: true,
        description: "Existence burden with article"
    },
    {
        text: "Your existence is waste",
        shouldDetect: true,
        description: "Existence waste attack"
    },
    {
        text: "Your existence is a mistake",
        shouldDetect: true,
        description: "Existence mistake attack"
    },
    {
        text: "ur existence is burden",
        shouldDetect: true,
        description: "Slang variation"
    },
    {
        text: "The world would be better without you",
        shouldDetect: true,
        description: "World better without you"
    },
    {
        text: "Everyone would be better off without you",
        shouldDetect: true,
        description: "Social existence negation"
    },
    {
        text: "You are a burden",
        shouldDetect: true,
        description: "Direct burden statement"
    },
    {
        text: "Your presence is a burden",
        shouldDetect: true,
        description: "Presence burden attack"
    },
    {
        text: "You shouldn't exist",
        shouldDetect: true,
        description: "Existence denial"
    },
    {
        text: "Have a great day!",
        shouldDetect: false,
        description: "Positive message"
    },
    {
        text: "The existence of this problem is a burden on the project",
        shouldDetect: false,
        description: "Non-personal existence reference"
    }
];

console.log('🧪 Testing Existence-Based Cyberbullying Detection\n');
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
        console.log(`   Semantic: ${result.semanticMatches.join(', ')}`);
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
    console.log('🎉 All tests passed! Existence-based attacks are now properly detected.');
} else {
    console.log('⚠️  Some tests failed. Review the patterns and thresholds.');
}
