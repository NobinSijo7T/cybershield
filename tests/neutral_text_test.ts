/**
 * Test neutral text to ensure no false positives
 */

const { cyberDetector } = require('../services/cyberDetector');

async function testNeutralText() {
    await cyberDetector.initialize();
    
    const neutralTexts = [
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
    ];

    const mildlyNegativeButNotBullying = [
        "I disagree with that",
        "That's not quite right",
        "I don't think so",
        "Maybe we should try something else",
        "This could be improved",
        "I'm not sure about that",
        "Let's think about it",
        "That's a bit confusing",
        "Can you explain that again?"
    ];

    console.log('\n=== NEUTRAL TEXT TESTS ===\n');
    
    let passed = 0;
    let failed = 0;

    // Test clearly neutral texts
    for (const text of neutralTexts) {
        const result = await cyberDetector.analyzeText(text);
        const status = !result.isCyberbullying ? '✅ PASS' : '❌ FAIL';
        
        if (!result.isCyberbullying) {
            passed++;
        } else {
            failed++;
            console.log(`${status}: "${text}"`);
            console.log(`  Risk: ${result.riskLevel}%, Confidence: ${(result.confidence * 100).toFixed(1)}%`);
            console.log(`  Categories:`, result.categories);
        }
    }

    console.log('\n=== MILDLY NEGATIVE (BUT NOT BULLYING) TESTS ===\n');

    // Test mildly negative texts that should NOT be flagged
    for (const text of mildlyNegativeButNotBullying) {
        const result = await cyberDetector.analyzeText(text);
        const status = !result.isCyberbullying ? '✅ PASS' : '❌ FAIL';
        
        if (!result.isCyberbullying) {
            passed++;
        } else {
            failed++;
            console.log(`${status}: "${text}"`);
            console.log(`  Risk: ${result.riskLevel}%, Confidence: ${(result.confidence * 100).toFixed(1)}%`);
            console.log(`  Categories:`, result.categories);
        }
    }

    console.log('\n=== ACTUAL CYBERBULLYING (SHOULD BE DETECTED) ===\n');

    const actualBullying = [
        "You are stupid",
        "Nobody likes you",
        "You should die",
        "Kill yourself",
        "Everyone hates you",
        "You are worthless"
    ];

    // Test actual cyberbullying - these SHOULD be flagged
    for (const text of actualBullying) {
        const result = await cyberDetector.analyzeText(text);
        const status = result.isCyberbullying ? '✅ PASS' : '❌ FAIL';
        
        if (result.isCyberbullying) {
            passed++;
        } else {
            failed++;
        }
        
        console.log(`${status}: "${text}"`);
        console.log(`  Risk: ${result.riskLevel}%, Confidence: ${(result.confidence * 100).toFixed(1)}%`);
        console.log(`  Categories:`, result.categories);
    }

    console.log('\n=== SUMMARY ===');
    console.log(`Total Tests: ${passed + failed}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Accuracy: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
}

testNeutralText().catch(console.error);
