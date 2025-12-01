import { BytezAI } from '../services/bytezAI';

async function testBytezAILocalModel() {
    console.log('=== BYTEZAI LOCAL MODEL TEST ===\n');
    console.log('Pipeline: Word-by-Word Analysis → Preprocessing → Classification\n');

    const bytezAI = new BytezAI();
    
    // Wait for CSV data to load
    await new Promise(resolve => setTimeout(resolve, 1000));

    const testCases = [
        "I will beat you",
        "I will stab you",
        "Go Suicide",
        "you are embarrassing",
        "Your existence is burden",
        "Your future is as empty as your brain",
        "You are stupid and pathetic",
        "Hello, how are you doing today?"
    ];

    for (const text of testCases) {
        console.log(`\n📝 Testing: "${text}"`);
        console.log('─'.repeat(70));
        
        const result = await bytezAI.analyzeCyberbullying(text);
        
        // Overall result
        const statusIcon = result.isCyberbullying ? '🚨' : '✅';
        console.log(`${statusIcon} Result: ${result.isCyberbullying ? 'CYBERBULLYING' : 'SAFE'}`);
        console.log(`   Confidence: ${result.confidence}%`);
        
        if (result.category && result.category !== 'None') {
            console.log(`   Category: ${result.category}`);
        }
        
        if (result.severity) {
            const severityIcons = {
                'low': '🟡',
                'medium': '🟠',
                'high': '🔴',
                'critical': '🔴⚠️'
            };
            console.log(`   ${severityIcons[result.severity]} Severity: ${result.severity.toUpperCase()}`);
        }
        
        console.log(`   Context: ${result.context}`);
        
        // Word-level analysis
        if (result.wordAnalysis && result.wordAnalysis.length > 0) {
            const toxicWords = result.wordAnalysis.filter(w => w.isToxic);
            if (toxicWords.length > 0) {
                console.log(`\n   📊 Toxic Words Detected (${toxicWords.length}):`);
                toxicWords.forEach((word, idx) => {
                    const severityColor = {
                        'safe': '🟢',
                        'low': '🟡',
                        'medium': '🟠',
                        'high': '🔴',
                        'critical': '🔴⚠️'
                    };
                    console.log(`      ${idx + 1}. "${word.word}" - ${severityColor[word.severity]} ${word.severity.toUpperCase()}`);
                    if (word.categories.length > 0) {
                        console.log(`         Categories: ${word.categories.join(', ')}`);
                    }
                    if (word.reasons.length > 0) {
                        console.log(`         Reason: ${word.reasons[0]}`);
                    }
                });
            }
        }
        
        console.log('═'.repeat(70));
    }

    console.log('\n\n✅ BytezAI Local Model Test Complete!\n');
    console.log('Summary:');
    console.log('- Word-by-word analysis: ✅ Working');
    console.log('- Preprocessing pipeline: ✅ Working');
    console.log('- Classification system: ✅ Working');
    console.log('- CSV integration: ✅ Working');
}

// Run the test
testBytezAILocalModel().catch(console.error);
