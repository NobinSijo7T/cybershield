import { BytezAI } from '../services/bytezAI';
import { CSVLoader } from '../services/csvLoader';
import { cyberbullyDetector } from '../services/semanticDetector';

async function compareModels() {
    console.log('=== MODEL COMPARISON TEST ===\n');
    console.log('Comparing BytezAI Local Model vs Semantic Detector\n');

    // Initialize models
    const bytezAI = new BytezAI();
    const csvData = await CSVLoader.loadNGramDict();
    cyberbullyDetector.setCSVData(csvData);
    
    // Wait for BytezAI to load
    await new Promise(resolve => setTimeout(resolve, 1000));

    const testCases = [
        "I will stab you",
        "you are embarrassing",
        "Your existence is burden",
        "Hello friend"
    ];

    for (const text of testCases) {
        console.log(`\n📝 Testing: "${text}"`);
        console.log('='.repeat(70));
        
        // BytezAI Local Model
        const bytezResult = await bytezAI.analyzeCyberbullying(text);
        console.log('\n🤖 BytezAI Local Model:');
        console.log(`   Result: ${bytezResult.isCyberbullying ? 'CYBERBULLYING' : 'SAFE'}`);
        console.log(`   Confidence: ${bytezResult.confidence}%`);
        console.log(`   Severity: ${bytezResult.severity || 'N/A'}`);
        console.log(`   Category: ${bytezResult.category}`);
        if (bytezResult.wordAnalysis) {
            const toxicWords = bytezResult.wordAnalysis.filter(w => w.isToxic);
            console.log(`   Toxic Words: ${toxicWords.length > 0 ? toxicWords.map(w => w.word).join(', ') : 'none'}`);
        }
        
        // Semantic Detector
        const semanticResult = cyberbullyDetector.classify(text);
        console.log('\n🧠 Semantic Detector:');
        console.log(`   Result: ${semanticResult.label}`);
        console.log(`   Score: ${(semanticResult.score * 100).toFixed(1)}%`);
        console.log(`   High Severity: ${semanticResult.highSeverity ? 'Yes' : 'No'}`);
        console.log(`   Patterns: ${semanticResult.semanticMatches.length > 0 ? semanticResult.semanticMatches.join(', ') : 'none'}`);
        if (semanticResult.wordAnalysis) {
            const toxicWords = semanticResult.wordAnalysis.filter(w => w.isToxic);
            console.log(`   Toxic Words: ${toxicWords.length > 0 ? toxicWords.map(w => w.word).join(', ') : 'none'}`);
        }
        
        // Agreement check
        const agree = (bytezResult.isCyberbullying && semanticResult.label === 'CYBERBULLY') ||
                     (!bytezResult.isCyberbullying && semanticResult.label === 'NO_CYBERBULLY');
        console.log(`\n${agree ? '✅' : '⚠️'} Agreement: ${agree ? 'MATCH' : 'DIFFER'}`);
    }

    console.log('\n\n' + '='.repeat(70));
    console.log('✅ Comparison Test Complete!');
    console.log('\nBoth models use:');
    console.log('- ✅ Word-by-word analysis');
    console.log('- ✅ CSV integration (1,873 n-grams)');
    console.log('- ✅ Preprocessing pipeline');
    console.log('- ✅ Classification logic');
}

compareModels().catch(console.error);
