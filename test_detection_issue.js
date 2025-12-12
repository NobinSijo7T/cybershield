// Test the semantic detector with problematic inputs
const { cyberbullyDetector } = require('./services/semanticDetector');

const testCases = [
  "you are a fool",
  "you are good for nothing"
];

console.log('Testing Semantic Detector:\n');
testCases.forEach(text => {
  const result = cyberbullyDetector.classify(text);
  console.log(`Input: "${text}"`);
  console.log(`Result: ${result.label}`);
  console.log(`Score: ${result.score.toFixed(3)}`);
  console.log(`Matched Signals: ${JSON.stringify(result.matchedSignals)}`);
  console.log(`Semantic Matches: ${JSON.stringify(result.semanticMatches)}`);
  console.log(`Word Analysis:`, result.wordAnalysis?.map(w => `${w.word}(${w.severity})`).join(', '));
  console.log('---\n');
});
