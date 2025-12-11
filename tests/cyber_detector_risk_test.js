/**
 * Test cyberDetector (full system) for embarrassing cases
 */

const { cyberDetector } = require('../services/cyberDetector.ts');

async function testEmbarrassingCases() {
    await cyberDetector.initialize();
    
    const testCases = [
        { text: "you are embarrassing", expectedRange: "20-40%" },
        { text: "you are annoying", expectedRange: "20-40%" },
        { text: "you are pathetic", expectedRange: "50-70%" },
        { text: "you are stupid", expectedRange: "70-100%" },
        { text: "you are worthless", expectedRange: "80-100%" },
        { text: "kill yourself", expectedRange: "95-100%" }
    ];
    
    console.log('🧪 CYBER DETECTOR RISK LEVEL TESTS\n');
    console.log('='.repeat(70));
    
    for (const test of testCases) {
        const result = await cyberDetector.analyzeText(test.text);
        
        let riskCategory = 'Low Risk';
        if (result.riskLevel > 66) riskCategory = '🔴 Danger';
        else if (result.riskLevel > 33) riskCategory = '🟡 Caution';
        else riskCategory = '🟢 Low Risk';
        
        console.log(`\n"${test.text}"`);
        console.log(`  Expected: ${test.expectedRange}`);
        console.log(`  Actual: ${result.riskLevel}%`);
        console.log(`  Category: ${riskCategory}`);
        console.log(`  Flagged: ${result.isCyberbullying ? 'YES' : 'NO'}`);
        console.log(`  Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    }
    
    console.log('\n' + '='.repeat(70));
}

testEmbarrassingCases().catch(console.error);
