import { BytezAI } from '../services/bytezAI';
import { cyberDetector } from '../services/cyberDetector';

const tests = [
  "Go away, nobody likes you.",
  "Why are you even talking to us?",
  "Everyone is laughing at you behind your back.",
  "You don't belong here.",
  "Sit down and shut up, loser.",
  "Notice how nobody replied to you? Take a hint.",
  "You are invisible to us."
];

async function testExclusion() {
  console.log("🧪 Testing Exclusion/Ostracization Patterns\n");
  console.log("=" + "=".repeat(80) + "\n");
  
  const bytez = new BytezAI();
  let passCount = 0;
  let failCount = 0;
  
  for (const text of tests) {
    console.log(`📝 Text: "${text}"`);
    
    // Test with CyberDetector
    const cyberResult = await cyberDetector.analyzeText(text);
    console.log(`   CyberDetector: ${cyberResult.isCyberbullying ? 'DETECTED ✅' : 'NOT DETECTED ❌'} (${cyberResult.riskLevel}% risk)`);
    
    // Test with BytezAI
    const bytezResult = await bytez.analyzeCyberbullying(text);
    console.log(`   BytezAI: ${bytezResult.isCyberbullying ? 'DETECTED ✅' : 'NOT DETECTED ❌'} (${(bytezResult.confidence * 100).toFixed(0)}% confidence)`);
    
    if (cyberResult.isCyberbullying || bytezResult.isCyberbullying) {
      console.log(`   ✅ PASS - At least one detector found cyberbullying\n`);
      passCount++;
    } else {
      console.log(`   ❌ FAIL - Neither detector found cyberbullying\n`);
      failCount++;
    }
  }
  
  console.log("=" + "=".repeat(80));
  console.log(`📊 Results: ${passCount}/${tests.length} passing (${((passCount/tests.length)*100).toFixed(1)}%)`);
  console.log("=" + "=".repeat(80));
}

testExclusion();
