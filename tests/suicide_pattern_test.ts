import { cyberDetector } from '../services/cyberDetector';

async function testSuicidePatterns() {
    console.log('=== SUICIDE THREAT PATTERN TEST ===\n');
    
    await cyberDetector.initialize();
    
    const testCases = [
        'You are going to suicide',
        'You gonna suicide',
        'You will suicide',
        'You should suicide',
        'Go suicide',
        'Commit suicide',
        'Just die',
        'You going to die'
    ];

    for (const text of testCases) {
        const result = await cyberDetector.analyzeText(text);
        const icon = result.riskLevel >= 80 ? '🔴' : result.riskLevel >= 50 ? '🟠' : '🟢';
        console.log(`${icon} "${text}"`);
        console.log(`   Risk: ${result.riskLevel}% | ${result.isCyberbullying ? 'CYBERBULLYING' : 'SAFE'}`);
        console.log(`   Categories: Toxicity ${(result.categories.toxicity * 100).toFixed(0)}%, Threat ${(result.categories.threat * 100).toFixed(0)}%`);
        console.log();
    }
    
    console.log('✅ All suicide threat patterns tested!');
}

testSuicidePatterns().catch(console.error);
