/**
 * Test cases for improved cyberbullying detection
 */

import { bytezAI } from '../services/bytezAI';

const testCases = [
    {
        text: "Nobody likes you",
        expected: true,
        description: "Rejection phrase"
    },
    {
        text: "You are talking like a bitch",
        expected: true,
        description: "Gendered insult"
    },
    {
        text: "You are good for nothing",
        expected: true,
        description: "Dehumanizing language"
    },
    {
        text: "You are the worst mistake the world has seen",
        expected: true,
        description: "Extreme dehumanization"
    },
    {
        text: "Everyone hates you",
        expected: true,
        description: "Isolation/rejection"
    },
    {
        text: "You're a waste of space",
        expected: true,
        description: "Dehumanizing insult"
    },
    {
        text: "Shut up, nobody asked",
        expected: true,
        description: "Dismissive language"
    },
    {
        text: "You can't do anything right",
        expected: true,
        description: "Competence attack"
    },
    {
        text: "Hello, how are you doing today?",
        expected: false,
        description: "Friendly greeting"
    },
    {
        text: "Thanks for your help!",
        expected: false,
        description: "Positive message"
    }
];

export async function runImprovedDetectionTests() {
    console.log('\n=== Running Improved Cyberbullying Detection Tests ===\n');

    let passed = 0;
    let failed = 0;

    for (const testCase of testCases) {
        try {
            const result = await bytezAI.analyzeCyberbullying(testCase.text);
            const isCorrect = result.isCyberbullying === testCase.expected;

            if (isCorrect) {
                passed++;
                console.log(`✅ PASS: ${testCase.description}`);
                console.log(`   Text: "${testCase.text}"`);
                console.log(`   Detected: ${result.isCyberbullying} (Confidence: ${result.confidence}%)`);
                if (result.category) console.log(`   Category: ${result.category}`);
            } else {
                failed++;
                console.log(`❌ FAIL: ${testCase.description}`);
                console.log(`   Text: "${testCase.text}"`);
                console.log(`   Expected: ${testCase.expected}, Got: ${result.isCyberbullying}`);
                console.log(`   Confidence: ${result.confidence}%`);
            }
            console.log('');

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            failed++;
            console.log(`❌ ERROR: ${testCase.description}`);
            console.log(`   ${error}`);
            console.log('');
        }
    }

    console.log('=== Test Results ===');
    console.log(`Total: ${testCases.length}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);

    return { passed, failed, total: testCases.length };
}

// Export test cases for use in the app
export { testCases };
