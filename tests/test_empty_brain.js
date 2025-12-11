const { cyberbullyDetector } = require('../services/semanticDetector.ts');

console.log('Testing: "your future is empty as your brain"\n');
const result = cyberbullyDetector.classify('your future is empty as your brain');

console.log('Result:', result.label);
console.log('Score:', result.score);
console.log('Original:', result.original);
console.log('Normalized:', result.normalized);
console.log('Tokens:', result.tokens);
console.log('Semantic matches:', result.semanticMatches);
console.log('Match signals:', result.matchedSignals);
console.log('\nWord Analysis:');
if (result.wordAnalysis) {
    result.wordAnalysis.forEach(word => {
        console.log(`  - "${word.word}": ${word.isToxic ? 'TOXIC' : 'safe'} (${word.severity})`);
    });
}
