const { cyberbullyDetector } = require('../services/semanticDetector.ts');

console.log('\n🛡️  CYBERSHIELD SEMANTIC DETECTOR - SEVERITY-BASED DETECTION\n');
console.log('='.repeat(80));

const examples = [
    "You are a weight to this world",
    "your future is empty as your brain", 
    "You stupid fat ugly loser",
    "I will kill you and destroy you",
    "You are dumb",
    "Kill yourself"
];

examples.forEach((text, i) => {
    console.log(`\n${i + 1}. "${text}"`);
    console.log('-'.repeat(80));
    
    const result = cyberbullyDetector.classify(text);
    
    // Severity level
    const toxicWords = result.wordAnalysis.filter(w => w.isToxic);
    const criticalCount = toxicWords.filter(w => w.severity === 'critical').length;
    const highCount = toxicWords.filter(w => w.severity === 'high').length;
    const mediumCount = toxicWords.filter(w => w.severity === 'medium').length;
    
    console.log(`Result: ${result.label} (${(result.score * 100).toFixed(0)}% severity)`);
    
    if (result.matchedSignals.some(s => s.includes('DANGEROUS_CYBERBULLYING'))) {
        console.log('⚠️  DANGER LEVEL: EXTREME (Multiple high-severity words detected)');
    } else if (criticalCount > 0) {
        console.log('⚠️  DANGER LEVEL: CRITICAL');
    } else if (highCount > 0) {
        console.log('⚠️  DANGER LEVEL: HIGH');
    } else if (mediumCount > 0) {
        console.log('⚠️  DANGER LEVEL: MEDIUM');
    }
    
    console.log(`\nToxic Words Detected: ${toxicWords.length}`);
    toxicWords.forEach(w => {
        const icon = w.severity === 'critical' ? '🔴' : w.severity === 'high' ? '🟠' : '🟡';
        console.log(`  ${icon} "${w.word}" - ${w.severity.toUpperCase()}`);
    });
    
    if (result.semanticMatches.length > 0) {
        console.log(`\nSemantic Patterns:`);
        result.semanticMatches.slice(0, 2).forEach(m => {
            console.log(`  • ${m}`);
        });
    }
});

console.log('\n' + '='.repeat(80));
console.log('DETECTION RULES:');
console.log('  🔴 CRITICAL words (kill, murder, suicide, etc.) → Instant flag');
console.log('  🟠 HIGH words (stupid, ugly, fat, etc.) → Instant flag');  
console.log('  🟡 MEDIUM words (annoying, irritating, etc.) → 2+ triggers flag');
console.log('  ⚠️  DANGEROUS: 2+ HIGH or CRITICAL words → Maximum severity');
console.log('='.repeat(80));
