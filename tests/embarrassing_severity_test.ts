/**
 * Test specific sentence reported by user
 */

import { cyberbullyDetector } from '../services/semanticDetector';

const testCases = [
    "you are embarrassing",
    "you are embarrassed",
    "that's embarrassing",
    "this is embarrassing",
    "you embarrass me",
    "stop embarrassing yourself",
    "you're an embarrassment",
    "you are annoying",
    "you are pathetic",
    "you look weird"
];

console.log('🧪 EMBARRASSING & MILD SEVERITY TESTS\n');
console.log('='.repeat(70));

for (const text of testCases) {
    const result = cyberbullyDetector.classify(text);
    const riskPercent = (result.score * 100).toFixed(0);
    const label = result.label === 'CYBERBULLY' ? '🔴 CYBERBULLY' : '🟢 SAFE';
    
    console.log(`\n"${text}"`);
    console.log(`  ${label} - Risk: ${riskPercent}%`);
    console.log(`  Severity: ${result.highSeverity ? 'HIGH' : 'NORMAL'}`);
    
    if (result.semanticMatches.length > 0) {
        console.log(`  Patterns: ${result.semanticMatches.slice(0, 2).join(', ')}`);
    }
    
    if (result.wordAnalysis && result.wordAnalysis.some(w => w.isToxic)) {
        const toxicWords = result.wordAnalysis.filter(w => w.isToxic);
        console.log(`  Toxic words: ${toxicWords.map(w => `${w.word}[${w.severity}]`).join(', ')}`);
    }
}

console.log('\n' + '='.repeat(70));
