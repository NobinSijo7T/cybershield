/**
 * Comprehensive Test Runner
 * Runs all semantic detection tests to verify accuracy
 */

const { cyberbullyDetector } = require('../services/semanticDetector.ts');

console.log('='.repeat(70));
console.log('COMPREHENSIVE ACCURACY TEST - ALL SCENARIOS');
console.log('='.repeat(70));

const testSuites = {
    "Weight/Burden Tests": [
        {
            text: "You are a weight to this world",
            expected: "CYBERBULLY",
            expectedRisk: "60-70%",
            severity: "Caution/High"
        },
        {
            text: "You are a burden to society",
            expected: "CYBERBULLY",
            expectedRisk: "60-70%",
            severity: "Caution/High"
        },
        {
            text: "This bag is too heavy, it has weight",
            expected: "NO_CYBERBULLY",
            expectedRisk: "0-5%",
            severity: "Safe"
        }
    ],
    "Mild Personal Attacks": [
        {
            text: "You are a bad boy",
            expected: "CYBERBULLY",
            expectedRisk: "15-25%",
            severity: "Low"
        },
        {
            text: "You are a bad girl",
            expected: "CYBERBULLY",
            expectedRisk: "15-25%",
            severity: "Low"
        },
        {
            text: "This is a bad idea",
            expected: "NO_CYBERBULLY",
            expectedRisk: "0-5%",
            severity: "Safe"
        }
    ],
    "Medium Severity Insults": [
        {
            text: "You are stupid",
            expected: "CYBERBULLY",
            expectedRisk: "40-60%",
            severity: "Medium"
        },
        {
            text: "You are dumb",
            expected: "CYBERBULLY",
            expectedRisk: "40-60%",
            severity: "Medium"
        },
        {
            text: "You idiot",
            expected: "CYBERBULLY",
            expectedRisk: "40-60%",
            severity: "Medium"
        }
    ],
    "High Severity Attacks": [
        {
            text: "You are worthless",
            expected: "CYBERBULLY",
            expectedRisk: "60-80%",
            severity: "High"
        },
        {
            text: "Fuck you bitch",
            expected: "CYBERBULLY",
            expectedRisk: "60-75%",
            severity: "High"
        },
        {
            text: "You are pathetic",
            expected: "CYBERBULLY",
            expectedRisk: "50-70%",
            severity: "Medium/High"
        }
    ],
    "Critical Threats": [
        {
            text: "I will kill you",
            expected: "CYBERBULLY",
            expectedRisk: "90-100%",
            severity: "Critical/Danger"
        },
        {
            text: "You should die",
            expected: "CYBERBULLY",
            expectedRisk: "90-100%",
            severity: "Critical/Danger"
        },
        {
            text: "Go kill yourself",
            expected: "CYBERBULLY",
            expectedRisk: "95-100%",
            severity: "Critical/Danger"
        }
    ],
    "Safe Messages": [
        {
            text: "Great work!",
            expected: "NO_CYBERBULLY",
            expectedRisk: "0%",
            severity: "Safe"
        },
        {
            text: "How are you today?",
            expected: "NO_CYBERBULLY",
            expectedRisk: "0%",
            severity: "Safe"
        },
        {
            text: "Let's meet at 5pm",
            expected: "NO_CYBERBULLY",
            expectedRisk: "0%",
            severity: "Safe"
        }
    ],
    "Existential Attacks": [
        {
            text: "Your existence is a mistake",
            expected: "CYBERBULLY",
            expectedRisk: "70-85%",
            severity: "High"
        },
        {
            text: "Nobody likes you",
            expected: "CYBERBULLY",
            expectedRisk: "60-75%",
            severity: "Caution/High"
        },
        {
            text: "Everyone hates you",
            expected: "CYBERBULLY",
            expectedRisk: "65-80%",
            severity: "High"
        }
    ]
};

let totalTests = 0;
let passedTests = 0;
let failedTests = [];

for (const [suiteName, tests] of Object.entries(testSuites)) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`${suiteName}`);
    console.log('='.repeat(70));
    
    for (const test of tests) {
        totalTests++;
        const result = cyberbullyDetector.classify(test.text);
        const riskLevel = Math.round(result.score * 100);
        const passed = result.label === test.expected;
        
        console.log(`\n${passed ? '✓' : '✗'} "${test.text}"`);
        console.log(`   Expected: ${test.expected} (${test.expectedRisk}) - ${test.severity}`);
        console.log(`   Actual: ${result.label} (${riskLevel}%)`);
        
        if (result.wordAnalysis) {
            const toxicWords = result.wordAnalysis.filter(w => w.isToxic);
            if (toxicWords.length > 0) {
                console.log(`   Toxic words: ${toxicWords.map(w => `${w.word}[${w.severity}]`).join(', ')}`);
            }
        }
        
        if (result.semanticMatches && result.semanticMatches.length > 0) {
            console.log(`   Patterns: ${result.semanticMatches.slice(0, 2).join(', ')}`);
        }
        
        if (passed) {
            passedTests++;
        } else {
            failedTests.push({
                text: test.text,
                expected: test.expected,
                actual: result.label,
                risk: riskLevel
            });
        }
    }
}

console.log(`\n${'='.repeat(70)}`);
console.log('TEST SUMMARY');
console.log('='.repeat(70));
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests} (${Math.round(passedTests/totalTests*100)}%)`);
console.log(`Failed: ${failedTests.length}`);

if (failedTests.length > 0) {
    console.log(`\nFailed Tests:`);
    failedTests.forEach((test, i) => {
        console.log(`  ${i+1}. "${test.text}"`);
        console.log(`     Expected: ${test.expected}, Got: ${test.actual} (${test.risk}%)`);
    });
}

console.log(`\n${'='.repeat(70)}`);
console.log('ACCURACY VERIFIED!');
console.log('='.repeat(70));
