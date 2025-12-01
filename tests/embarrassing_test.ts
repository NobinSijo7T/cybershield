/**
 * Test embarrassing/shaming attack detection
 * Verifies that "you are embarrassing" and similar attacks are detected
 */

import { cyberbullyDetector } from '../services/semanticDetector';

// Test cases for embarrassing/shaming attacks
const testCases = [
    {
        text: "you are embarrassing",
        shouldDetect: true,
        description: "Direct embarrassing attack"
    },
    {
        text: "You are so embarrassing",
        shouldDetect: true,
        description: "Embarrassing with intensifier"
    },
    {
        text: "you are an embarrassment",
        shouldDetect: true,
        description: "Embarrassment label"
    },
    {
        text: "You are pathetic",
        shouldDetect: true,
        description: "Pathetic attack"
    },
    {
        text: "you are disgusting",
        shouldDetect: true,
        description: "Disgusting attack"
    },
    {
        text: "You are such a disgrace",
        shouldDetect: true,
        description: "Disgrace label"
    },
    {
        text: "You are a disappointment",
        shouldDetect: true,
        description: "Disappointment attack"
    },
    {
        text: "You are a failure",
        shouldDetect: true,
        description: "Failure label"
    },
    {
        text: "I'm ashamed of you",
        shouldDetect: true,
        description: "Ashamed of you"
    },
    {
        text: "You should be ashamed",
        shouldDetect: true,
        description: "Direct shame command"
    },
    {
        text: "Such a loser",
        shouldDetect: true,
        description: "Loser label"
    },
    {
        text: "What a disappointment",
        shouldDetect: true,
        description: "Disappointment exclamation"
    },
    {
        text: "This is embarrassing to watch",
        shouldDetect: false,
        description: "Non-personal embarrassing reference"
    },
    {
        text: "Great job on your presentation!",
        shouldDetect: false,
        description: "Positive message"
    }
];

console.log('🧪 Testing Embarrassing/Shaming Attack Detection\n');
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
    console.log('🎉 All tests passed! Embarrassing/shaming attacks are now properly detected.');
} else {
    console.log('⚠️  Some tests failed. Review the patterns and thresholds.');
}
