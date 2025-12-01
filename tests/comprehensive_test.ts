/**
 * Comprehensive test suite for all cyberbullying detection improvements
 */

import { cyberbullyDetector } from '../services/semanticDetector';

console.log('🧪 COMPREHENSIVE CYBERBULLYING DETECTION TEST SUITE\n');
console.log('='.repeat(70));

const testSuites = [
    {
        name: "Existence Attacks",
        tests: [
            { text: "Your existence is burden", shouldDetect: true },
            { text: "Your existence is a burden", shouldDetect: true },
            { text: "You are a burden", shouldDetect: true },
        ]
    },
    {
        name: "Shaming/Embarrassing Attacks",
        tests: [
            { text: "you are embarrassing", shouldDetect: true },
            { text: "You are pathetic", shouldDetect: true },
            { text: "You are a disgrace", shouldDetect: true },
        ]
    },
    {
        name: "Long/Complex Attacks",
        tests: [
            { text: "Your future is as empty as your brain", shouldDetect: true },
            { text: "Everyone voted that you shouldn't be part of this", shouldDetect: true },
            { text: "Your future is as empty as your brain,Everyone voted that you shouldn't be part of this", shouldDetect: true },
        ]
    },
    {
        name: "Intelligence/Brain Attacks",
        tests: [
            { text: "Your brain is empty", shouldDetect: true },
            { text: "You are so stupid that everyone laughs at you", shouldDetect: true },
            { text: "empty as your brain", shouldDetect: true },
        ]
    },
    {
        name: "Exclusion/Rejection",
        tests: [
            { text: "Nobody wants you here", shouldDetect: true },
            { text: "You shouldn't be part of this", shouldDetect: true },
            { text: "Everyone voted you out", shouldDetect: true },
        ]
    },
    {
        name: "Mockery/Social Attacks",
        tests: [
            { text: "Everyone laughs at you behind your back", shouldDetect: true },
            { text: "Your presence makes everything worse", shouldDetect: true },
        ]
    },
    {
        name: "Safe Content (Should NOT Detect)",
        tests: [
            { text: "Have a great day!", shouldDetect: false },
            { text: "This is embarrassing to watch", shouldDetect: false },
            { text: "The existence of this problem is a burden on the project", shouldDetect: false },
        ]
    }
];

let totalTests = 0;
let totalPassed = 0;
let totalFailed = 0;

for (const suite of testSuites) {
    console.log(`\n📂 ${suite.name}`);
    console.log('-'.repeat(70));
    
    let suitePassed = 0;
    let suiteFailed = 0;
    
    for (const test of suite.tests) {
        totalTests++;
        const result = cyberbullyDetector.classify(test.text);
        const detected = result.label === 'CYBERBULLY';
        const passed = detected === test.shouldDetect;
        
        if (passed) {
            suitePassed++;
            totalPassed++;
            console.log(`  ✅ "${test.text.substring(0, 50)}${test.text.length > 50 ? '...' : ''}"`);
        } else {
            suiteFailed++;
            totalFailed++;
            console.log(`  ❌ "${test.text.substring(0, 50)}${test.text.length > 50 ? '...' : ''}"`);
            console.log(`     Expected: ${test.shouldDetect ? 'CYBERBULLY' : 'SAFE'}, Got: ${result.label} (Score: ${result.score.toFixed(2)})`);
        }
    }
    
    const suiteRate = ((suitePassed / suite.tests.length) * 100).toFixed(1);
    console.log(`  📊 Suite: ${suitePassed}/${suite.tests.length} passed (${suiteRate}%)`);
}

console.log('\n' + '='.repeat(70));
console.log('\n🎯 FINAL RESULTS:');
console.log(`   Total Tests: ${totalTests}`);
console.log(`   ✅ Passed: ${totalPassed}`);
console.log(`   ❌ Failed: ${totalFailed}`);
console.log(`   📈 Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);

if (totalFailed === 0) {
    console.log('\n🎉 PERFECT SCORE! All cyberbullying detection tests passed!');
    console.log('   The system can now detect:');
    console.log('   ✓ Existence-based attacks');
    console.log('   ✓ Shaming and embarrassing attacks');
    console.log('   ✓ Complex long-form cyberbullying');
    console.log('   ✓ Intelligence and brain insults');
    console.log('   ✓ Group exclusion and voting');
    console.log('   ✓ Social mockery and behind-the-back attacks');
    console.log('   ✓ Presence negativity claims');
    console.log('   ✓ With minimal false positives!\n');
} else {
    console.log('\n⚠️  Some improvements needed. Review failed cases.\n');
}
