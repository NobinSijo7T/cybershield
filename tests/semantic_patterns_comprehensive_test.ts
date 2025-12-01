/**
 * Comprehensive Test for All 9 Semantic Pattern Categories
 * Based on user-provided cyberbullying semantic patterns
 */

import { BytezAI } from '../services/bytezAI';
import { cyberDetector } from '../services/cyberDetector';

interface TestCase {
  category: string;
  text: string;
  expectedDetection: boolean;
  minRisk?: number; // Minimum expected risk level (0-100)
}

const testCases: TestCase[] = [
  // 1. Direct Attacks on Identity (Dehumanization)
  {
    category: "Direct Attacks - Dehumanization",
    text: "You are disgusting.",
    expectedDetection: true,
    minRisk: 70
  },
  {
    category: "Direct Attacks - Dehumanization",
    text: "You are pathetic.",
    expectedDetection: true,
    minRisk: 70
  },
  {
    category: "Direct Attacks - Dehumanization",
    text: "You are a mistake.",
    expectedDetection: true,
    minRisk: 75
  },
  {
    category: "Direct Attacks - Dehumanization",
    text: "You are trash.",
    expectedDetection: true,
    minRisk: 75
  },
  {
    category: "Direct Attacks - Dehumanization",
    text: "You look like a car crash.",
    expectedDetection: true,
    minRisk: 70
  },

  // 2. Incitement to Harm / Suicide Encouragement
  {
    category: "Suicide Encouragement",
    text: "Kill yourself.",
    expectedDetection: true,
    minRisk: 95
  },
  {
    category: "Suicide Encouragement",
    text: "Drink bleach.",
    expectedDetection: true,
    minRisk: 70
  },
  {
    category: "Suicide Encouragement",
    text: "Go play in traffic.",
    expectedDetection: true,
    minRisk: 70
  },
  {
    category: "Suicide Encouragement",
    text: "End it all.",
    expectedDetection: true,
    minRisk: 80
  },

  // 3. Threats & Intimidation
  {
    category: "Conditional Threats",
    text: "If I see you at school, I will beat you up.",
    expectedDetection: true,
    minRisk: 90
  },
  {
    category: "Doxing Threats",
    text: "We know where you live.",
    expectedDetection: true,
    minRisk: 85
  },
  {
    category: "Doxing Threats",
    text: "I know which school you go to.",
    expectedDetection: true,
    minRisk: 85
  },
  {
    category: "Conditional Threats",
    text: "If you don't shut up, I will dox you.",
    expectedDetection: true,
    minRisk: 90
  },

  // 4. Undermining Competence (Rhetorical Questions)
  {
    category: "Rhetorical Questions",
    text: "Why are you so stupid?",
    expectedDetection: true,
    minRisk: 60
  },
  {
    category: "Rhetorical Questions",
    text: "Who asked for your opinion?",
    expectedDetection: true,
    minRisk: 65
  },
  {
    category: "Rhetorical Questions",
    text: "Did anyone ask you?",
    expectedDetection: true,
    minRisk: 60
  },

  // 5. Social Exclusion / Isolation
  {
    category: "Social Exclusion",
    text: "Everyone hates you.",
    expectedDetection: true,
    minRisk: 80
  },
  {
    category: "Social Exclusion",
    text: "Nobody cares about you.",
    expectedDetection: true,
    minRisk: 75
  },
  {
    category: "Social Exclusion",
    text: "We were all happier before you joined.",
    expectedDetection: true,
    minRisk: 65
  },

  // 6. Comparative Inferiority
  {
    category: "Comparative Inferiority",
    text: "My dog plays better than you.",
    expectedDetection: true,
    minRisk: 65
  },
  {
    category: "Comparative Inferiority",
    text: "Even a bot is smarter than you.",
    expectedDetection: true,
    minRisk: 65
  },
  {
    category: "Comparative Inferiority",
    text: "You are the worst player I have ever seen.",
    expectedDetection: true,
    minRisk: 75
  },

  // 7. Sexual Harassment
  {
    category: "Sexual Harassment",
    text: "Send nudes or I'll leak your chats.",
    expectedDetection: true,
    minRisk: 95
  },
  {
    category: "Sexual Harassment",
    text: "I hope you get raped.",
    expectedDetection: true,
    minRisk: 95
  },
  {
    category: "Sexual Harassment",
    text: "You little slut.",
    expectedDetection: true,
    minRisk: 80
  },

  // 8. Adversarial / Obfuscated Text
  {
    category: "Obfuscated Text - Leetspeak",
    text: "K!ll y0urs3lf",
    expectedDetection: true,
    minRisk: 90
  },
  {
    category: "Obfuscated Text - Leetspeak",
    text: "You are sh!t",
    expectedDetection: true,
    minRisk: 35  // Lower threshold for obfuscated text (harder to detect with certainty)
  },
  {
    category: "Obfuscated Text - Emoji",
    text: "You 🤡 🔫",
    expectedDetection: true,
    minRisk: 70
  },

  // 9. Passive Aggression / Sarcasm
  {
    category: "Passive Aggression",
    text: "Have you considered plastic surgery? It might help.",
    expectedDetection: true,
    minRisk: 60
  },
  {
    category: "Backhanded Compliment",
    text: "You're actually pretty for someone of your size.",
    expectedDetection: true,
    minRisk: 65
  },
  {
    category: "Sarcastic Praise",
    text: "Wow, nice job ruining the game for everyone.",
    expectedDetection: true,
    minRisk: 60
  },
  {
    category: "Sarcastic Praise",
    text: "Great work, genius.",
    expectedDetection: true,
    minRisk: 60
  }
];

async function runComprehensiveTest() {
  console.log("🧪 Starting Comprehensive Semantic Patterns Test");
  console.log("=" + "=".repeat(80) + "\n");

  const bytezAI = new BytezAI();
  let passedTests = 0;
  let failedTests = 0;
  const failures: string[] = [];

  for (const testCase of testCases) {
    console.log(`\n📝 Category: ${testCase.category}`);
    console.log(`   Text: "${testCase.text}"`);
    
    try {
      // Test with CyberDetector (uses semantic detector)
      const result = await cyberDetector.analyzeText(testCase.text);
      const isCyberbullying = result.isCyberbullying;
      const riskLevel = result.riskLevel || 0;

      // Test with BytezAI
      const bytezResult = await bytezAI.analyzeCyberbullying(testCase.text);
      
      console.log(`   CyberDetector: ${isCyberbullying ? 'CYBERBULLY' : 'NO_CYBERBULLY'} (${riskLevel}% risk)`);
      console.log(`   BytezAI: ${bytezResult.isCyberbullying ? 'CYBERBULLY' : 'NO_CYBERBULLY'} (${(bytezResult.confidence * 100).toFixed(0)}% confidence)`);
      
      // Check if detected as expected
      const cyberDetected = isCyberbullying && (!testCase.minRisk || riskLevel >= testCase.minRisk);
      const bytezDetected = bytezResult.isCyberbullying && (!testCase.minRisk || (bytezResult.confidence * 100) >= testCase.minRisk);
      
      if (testCase.expectedDetection) {
        if (cyberDetected || bytezDetected) {
          console.log(`   ✅ PASS - Detected as cyberbullying`);
          passedTests++;
        } else {
          console.log(`   ❌ FAIL - Not detected or below minimum risk threshold`);
          failedTests++;
          failures.push(`${testCase.category}: "${testCase.text}" - Expected detection but got CyberDetector: ${riskLevel}%, BytezAI: ${(bytezResult.confidence * 100).toFixed(0)}%`);
        }
      } else {
        if (!isCyberbullying && !bytezResult.isCyberbullying) {
          console.log(`   ✅ PASS - Correctly not detected`);
          passedTests++;
        } else {
          console.log(`   ❌ FAIL - False positive`);
          failedTests++;
          failures.push(`${testCase.category}: "${testCase.text}" - Expected no detection but got positive`);
        }
      }
      
      // Show category breakdown
      if (isCyberbullying && result.categories) {
        const topCategory = Object.entries(result.categories)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 2)
          .map(([cat, val]) => `${cat}: ${val}%`)
          .join(', ');
        console.log(`   🎯 Categories: ${topCategory}`);
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error}`);
      failedTests++;
      failures.push(`${testCase.category}: "${testCase.text}" - Error: ${error}`);
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("📊 Test Results");
  console.log("=".repeat(80));
  console.log(`✅ Passed: ${passedTests}/${testCases.length}`);
  console.log(`❌ Failed: ${failedTests}/${testCases.length}`);
  console.log(`📈 Success Rate: ${((passedTests / testCases.length) * 100).toFixed(1)}%`);

  if (failures.length > 0) {
    console.log("\n❌ Failed Tests:");
    failures.forEach((failure, index) => {
      console.log(`${index + 1}. ${failure}`);
    });
  }

  console.log("\n" + "=".repeat(80));
  
  process.exit(failedTests > 0 ? 1 : 0);
}

runComprehensiveTest();
