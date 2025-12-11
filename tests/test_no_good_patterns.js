/**
 * Quick test for "no good" pattern variations
 */

console.log('\n═══════════════════════════════════════════════════');
console.log('Testing "no good to the world" pattern variations');
console.log('═══════════════════════════════════════════════════\n');

const testPhrases = [
    'you are no good to the world',
    'you are not good for anything',
    'you are of no use to anyone',
    'you are no value to society',
    'you are good for nothing',
    'you are no good',
    'you serve no purpose',
    'you are completely useless',
    'you are worthless to everyone',
];

console.log('Expected results: All should be detected as CYBERBULLYING\n');

testPhrases.forEach((phrase, i) => {
    console.log(`${i + 1}. "${phrase}"`);
    console.log('   Patterns that should match:');
    
    // Check semantic patterns
    if (/no good.*to.*world/.test(phrase)) {
        console.log('   ✓ Pattern: "no good...to...world"');
    }
    if (/no good|not good/.test(phrase)) {
        console.log('   ✓ Pattern: "no good|not good"');
    }
    if (/no use|no value/.test(phrase)) {
        console.log('   ✓ Pattern: "no use|no value"');
    }
    if (/good for nothing/.test(phrase)) {
        console.log('   ✓ Pattern: "good for nothing"');
    }
    if (/worthless|useless/.test(phrase)) {
        console.log('   ✓ Pattern: "worthless|useless"');
    }
    if (/no purpose/.test(phrase)) {
        console.log('   ✓ Pattern: "no purpose"');
    }
    
    console.log();
});

console.log('═══════════════════════════════════════════════════');
console.log('To test in the app:');
console.log('1. Rebuild the APK with updated semantic patterns');
console.log('2. Type each phrase above');
console.log('3. Check console logs for:');
console.log('   - [Semantic Detector] semanticMatches');
console.log('   - Should show "Worth attack" patterns');
console.log('═══════════════════════════════════════════════════\n');
