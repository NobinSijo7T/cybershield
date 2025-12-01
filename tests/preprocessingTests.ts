/**
 * Test the improved detection with preprocessing
 */

import { bytezAI } from '../services/bytezAI';

const testCases = [
    "you are no good to this world",
    "you are not good for anything",
    "Nobody likes you",
    "You are talking like a bitch",
    "You are good for nothing",
    "You are the worst mistake the world has seen",
    "Hello, how are you?",
    "Thank you for your help!",
];

async function runTests() {
    console.log('=== Testing Improved Cyberbullying Detection ===\n');

    for (const testText of testCases) {
        console.log(`Testing: "${testText}"`);
        const result = await bytezAI.analyzeCyberbullying(testText);
        console.log(`Result: ${result.isCyberbullying ? '🚨 CYBERBULLYING' : '✅ SAFE'}`);
        console.log(`Confidence: ${result.confidence}%`);
        console.log(`Category: ${result.category}`);
        console.log('---\n');
    }
}

// Run tests
runTests().catch(console.error);
