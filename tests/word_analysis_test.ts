import { CSVLoader } from '../services/csvLoader';
import { cyberbullyDetector } from '../services/semanticDetector';

async function testWordAnalysis() {
    console.log('=== WORD-LEVEL ANALYSIS TEST ===\n');

    // Initialize CSV data
    const csvData = await CSVLoader.loadNGramDict();
    cyberbullyDetector.setCSVData(csvData);

    const testCases = [
        "I will beat you",
        "I will stab you",
        "Go Suicide",
        "you are embarrassing",
        "Your existence is burden",
        "Your future is as empty as your brain",
        "You are stupid and pathetic"
    ];

    for (const text of testCases) {
        console.log(`\n📝 Analyzing: "${text}"`);
        console.log('─'.repeat(60));
        
        const result = cyberbullyDetector.classify(text);
        
        console.log(`Overall: ${result.label} (${(result.score * 100).toFixed(1)}%)`);
        console.log(`\nWord-by-Word Analysis:`);
        
        if (result.wordAnalysis && result.wordAnalysis.length > 0) {
            result.wordAnalysis.forEach((analysis, index) => {
                const icon = analysis.isToxic ? '🚨' : '✅';
                const severityColor = {
                    'safe': '🟢',
                    'low': '🟡',
                    'medium': '🟠',
                    'high': '🔴',
                    'critical': '🔴⚠️'
                };
                
                console.log(`\n  ${index + 1}. Word: "${analysis.word}"`);
                console.log(`     ${icon} Status: ${analysis.isToxic ? 'TOXIC' : 'SAFE'}`);
                console.log(`     ${severityColor[analysis.severity]} Severity: ${analysis.severity.toUpperCase()}`);
                
                if (analysis.categories.length > 0) {
                    console.log(`     🏷️  Categories: ${analysis.categories.join(', ')}`);
                }
                
                if (analysis.reasons.length > 0) {
                    console.log(`     💡 Reasons:`);
                    analysis.reasons.forEach(reason => {
                        console.log(`        - ${reason}`);
                    });
                }
            });
        } else {
            console.log('  No word analysis available');
        }
        
        console.log('\n' + '='.repeat(60));
    }

    console.log('\n\n✅ Word-level analysis test complete!');
}

// Run the test
testWordAnalysis().catch(console.error);
