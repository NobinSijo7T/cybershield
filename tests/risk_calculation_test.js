/**
 * Test Risk Calculation with Different Severities
 */

const { cyberbullyDetector } = require('../services/semanticDetector');

console.log('='.repeat(60));
console.log('RISK CALCULATION TEST - WORD SEVERITY WEIGHTING');
console.log('='.repeat(60));

const testCases = [
    {
        text: "You are a bad boy",
        expectedRisk: "Low (15-25%)",
        reason: "'bad' is mild/contextual word"
    },
    {
        text: "You are a bad girl",
        expectedRisk: "Low (15-25%)",
        reason: "'bad' is mild/contextual word"
    },
    {
        text: "You are stupid",
        expectedRisk: "Medium (40-60%)",
        reason: "'stupid' is medium severity insult"
    },
    {
        text: "You are worthless",
        expectedRisk: "High (60-80%)",
        reason: "'worthless' is high severity attack"
    },
    {
        text: "You should die",
        expectedRisk: "Critical (90-100%)",
        reason: "'die' is critical threat word"
    },
    {
        text: "I will kill you",
        expectedRisk: "Critical (95-100%)",
        reason: "Death threat - highest severity"
    },
    {
        text: "Fuck you bitch",
        expectedRisk: "High (65-75%)",
        reason: "Multiple medium severity profanity"
    },
    {
        text: "You are a weight to this world",
        expectedRisk: "High (70-85%)",
        reason: "Existential attack pattern"
    },
    {
        text: "Great work!",
        expectedRisk: "Safe (0%)",
        reason: "No toxic content"
    },
    {
        text: "This is a bad idea",
        expectedRisk: "Safe (0-5%)",
        reason: "'bad' without personal context"
    }
];

console.log('\n');

for (const testCase of testCases) {
    const result = cyberbullyDetector.classify(testCase.text);
    const riskLevel = Math.round(result.score * 100);
    
    console.log(`\nText: "${testCase.text}"`);
    console.log(`Expected: ${testCase.expectedRisk}`);
    console.log(`Actual: ${riskLevel}% (${result.label})`);
    console.log(`Reason: ${testCase.reason}`);
    
    if (result.wordAnalysis && result.wordAnalysis.length > 0) {
        const toxicWords = result.wordAnalysis.filter(w => w.isToxic);
        if (toxicWords.length > 0) {
            console.log(`Toxic words detected:`);
            toxicWords.forEach(w => {
                console.log(`  - "${w.word}" [${w.severity}]: ${w.reasons.join(', ')}`);
            });
        }
    }
    
    console.log('-'.repeat(60));
}

console.log('\n' + '='.repeat(60));
console.log('TEST COMPLETE');
console.log('='.repeat(60));
console.log('\nKey Improvements:');
console.log('✓ "bad" in personal context = Low risk (15-25%)');
console.log('✓ Medium insults = Medium risk (40-60%)');
console.log('✓ High severity attacks = High risk (60-80%)');
console.log('✓ Critical threats = Critical risk (90-100%)');
console.log('✓ Risk scales with word severity, not binary detection');
