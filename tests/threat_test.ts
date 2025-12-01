/**
 * Test threat detection for physical violence and self-harm
 */

import { cyberbullyDetector } from '../services/semanticDetector';

const testCases = [
    {
        text: "I will beat you",
        shouldDetect: true,
        description: "Physical violence threat"
    },
    {
        text: "I will stab you",
        shouldDetect: true,
        description: "Weapon-based threat"
    },
    {
        text: "Go Suicide",
        shouldDetect: true,
        description: "Self-harm encouragement"
    },
    {
        text: "I will kill you",
        shouldDetect: true,
        description: "Death threat"
    },
    {
        text: "I'll hurt you",
        shouldDetect: true,
        description: "Harm threat"
    },
    {
        text: "Go die",
        shouldDetect: true,
        description: "Death wish"
    }
];

console.log('🧪 Testing Threat Detection\n');
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
    console.log(`   Score: ${result.score.toFixed(3)}, High Severity: ${result.highSeverity}`);
    
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
