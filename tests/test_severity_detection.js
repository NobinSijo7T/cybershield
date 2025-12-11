const { cyberbullyDetector } = require('../services/semanticDetector.ts');

console.log('='.repeat(80));
console.log('ENHANCED SEVERITY-BASED DETECTION TEST');
console.log('='.repeat(80));
console.log();

const tests = [
    { text: "You are stupid", expected: "CYBERBULLY", reason: "1 high word (stupid)" },
    { text: "You stupid idiot", expected: "CYBERBULLY", reason: "2 high words (dangerous)" },
    { text: "Kill yourself now", expected: "CYBERBULLY", reason: "1+ critical words (dangerous)" },
    { text: "You fat ugly loser", expected: "CYBERBULLY", reason: "3 high words (very dangerous)" },
    { text: "Your brain is empty", expected: "CYBERBULLY", reason: "1 high word (empty)" },
    { text: "Nice work!", expected: "NO_CYBERBULLY", reason: "No toxic words" },
    { text: "You are annoying sometimes", expected: "CYBERBULLY", reason: "1 medium word but context" }
];

tests.forEach((test, index) => {
    console.log(`Test ${index + 1}: "${test.text}"`);
    const result = cyberbullyDetector.classify(test.text);
    
    console.log(`  Result: ${result.label} (score: ${result.score.toFixed(2)})`);
    console.log(`  Expected: ${test.expected}`);
    console.log(`  Reason: ${test.reason}`);
    
    // Show word analysis
    const toxicWords = result.wordAnalysis.filter(w => w.isToxic);
    if (toxicWords.length > 0) {
        console.log(`  Toxic Words:`);
        toxicWords.forEach(w => {
            console.log(`    - "${w.word}": ${w.severity.toUpperCase()}`);
        });
    }
    
    // Show key signals
    const dangerousSignal = result.matchedSignals.find(s => s.includes('DANGEROUS_CYBERBULLYING'));
    const criticalSignal = result.matchedSignals.find(s => s.includes('CRITICAL_WORDS'));
    const highSignal = result.matchedSignals.find(s => s.includes('HIGH_SEVERITY_WORDS'));
    
    if (dangerousSignal) {
        console.log(`  ⚠️  DANGEROUS: ${dangerousSignal}`);
    } else if (criticalSignal) {
        console.log(`  ⚠️  ${criticalSignal}`);
    } else if (highSignal) {
        console.log(`  ⚠️  ${highSignal}`);
    }
    
    const status = result.label === test.expected ? '✅ PASS' : '❌ FAIL';
    console.log(`  Status: ${status}`);
    console.log();
});

console.log('='.repeat(80));
console.log('SEVERITY RULES:');
console.log('  - 1+ CRITICAL word → Instant CYBERBULLY flag');
console.log('  - 2+ CRITICAL words OR 1 CRITICAL + 1 HIGH → DANGEROUS CYBERBULLYING');
console.log('  - 1+ HIGH word → Instant CYBERBULLY flag');
console.log('  - 2+ HIGH words → DANGEROUS CYBERBULLYING');
console.log('  - 2+ MEDIUM words → Likely CYBERBULLY flag');
console.log('='.repeat(80));
