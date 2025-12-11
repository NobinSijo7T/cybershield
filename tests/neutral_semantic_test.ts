/**
 * Test neutral text to ensure no false positives with semantic detector
 */

import { cyberbullyDetector } from '../services/semanticDetector';

console.log('🧪 NEUTRAL TEXT DETECTION TEST\n');
console.log('='.repeat(70));

const testSuites = [
    {
        name: "Clearly Neutral/Positive",
        shouldDetect: false,
        tests: [
            "Hello, how are you?",
            "Good morning!",
            "Have a great day!",
            "Thank you so much",
            "You're welcome",
            "Nice to meet you",
            "See you later",
            "Take care",
            "What time is it?",
            "How's the weather?",
            "Are you free tomorrow?",
            "Let's grab coffee",
            "That's a good idea",
            "I agree with you",
            "You did a great job",
            "Congratulations on your achievement",
            "Happy birthday!",
            "Welcome to the team",
            "Thanks for your help",
            "I appreciate it"
        ]
    },
    {
        name: "Mildly Negative (But NOT Bullying)",
        shouldDetect: false,
        tests: [
            "I disagree with that",
            "That's not quite right",
            "I don't think so",
            "Maybe we should try something else",
            "This could be improved",
            "I'm not sure about that",
            "Let's think about it",
            "That's a bit confusing",
            "Can you explain that again?"
        ]
    },
    {
        name: "Actual Cyberbullying (SHOULD Detect)",
        shouldDetect: true,
        tests: [
            "You are stupid",
            "Nobody likes you",
            "You should die",
            "Kill yourself",
            "Everyone hates you",
            "You are worthless",
            "You are embarrassing",
            "Your existence is a burden"
        ]
    }
];

let totalTests = 0;
let totalPassed = 0;
let totalFailed = 0;

for (const suite of testSuites) {
    console.log(`\n📋 ${suite.name}`);
    console.log('-'.repeat(70));
    
    let suitePassed = 0;
    let suiteFailed = 0;
    
    for (const text of suite.tests) {
        const result = cyberbullyDetector.classify(text);
        const detected = result.label === 'CYBERBULLY';
        const expected = suite.shouldDetect;
        const passed = detected === expected;
        
        totalTests++;
        if (passed) {
            suitePassed++;
            totalPassed++;
        } else {
            suiteFailed++;
            totalFailed++;
            
            const status = passed ? '✅' : '❌';
            console.log(`${status} "${text}"`);
            console.log(`   Expected: ${expected ? 'CYBERBULLY' : 'SAFE'}, Got: ${result.label}`);
            console.log(`   Score: ${(result.score * 100).toFixed(1)}%, Severity: ${result.highSeverity ? 'HIGH' : 'NORMAL'}`);
            if (result.semanticMatches.length > 0) {
                console.log(`   Matches: ${result.semanticMatches.slice(0, 2).join(', ')}`);
            }
            if (result.wordAnalysis && result.wordAnalysis.some(w => w.isToxic)) {
                const toxicWords = result.wordAnalysis.filter(w => w.isToxic).map(w => `${w.word}(${w.severity})`);
                console.log(`   Toxic words: ${toxicWords.join(', ')}`);
            }
        }
    }
    
    console.log(`\n   Passed: ${suitePassed}/${suite.tests.length} (${((suitePassed/suite.tests.length)*100).toFixed(1)}%)`);
}

console.log('\n' + '='.repeat(70));
console.log('📊 OVERALL SUMMARY');
console.log('='.repeat(70));
console.log(`Total Tests: ${totalTests}`);
console.log(`✅ Passed: ${totalPassed}`);
console.log(`❌ Failed: ${totalFailed}`);
console.log(`📈 Accuracy: ${((totalPassed/totalTests)*100).toFixed(1)}%`);
console.log('='.repeat(70));
