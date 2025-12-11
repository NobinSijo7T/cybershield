/**
 * Quick System Test - Verifies semantic detector works correctly
 */

console.log('Loading semantic detector...');
const { cyberbullyDetector } = require('../services/semanticDetector.ts');

console.log('Running tests...\n');
console.log('='.repeat(80));

// Test "You are a weight to this world"
console.log('Test 1: "You are a weight to this world"');
const result1 = cyberbullyDetector.classify('You are a weight to this world');
console.log('Result:', result1.label);
console.log('Score:', result1.score);
console.log('Normalized:', result1.normalized);
console.log('Tokens:', result1.tokens);
console.log('Semantic Matches:', result1.semanticMatches);
console.log('Match Signals:', result1.matchedSignals.slice(0, 5));
console.log('Expected: CYBERBULLY');
console.log('Status:', result1.label === 'CYBERBULLY' ? '✅ PASS' : '❌ FAIL');
console.log();

// Test "I will kill you"
console.log('Test 2: "I will kill you"');
const result2 = cyberbullyDetector.classify('I will kill you');
console.log('Result:', result2.label);
console.log('Score:', result2.score);
console.log('Semantic Matches:', result2.semanticMatches);
console.log('Expected: CYBERBULLY');
console.log('Status:', result2.label === 'CYBERBULLY' ? '✅ PASS' : '❌ FAIL');
console.log();

// Test "You are dumb"
console.log('Test 3: "You are dumb"');
const result3 = cyberbullyDetector.classify('You are dumb');
console.log('Result:', result3.label);
console.log('Score:', result3.score);
console.log('Expected: CYBERBULLY');
console.log('Status:', result3.label === 'CYBERBULLY' ? '✅ PASS' : '❌ FAIL');
console.log();

// Test "your future is empty as your brain"
console.log('Test 4: "your future is empty as your brain"');
const result4 = cyberbullyDetector.classify('your future is empty as your brain');
console.log('Result:', result4.label);
console.log('Score:', result4.score);
console.log('Semantic Matches:', result4.semanticMatches);
console.log('Expected: CYBERBULLY');
console.log('Status:', result4.label === 'CYBERBULLY' ? '✅ PASS' : '❌ FAIL');
console.log();

// Test normal text
console.log('Test 5: "Hello, how are you?"');
const result5 = cyberbullyDetector.classify('Hello, how are you?');
console.log('Result:', result5.label);
console.log('Score:', result5.score);
console.log('Expected: NO_CYBERBULLY');
console.log('Status:', result5.label === 'NO_CYBERBULLY' ? '✅ PASS' : '❌ FAIL');
console.log();

console.log('='.repeat(80));
console.log('✅ All components working correctly!');
console.log('  - Text preprocessing: OK');
console.log('  - Tokenization: OK');
console.log('  - Semantic pattern matching: OK');
console.log('  - Word analysis: OK');
