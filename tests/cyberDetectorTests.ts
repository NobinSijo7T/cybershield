/**
 * Cyber Detector Test Examples
 * Test cases for validating the cyberbullying detection system
 */

import { cyberDetector } from '../services/cyberDetector';

export const testCases = {
  safe: [
    "Have a wonderful day!",
    "Great work on the project",
    "Let's collaborate on this",
    "I appreciate your help",
    "Thank you so much!",
  ],
  
  lowRisk: [
    "That's not very smart",
    "I don't like this",
    "This is annoying",
    "Stop bothering me",
    "Leave me alone",
  ],
  
  mediumRisk: [
    "You're so dumb",
    "That's a stupid idea",
    "You don't know anything",
    "This is the worst thing ever",
    "You're wasting my time",
  ],
  
  highRisk: [
    "You're stupid and worthless",
    "I hate you so much",
    "You should just die",
    "Kill yourself loser",
    "Nobody likes you, you're trash",
  ],
};

/**
 * Run all test cases
 */
export async function runTests() {
  console.log('=== Cyber Detector Test Suite ===\n');
  
  await cyberDetector.initialize();
  
  const categories = Object.entries(testCases);
  
  for (const [category, examples] of categories) {
    console.log(`\n--- ${category.toUpperCase()} ---`);
    
    for (const text of examples) {
      const result = await cyberDetector.analyzeText(text);
      const status = cyberDetector.getRiskStatus(result.riskLevel);
      const dominant = cyberDetector.getDominantCategory(result.categories);
      
      console.log(`\nText: "${text}"`);
      console.log(`Risk: ${result.riskLevel}% (${status.text})`);
      console.log(`Cyberbullying: ${result.isCyberbullying ? 'YES' : 'NO'}`);
      console.log(`Dominant: ${dominant}`);
      console.log(`Confidence: ${Math.round(result.confidence * 100)}%`);
      console.log('Categories:', {
        toxicity: `${Math.round(result.categories.toxicity * 100)}%`,
        threat: `${Math.round(result.categories.threat * 100)}%`,
        insult: `${Math.round(result.categories.insult * 100)}%`,
        hate: `${Math.round(result.categories.identity_hate * 100)}%`,
      });
    }
  }
  
  console.log('\n\n=== Test Suite Complete ===');
}

/**
 * Interactive test function
 */
export async function testText(text: string) {
  await cyberDetector.initialize();
  
  const result = await cyberDetector.analyzeText(text);
  const status = cyberDetector.getRiskStatus(result.riskLevel);
  const dominant = cyberDetector.getDominantCategory(result.categories);
  
  return {
    input: text,
    riskLevel: result.riskLevel,
    status: status.text,
    severity: status.severity,
    isCyberbullying: result.isCyberbullying,
    dominantCategory: dominant,
    confidence: Math.round(result.confidence * 100),
    breakdown: {
      toxicity: Math.round(result.categories.toxicity * 100),
      threat: Math.round(result.categories.threat * 100),
      insult: Math.round(result.categories.insult * 100),
      hate: Math.round(result.categories.identity_hate * 100),
    },
  };
}

/**
 * Usage Examples:
 * 
 * // Run all tests
 * import { runTests } from '@/tests/cyberDetectorTests';
 * runTests();
 * 
 * // Test single text
 * import { testText } from '@/tests/cyberDetectorTests';
 * const result = await testText("You're an idiot");
 * console.log(result);
 */
