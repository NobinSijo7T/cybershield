/**
 * Debug Test - Test Semantic Detector with Detailed Logging (CommonJS)
 * Run with: node tests/debug_test_simple.js
 */

// Test the specific case
console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║         DEBUG TEST - SEMANTIC DETECTOR (Simple JS)           ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

const testCases = [
    { text: 'you are good for nothing', expected: 'CYBERBULLY', description: 'Phrase "good for nothing" should be detected' },
    { text: 'You are stupid', expected: 'CYBERBULLY', description: 'Direct insult' },
    { text: 'I hate you', expected: 'CYBERBULLY', description: 'Hate expression' },
    { text: 'Hello friend', expected: 'SAFE', description: 'Friendly greeting' },
    { text: 'You are amazing', expected: 'SAFE', description: 'Compliment' },
    { text: 'kill yourself', expected: 'CYBERBULLY', description: 'Critical threat' },
];

console.log('[Debug] Test will check semantic pattern matching for these phrases:\n');
testCases.forEach((tc, i) => {
    console.log(`  ${i+1}. "${tc.text}" -> Expected: ${tc.expected}`);
});

console.log('\n[Debug] To verify:');
console.log('  1. Open the app and type each phrase');
console.log('  2. Check the console logs for:');
console.log('     - [Semantic Detector] classify() input');
console.log('     - [Semantic Detector] normalized');
console.log('     - [Semantic Detector] tokens');
console.log('     - [Semantic Detector] semanticMatches');
console.log('  3. For BERT (if loaded), check:');
console.log('     - [BERT Detector] Tokens');
console.log('     - [BERT Detector] Logits');
console.log('     - [BERT Detector] Result\n');

console.log('[Debug] Expected behaviors:');
console.log('  ✓ "good for nothing" should match semantic phrase and show as cyberbullying');
console.log('  ✓ "you are stupid" should match intelligence_attack pattern');
console.log('  ✓ "hello friend" should show NO_CYBERBULLY with low score');
console.log('  ✓ "kill yourself" should trigger CRITICAL threat detection\n');

console.log('[Debug] If BERT shows "not cyberbullying" for everything:');
console.log('  1. Check if model file is correctly bundled (106MB cyberbully_model.tflite)');
console.log('  2. Verify tokenizer vocab.txt is loaded (227KB)');
console.log('  3. Check logits output - should have dynamic range, not all near-equal');
console.log('  4. Model may have been trained on different data - semantic fallback will work\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Run the app and test manually with console logs enabled.');
console.log('Use `adb logcat | grep -E "Semantic|BERT"` to filter logs.');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
